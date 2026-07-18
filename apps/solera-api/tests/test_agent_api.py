from __future__ import annotations

import json
from datetime import datetime

from easy_pi import (
    ConnectorCapabilities,
    CurrentValue,
    DataPoint,
    PointQuality,
    TagSeries,
)
from fastapi.testclient import TestClient
from solera_api.config import Settings
from solera_api.main import create_app
from solera_api.model_gateway import DisabledModelGateway


class FakeConnector:
    capabilities = ConnectorCapabilities(
        limits={"maxRangeSeconds": 604800, "maxPoints": 5000, "timeoutMs": 1000}
    )

    async def close(self) -> None:
        return None

    async def current(self, tag: str) -> CurrentValue:
        return CurrentValue(
            tag=tag,
            value_type="System.Single",
            point=DataPoint(
                timestamp=datetime.fromisoformat("2026-07-18T11:00:00+08:00"),
                value=42.0,
                quality=PointQuality.GOOD,
            ),
        )

    async def recorded(
        self,
        tag: str,
        *,
        start: datetime,
        end: datetime,
        max_points: int = 1000,
        boundary_type: int = 2,
    ) -> TagSeries:
        offset = 0 if tag == "CDT158" else 5
        return TagSeries(
            tag=tag,
            value_type="System.Single",
            points=[
                DataPoint(
                    timestamp=start,
                    value=10.0 + offset,
                    quality=PointQuality.GOOD,
                ),
                DataPoint(
                    timestamp=end,
                    value=20.0 + offset,
                    quality=PointQuality.GOOD,
                ),
            ],
        )


def page_context(host: str = "easypi.iiotfab.com") -> dict[str, object]:
    return {
        "contextVersion": "0.1",
        "tenantId": "tenant-demo",
        "tabSessionId": "tab-1",
        "capturedAt": "2026-07-18T11:00:00+08:00",
        "page": {
            "url": f"https://{host}/swagger/ui/index",
            "urlPattern": f"https://{host}/*",
            "systemType": "easy-pi",
            "viewType": "api-explorer",
            "title": "Easy PI",
            "adapterId": "easy-pi",
            "adapterVersion": "0.1.0",
        },
        "candidateAssets": [],
        "timeContext": {
            "start": "2026-07-18T10:00:00+08:00",
            "end": "2026-07-18T11:00:00+08:00",
            "timezone": "Asia/Taipei",
            "source": "user",
            "confirmed": True,
        },
        "sensitivity": "internal",
    }


def make_client(requests_per_minute: int = 30) -> TestClient:
    settings = Settings(
        allowed_domains=["easypi.iiotfab.com", "pivision.iiotfab.com"],
        easy_pi_timeout_ms=1000,
        database_url="sqlite+aiosqlite:///:memory:",
        tenant_requests_per_minute=requests_per_minute,
    )
    return TestClient(
        create_app(
            settings=settings,
            connector=FakeConnector(),
            model_gateway=DisabledModelGateway(),
        )
    )


def parse_events(response) -> list[dict[str, object]]:
    return [json.loads(line) for line in response.iter_lines() if line]


def test_compare_stream_contains_deterministic_analysis_and_evidence() -> None:
    with make_client() as client:
        with client.stream(
            "POST",
            "/v1/agent/chat",
            headers={"Authorization": "Bearer dev:tenant-demo:user-1:engineer"},
            json={
                "question": "比較 CDT158 與 CDT159",
                "pageContext": page_context(),
                "tags": ["CDT158", "CDT159"],
                "maxPoints": 100,
            },
        ) as response:
            events = parse_events(response)

    assert response.status_code == 200
    assert [event["type"] for event in events].count("tool-start") == 2
    evidence_events = [event for event in events if event["type"] == "evidence"]
    assert len(evidence_events) == 2
    evidence = evidence_events[0]["payload"]["evidence"]
    assert evidence["sourceSystem"] == "easy-pi"
    assert evidence["calculationVersion"] == "timeseries-analytics@0.1.0"
    assert evidence["queryId"].startswith("qry-")
    complete = next(event for event in events if event["type"] == "complete")
    assert complete["payload"]["analysis"]["kind"] == "comparison"
    text = next(event["payload"]["text"] for event in events if event["type"] == "text-delta")
    assert "deterministic analytics" in text


def test_unapproved_domain_fails_closed_in_stream() -> None:
    with make_client() as client:
        with client.stream(
            "POST",
            "/v1/agent/chat",
            headers={"Authorization": "Bearer dev:tenant-demo:user-1:engineer"},
            json={
                "question": "CDT158 current value",
                "pageContext": page_context("evil.example"),
                "tags": ["CDT158"],
            },
        ) as response:
            events = parse_events(response)

    assert len(events) == 1
    assert events[0]["type"] == "error"
    assert events[0]["payload"]["code"] == "DOMAIN_NOT_ALLOWED"


def test_capability_registry_has_no_write_tools() -> None:
    with make_client() as client:
        response = client.get(
            "/v1/capabilities",
            headers={"Authorization": "Bearer dev:tenant-demo:user-1:viewer"},
        )
    assert response.status_code == 200
    tools = response.json()["tools"]
    assert tools
    assert all(tool["readOnly"] is True for tool in tools)
    assert all(not tool["name"].startswith(("write", "update", "delete")) for tool in tools)


def test_cross_tenant_context_is_denied() -> None:
    context = page_context()
    context["tenantId"] = "tenant-other"
    with make_client() as client:
        response = client.post(
            "/v1/context/validate",
            headers={"Authorization": "Bearer dev:tenant-demo:user-1:viewer"},
            json=context,
        )
    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "TENANT_MISMATCH"


