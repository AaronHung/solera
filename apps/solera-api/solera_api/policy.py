from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from urllib.parse import urlparse

from .auth import Principal
from .config import Settings
from .contracts import PageContext, ToolLimits, ToolManifest


class PolicyDenied(RuntimeError):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


@dataclass
class KillSwitches:
    global_disabled: bool = False
    tenants: set[str] = field(default_factory=set)
    domains: set[str] = field(default_factory=set)
    adapters: set[str] = field(default_factory=set)
    connectors: set[str] = field(default_factory=set)
    models: set[str] = field(default_factory=set)
    capabilities: set[str] = field(default_factory=set)


def default_tool_manifests(settings: Settings) -> dict[str, ToolManifest]:
    query_limits = ToolLimits(
        max_range_seconds=settings.max_range_seconds,
        max_points=settings.max_points,
        timeout_ms=settings.easy_pi_timeout_ms,
    )
    return {
        "query_current_value": ToolManifest(
            name="query_current_value",
            description="Read the current value of an allowlisted PI Tag",
            required_roles=["engineer", "operator", "viewer"],
            limits=ToolLimits(max_range_seconds=60, max_points=1, timeout_ms=10_000),
            model_data_policy="summary-only",
        ),
        "query_timeseries": ToolManifest(
            name="query_timeseries",
            description="Read recorded values for an allowlisted PI Tag and time range",
            required_roles=["engineer", "operator", "viewer"],
            limits=query_limits,
            model_data_policy="summary-only",
        ),
        "compare_series": ToolManifest(
            name="compare_series",
            description="Compare deterministic summaries and aligned points",
            required_roles=["engineer", "operator", "viewer"],
            limits=query_limits,
            model_data_policy="summary-only",
        ),
        "create_viewspec": ToolManifest(
            name="create_viewspec",
            description="Create a validated specification for trusted local Widgets",
            required_roles=["engineer", "operator", "viewer"],
            limits=ToolLimits(max_range_seconds=60, max_points=24, timeout_ms=5000),
            model_data_policy="none",
        ),
        "search_asset_knowledge": ToolManifest(
            name="search_asset_knowledge",
            description="Search tenant-scoped indexed documents and return citations",
            required_roles=["engineer", "operator", "viewer"],
            limits=ToolLimits(max_range_seconds=60, max_points=10, timeout_ms=5000),
            model_data_policy="summary-only",
        ),
    }


class PolicyEngine:
    def __init__(
        self,
        settings: Settings,
        *,
        switches: KillSwitches | None = None,
        manifests: dict[str, ToolManifest] | None = None,
    ) -> None:
        self.settings = settings
        self.switches = switches or KillSwitches()
        self.manifests = manifests or default_tool_manifests(settings)

    def set_switch(self, scope_type: str, scope_id: str, enabled: bool) -> None:
        if scope_type == "global":
            self.switches.global_disabled = enabled
            return
        collections = {
            "tenant": self.switches.tenants,
            "domain": self.switches.domains,
            "adapter": self.switches.adapters,
            "connector": self.switches.connectors,
            "model": self.switches.models,
            "capability": self.switches.capabilities,
        }
        collection = collections.get(scope_type)
        if collection is None:
            raise ValueError("unsupported kill-switch scope")
        if enabled:
            collection.add(scope_id)
        else:
            collection.discard(scope_id)

    def validate_page_context(self, principal: Principal, context: PageContext) -> None:
        if context.tenant_id != principal.tenant_id:
            raise PolicyDenied("TENANT_MISMATCH", "Page context belongs to another tenant")
        parsed = urlparse(context.page.url)
        hostname = (parsed.hostname or "").lower()
        if hostname not in {domain.lower() for domain in self.settings.allowed_domains}:
            raise PolicyDenied("DOMAIN_NOT_ALLOWED", "Page domain is not approved")
        if hostname in self.switches.domains:
            raise PolicyDenied("DOMAIN_DISABLED", "Page domain is disabled")
        adapter_id = context.page.adapter_id
        if adapter_id and adapter_id in self.switches.adapters:
            raise PolicyDenied("ADAPTER_DISABLED", "Page adapter is disabled")
        confirmed_assets = {
            candidate.asset_id for candidate in context.candidate_assets if candidate.confirmed
        }
        if (
            confirmed_assets
            and "*" not in principal.asset_scopes
            and not confirmed_assets.issubset(principal.asset_scopes)
        ):
            raise PolicyDenied("ASSET_SCOPE_DENIED", "Asset is outside the user's scope")

    def authorize_tool(
        self,
        *,
        principal: Principal,
        tool_name: str,
        range_start: datetime | None = None,
        range_end: datetime | None = None,
        points: int | None = None,
    ) -> ToolManifest:
        if self.switches.global_disabled:
            raise PolicyDenied("SOLERA_DISABLED", "Solera is globally disabled")
        if principal.tenant_id in self.switches.tenants:
            raise PolicyDenied("TENANT_DISABLED", "Tenant is disabled")
        if tool_name in self.switches.capabilities:
            raise PolicyDenied("CAPABILITY_DISABLED", "Capability is disabled")
        if tool_name.startswith("query_") and "easy-pi" in self.switches.connectors:
            raise PolicyDenied("CONNECTOR_DISABLED", "Easy PI connector is disabled")

        manifest = self.manifests.get(tool_name)
        if manifest is None:
            raise PolicyDenied("TOOL_NOT_REGISTERED", "Tool is not registered")
        if manifest.read_only is not True:
            raise PolicyDenied("WRITE_TOOL_FORBIDDEN", "Mutating tools are forbidden in v0.1")
        if not principal.roles.intersection(manifest.required_roles):
            raise PolicyDenied("ROLE_DENIED", "User role cannot execute this tool")

        if range_start is not None or range_end is not None:
            if range_start is None or range_end is None:
                raise PolicyDenied("INVALID_RANGE", "A complete time range is required")
            if range_start.tzinfo is None or range_end.tzinfo is None:
                raise PolicyDenied("INVALID_RANGE", "Time range must include timezone")
            seconds = (range_end - range_start).total_seconds()
            if seconds <= 0:
                raise PolicyDenied("INVALID_RANGE", "Time range end must be after start")
            if seconds > manifest.limits.max_range_seconds:
                raise PolicyDenied("RANGE_LIMIT", "Time range exceeds tool policy")

        if points is not None and (points < 1 or points > manifest.limits.max_points):
            raise PolicyDenied("POINT_LIMIT", "Requested point count exceeds tool policy")
        return manifest

    def model_allowed(self, model_name: str) -> bool:
        return not self.switches.global_disabled and model_name not in self.switches.models

    def capability_snapshot(self) -> list[dict[str, object]]:
        return [
            manifest.model_dump(by_alias=True)
            for manifest in sorted(self.manifests.values(), key=lambda item: item.name)
        ]
