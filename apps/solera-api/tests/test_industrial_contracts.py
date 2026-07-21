from datetime import UTC, datetime

import pytest
from pydantic import ValidationError
from solera_api.industrial_contracts import (
    FaultDefinition,
    IndustrialAsset,
    ScenarioManifest,
    SignalLimits,
    SignalTag,
)


def test_manifest_requires_linked_asset_and_tag_identity() -> None:
    asset = IndustrialAsset(
        asset_id="reactor-cooling-valve",
        tenant_id="tenant-demo",
        kind="component",
        name="Reactor cooling-water control valve",
        parent_id=None,
        aliases=[],
        attributes={"synthetic": True},
    )
    tag = SignalTag(
        tag_id="cooling-valve-position",
        tenant_id="tenant-demo",
        asset_id=asset.asset_id,
        name="Cooling-water valve position",
        unit="%",
        data_type="number",
        cadence_seconds=1,
        limits=SignalLimits(lo=0, hi=100),
        aliases=[],
    )

    manifest = ScenarioManifest(
        scenario_id="loop1-reactor-cooling",
        tenant_id="tenant-demo",
        name="LOOP-1 Reactor Cooling",
        seed=1701,
        timezone="UTC",
        tick_seconds=1,
        starts_at=datetime(2026, 1, 1, tzinfo=UTC),
        assets=[asset],
        tags=[tag],
        faults=[
            FaultDefinition(
                fault_id="cooling-valve-stiction",
                kind="valve-stiction",
                inject_at_tick=120,
                asset_id=asset.asset_id,
                parameters={"severity": 0.7},
            )
        ],
        kpis=[],
    )

    assert manifest.tags[0].asset_id == manifest.assets[0].asset_id
    assert manifest.model_dump(by_alias=True)["manifestVersion"] == "0.1"


def test_manifest_rejects_unknown_asset_reference() -> None:
    with pytest.raises(ValidationError, match="unknown assets"):
        ScenarioManifest(
            scenario_id="loop1-reactor-cooling",
            tenant_id="tenant-demo",
            name="LOOP-1 Reactor Cooling",
            seed=1701,
            timezone="UTC",
            tick_seconds=1,
            starts_at=datetime(2026, 1, 1, tzinfo=UTC),
            assets=[
                IndustrialAsset(
                    asset_id="site-loop1",
                    tenant_id="tenant-demo",
                    kind="site",
                    name="LOOP-1 Site",
                    parent_id=None,
                    aliases=[],
                    attributes={},
                )
            ],
            tags=[
                SignalTag(
                    tag_id="orphan-tag",
                    tenant_id="tenant-demo",
                    asset_id="missing-asset",
                    name="Orphan tag",
                    unit="",
                    data_type="number",
                    cadence_seconds=1,
                    aliases=[],
                )
            ],
            faults=[],
            kpis=[],
        )
