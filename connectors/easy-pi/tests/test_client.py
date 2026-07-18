from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

import httpx
import pytest
import respx
from easy_pi import ConnectorPolicyError, ConnectorUpstreamError, EasyPiConnector

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.mark.asyncio
@respx.mock
async def test_recorded_uses_reviewed_get_and_parses_points() -> None:
    payload = json.loads((FIXTURES / "cdt158_recorded.json").read_text())
    route = respx.get(
        "https://easypi.example/PIBridge/PITagData/PI-PRD/CDT158/"
        "Record/ByTimeRange/20260718100000/20260718110000"
    ).mock(return_value=httpx.Response(200, json=payload))

    async with EasyPiConnector(
        base_url="https://easypi.example",
        setting_name="PI-PRD",
        timezone="Asia/Taipei",
    ) as connector:
        result = await connector.recorded(
            "CDT158",
            start=datetime.fromisoformat("2026-07-18T10:00:00+08:00"),
            end=datetime.fromisoformat("2026-07-18T11:00:00+08:00"),
            max_points=100,
        )

    assert route.called
    request = route.calls.last.request
    assert request.method == "GET"
    assert request.url.params["PageSize"] == "100"
    assert result.tag == "CDT158"
    assert len(result.points) == 6
    assert result.points[0].value == pytest.approx(82.01496)
    assert result.points[0].timestamp.utcoffset().total_seconds() == 8 * 60 * 60


@pytest.mark.asyncio
@respx.mock
async def test_current_parses_live_shape() -> None:
    respx.get("https://easypi.example/PIBridge/PITagData/PI-PRD/CDT159").mock(
        return_value=httpx.Response(
            200,
            json={
                "TagName": "CDT159",
                "Descriptor": None,
                "Record": None,
                "TriggerTime": "2026-07-18T11:09:21+08:00",
                "StringTime": None,
                "ValueType": "System.Single",
                "Value": 184.168732,
            },
        )
    )

    async with EasyPiConnector(
        base_url="https://easypi.example",
        setting_name="PI-PRD",
    ) as connector:
        result = await connector.current("CDT159")

    assert result.tag == "CDT159"
    assert result.point.value == pytest.approx(184.168732)
    assert result.point.quality == "good"


@pytest.mark.asyncio
async def test_policy_rejects_path_injection_and_excessive_range() -> None:
    async with EasyPiConnector(
        base_url="https://easypi.example",
        setting_name="PI-PRD",
    ) as connector:
        with pytest.raises(ConnectorPolicyError):
            await connector.current("../Tags/PI-PRD")

        with pytest.raises(ConnectorPolicyError):
            await connector.recorded(
                "CDT158",
                start=datetime.fromisoformat("2026-01-01T00:00:00+08:00"),
                end=datetime.fromisoformat("2026-07-18T00:00:00+08:00"),
            )


@pytest.mark.asyncio
async def test_capabilities_are_read_only() -> None:
    connector = EasyPiConnector(
        base_url="https://easypi.example",
        setting_name="PI-PRD",
    )
    try:
        capabilities = connector.capabilities.model_dump()
        assert capabilities["readOnly"] is True
        assert set(capabilities["operations"]) == {
            "health",
            "list-tags",
            "current",
            "recorded",
        }
    finally:
        await connector.close()


@pytest.mark.asyncio
@respx.mock
async def test_transient_failure_retries_once_then_succeeds() -> None:
    route = respx.get("https://easypi.example/PIBridge/PITagData/PI-PRD/CDT158").mock(
        side_effect=[
            httpx.Response(503),
            httpx.Response(
                200,
                json={
                    "TagName": "CDT158",
                    "TriggerTime": "2026-07-18T11:00:00+08:00",
                    "ValueType": "System.Single",
                    "Value": 42.0,
                },
            ),
        ]
    )
    async with EasyPiConnector(
        base_url="https://easypi.example",
        setting_name="PI-PRD",
        max_retries=1,
    ) as connector:
        result = await connector.current("CDT158")

    assert route.call_count == 2
    assert result.point.value == 42


@pytest.mark.asyncio
@respx.mock
async def test_timeout_and_rate_limit_return_safe_errors() -> None:
    timeout_route = respx.get("https://easypi.example/PIBridge/PITagData/PI-PRD/CDT158").mock(
        side_effect=httpx.ReadTimeout("upstream timeout")
    )
    async with EasyPiConnector(
        base_url="https://easypi.example",
        setting_name="PI-PRD",
        max_retries=0,
    ) as connector:
        with pytest.raises(ConnectorUpstreamError, match="timed out"):
            await connector.current("CDT158")
    assert timeout_route.call_count == 1

    respx.reset()
    rate_route = respx.get("https://easypi.example/PIBridge/PITagData/PI-PRD/CDT158").mock(
        return_value=httpx.Response(429)
    )
    async with EasyPiConnector(
        base_url="https://easypi.example",
        setting_name="PI-PRD",
        max_retries=2,
    ) as connector:
        with pytest.raises(ConnectorUpstreamError, match="rate limit"):
            await connector.current("CDT158")
    assert rate_route.call_count == 1