def test_canvas_can_be_saved_and_opened_only_by_owning_tenant() -> None:
    auth = {"Authorization": "Bearer dev:tenant-demo:user-1:engineer"}
    with make_client() as client:
        with client.stream(
            "POST",
            "/v1/agent/chat",
            headers=auth,
            json={
                "question": "顯示 SINUSOID 趨勢",
                "pageContext": page_context(),
                "tags": ["SINUSOID"],
            },
        ) as response:
            events = parse_events(response)
        view_spec = next(
            event["payload"]["viewSpec"] for event in events if event["type"] == "view-spec"
        )

        saved = client.post("/v1/canvases", headers=auth, json=view_spec)
        opened = client.get(f"/v1/canvases/{view_spec['viewId']}", headers=auth)
        denied = client.get(
            f"/v1/canvases/{view_spec['viewId']}",
            headers={"Authorization": "Bearer dev:tenant-other:user-2:engineer"},
        )

    assert saved.status_code == 200
    assert opened.status_code == 200
    assert opened.json()["viewId"] == view_spec["viewId"]
    assert denied.status_code == 404


def test_trace_is_replayable_and_audit_is_admin_scoped() -> None:
    engineer = {"Authorization": "Bearer dev:tenant-demo:user-1:engineer"}
    admin = {"Authorization": "Bearer dev:tenant-demo:admin-1:admin"}
    with make_client() as client:
        with client.stream(
            "POST",
            "/v1/agent/chat",
            headers=engineer,
            json={
                "question": "CDT158 current value",
                "pageContext": page_context(),
                "tags": ["CDT158"],
            },
        ) as response:
            parse_events(response)
            trace_id = response.headers["x-solera-trace-id"]
        trace = client.get(f"/v1/traces/{trace_id}", headers=engineer)
        forbidden = client.get("/v1/audit", headers=engineer)
        audit = client.get("/v1/audit", headers=admin)

    assert trace.status_code == 200
    assert trace.json()["status"] == "completed"
    tool_result = next(event for event in trace.json()["events"] if event["type"] == "tool-result")
    assert "series" not in tool_result["payload"]
    assert forbidden.status_code == 403
    assert audit.status_code == 200
    assert any(item["action"] == "tool.query_current_value" for item in audit.json())


def test_kill_switch_fails_closed_before_tool_execution() -> None:
    admin = {"Authorization": "Bearer dev:tenant-demo:admin-1:admin"}
    engineer = {"Authorization": "Bearer dev:tenant-demo:user-1:engineer"}
    with make_client() as client:
        switched = client.put(
            "/v1/admin/kill-switches/capability/query_timeseries",
            headers=admin,
            json={"enabled": True},
        )
        with client.stream(
            "POST",
            "/v1/agent/chat",
            headers=engineer,
            json={
                "question": "Show CDT158 trend",
                "pageContext": page_context(),
                "tags": ["CDT158"],
            },
        ) as response:
            events = parse_events(response)

    assert switched.status_code == 200
    assert events[-1]["type"] == "error"
    assert events[-1]["payload"]["code"] == "CAPABILITY_DISABLED"


def test_knowledge_search_returns_citations_and_agent_evidence() -> None:
    admin = {"Authorization": "Bearer dev:tenant-demo:knowledge-1:knowledge-admin"}
    engineer = {"Authorization": "Bearer dev:tenant-demo:user-1:engineer"}
    with make_client() as client:
        ingested = client.post(
            "/v1/admin/knowledge/documents",
            headers=admin,
            json={
                "documentId": "manual-1",
                "title": "CDT158 Pump Failure Manual",
                "content": (
                    "CDT158 vibration failure procedure. Inspect the bearing and "
                    "verify lubrication before restarting the pump."
                ),
                "uri": "https://docs.example/manual-1",
            },
        )
        search = client.get("/v1/knowledge/search?q=CDT158%20failure", headers=engineer)
        with client.stream(
            "POST",
            "/v1/agent/chat",
            headers=engineer,
            json={
                "question": "CDT158 failure manual",
                "pageContext": page_context(),
                "tags": ["CDT158"],
            },
        ) as response:
            events = parse_events(response)

    assert ingested.status_code == 200
    assert search.status_code == 200
    assert search.json()[0]["title"] == "CDT158 Pump Failure Manual"
    document_evidence = [
        event["payload"]["evidence"]
        for event in events
        if event["type"] == "evidence" and event["payload"]["evidence"]["sourceType"] == "document"
    ]
    assert document_evidence[0]["citation"]["documentId"] == "manual-1"


def test_metrics_split_components_and_tenant_rate_limit() -> None:
    engineer = {"Authorization": "Bearer dev:tenant-demo:user-1:engineer"}
    admin = {"Authorization": "Bearer dev:tenant-demo:admin-1:admin"}
    payload = {
        "question": "CDT158 current value",
        "pageContext": page_context(),
        "tags": ["CDT158"],
    }
    with make_client(requests_per_minute=1) as client:
        first = client.post("/v1/agent/chat", headers=engineer, json=payload)
        second = client.post("/v1/agent/chat", headers=engineer, json=payload)
        metrics = client.get("/v1/operations/metrics", headers=admin)

    assert first.status_code == 200
    assert second.status_code == 429
    assert second.headers["retry-after"]
    assert metrics.status_code == 200
    assert metrics.json()["latency"]["connector.easy-pi"]["count"] == 1
    assert metrics.json()["latency"]["analytics"]["count"] == 1
