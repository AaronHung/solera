from __future__ import annotations

from typing import Literal

from pydantic import Field

from ..config import Settings
from ..contracts import ContractModel


class ProductizationGate(ContractModel):
    gate_id: str
    capability: str
    requested: bool
    status: Literal["enabled", "core-ready", "deferred", "blocked"]
    reasons: list[str] = Field(default_factory=list)
    required_evidence: list[str] = Field(default_factory=list)


class ProductizationGateReport(ContractModel):
    report_version: Literal["0.1"] = "0.1"
    core_demo_ready: Literal[True] = True
    gates: list[ProductizationGate]
    decision: str


class ProductizationGateError(RuntimeError):
    pass


def evaluate_productization_gates(settings: Settings) -> ProductizationGateReport:
    pi_ready = bool(settings.loop1_pi_omf_endpoint and settings.loop1_pi_namespace)
    pi_status = (
        "enabled"
        if settings.loop1_pi_mirror_enabled and pi_ready
        else "blocked"
        if settings.loop1_pi_mirror_enabled
        else "deferred"
    )
    external_bus_requested = settings.loop1_external_event_bus != "in-process"
    gates = [
        ProductizationGate(
            gate_id="gate-f-pi-mirror",
            capability="PI OMF mirror",
            requested=settings.loop1_pi_mirror_enabled,
            status=pi_status,
            reasons=(
                []
                if pi_status == "enabled"
                else [
                    "Core LOOP-1 replay is PI-independent.",
                    "Formal OMF/AF/Data Archive permissions and cleanup proof are absent.",
                ]
            ),
            required_evidence=[
                "approved isolated PI namespace",
                "OMF or pre-provisioned Point write permission",
                "retention and cleanup test",
                "rollback and duplicate replay test",
            ],
        ),
        ProductizationGate(
            gate_id="gate-g-dwsim-opcua",
            capability="DWSIM / OPC UA calibration",
            requested=settings.loop1_dwsim_opcua_enabled,
            status="blocked" if settings.loop1_dwsim_opcua_enabled else "deferred",
            reasons=[
                "Reduced-order equations satisfy the current Agent validation scope.",
                "No domain-reviewed DWSIM model or OPC UA namespace is accepted.",
            ],
            required_evidence=[
                "versioned DWSIM model",
                "OPC UA security and namespace review",
                "VVUQ comparison against declared synthetic envelopes",
            ],
        ),
        ProductizationGate(
            gate_id="gate-h-multimodal",
            capability="Multimodal document and field-image intake",
            requested=settings.loop1_multimodal_enabled,
            status="blocked" if settings.loop1_multimodal_enabled else "deferred",
            reasons=[
                "Hero critical path uses governed text fixtures.",
                (
                    "Image confidence, retention, sensitivity, and "
                    "human-confirmation policy are not accepted."
                ),
            ],
            required_evidence=[
                "approved image/document data policy",
                "OCR/vision confidence evaluation",
                "unit and timestamp extraction tests",
                "human confirmation and deletion workflow",
            ],
        ),
        ProductizationGate(
            gate_id="gate-i-event-bus",
            capability="Event bus",
            requested=external_bus_requested,
            status="blocked" if external_bus_requested else "core-ready",
            reasons=(
                [
                    "No sustained-load or multi-process requirement justifies an external broker.",
                    (
                        "NATS/Redpanda deployment, retention, replay, and tenant "
                        "isolation are not validated."
                    ),
                ]
                if external_bus_requested
                else [
                    "Bounded in-process publish/subscribe is sufficient for the core demo."
                ]
            ),
            required_evidence=[
                "measured throughput and durability requirement",
                "tenant isolation test",
                "consumer replay and poison-message handling",
                "operational ownership and recovery SOP",
            ],
        ),
    ]
    return ProductizationGateReport(
        gates=gates,
        decision=(
            "Ship the self-contained 12-week core. Keep PI mirror, DWSIM/OPC UA, "
            "multimodal intake, and external broker disabled until their evidence "
            "gates pass."
        ),
    )


def enforce_productization_gates(report: ProductizationGateReport) -> None:
    blocked = [gate for gate in report.gates if gate.requested and gate.status == "blocked"]
    if blocked:
        capabilities = ", ".join(gate.capability for gate in blocked)
        raise ProductizationGateError(
            f"requested LOOP-1 productization gates are not satisfied: {capabilities}"
        )
