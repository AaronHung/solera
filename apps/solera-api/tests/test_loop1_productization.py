import asyncio
from datetime import UTC, datetime

import pytest
from solera_api.config import Settings
from solera_api.data_hub import IndustrialEvent, InProcessEventBus
from solera_api.productization import (
    ProductizationGateError,
    enforce_productization_gates,
    evaluate_productization_gates,
)


def test_optional_productization_is_deferred_by_default() -> None:
    report = evaluate_productization_gates(Settings())
    statuses = {gate.gate_id: gate.status for gate in report.gates}

    assert statuses["gate-f-pi-mirror"] == "deferred"
    assert statuses["gate-g-dwsim-opcua"] == "deferred"
    assert statuses["gate-h-multimodal"] == "deferred"
    assert statuses["gate-i-event-bus"] == "core-ready"
    enforce_productization_gates(report)


def test_requested_unvalidated_adapter_fails_closed() -> None:
    report = evaluate_productization_gates(Settings(loop1_dwsim_opcua_enabled=True))

    with pytest.raises(ProductizationGateError, match="DWSIM"):
        enforce_productization_gates(report)


@pytest.mark.asyncio
async def test_in_process_event_bus_is_bounded_publish_subscribe_seam() -> None:
    bus = InProcessEventBus(subscriber_queue_size=2)
    subscription = bus.subscribe("loop1.observation")
    pending = asyncio.create_task(anext(subscription))
    await asyncio.sleep(0)
    event = IndustrialEvent(
        event_id="event-1",
        tenant_id="tenant-demo",
        topic="loop1.observation",
        occurred_at=datetime(2026, 1, 1, tzinfo=UTC),
        payload={"tagId": "reactor-temperature", "value": 120.0},
        synthetic=True,
    )

    await bus.publish(event)
    received = await pending
    await subscription.aclose()

    assert received == event
    assert received.synthetic is True
