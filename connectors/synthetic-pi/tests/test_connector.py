from datetime import timedelta

import pytest
from easy_pi import ConnectorPolicyError
from loop1_simulator import Loop1ScenarioEngine
from synthetic_pi import SyntheticPiConnector


@pytest.mark.asyncio
async def test_connector_exposes_pi_alias_and_synthetic_lineage() -> None:
    engine = Loop1ScenarioEngine()
    connector = SyntheticPiConnector(engine=engine)
    start = engine.manifest.starts_at

    series = await connector.recorded(
        "LOOP1.REACTOR_TEMPERATURE",
        start=start,
        end=start + timedelta(seconds=180),
        max_points=200,
    )

    assert series.tag == "reactor-temperature"
    assert len(series.points) == 180
    assert series.upstream_metadata["synthetic"] is True
    assert series.upstream_metadata["seed"] == 1701
    assert connector.capabilities.readOnly is True
    assert connector.capabilities.connectorId == "synthetic-pi"


@pytest.mark.asyncio
async def test_connector_rejects_unknown_tags() -> None:
    connector = SyntheticPiConnector()

    with pytest.raises(ConnectorPolicyError, match="unknown synthetic PI tag"):
        await connector.current("LOOP1.UNKNOWN")
