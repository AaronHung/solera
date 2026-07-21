import pytest
from loop1_simulator import Loop1ScenarioEngine
from solera_api.data_hub import DataHubRepository
from solera_api.data_hub.models import (
    IndustrialAssetRecord,
    IndustrialCaseRecordDb,
    IndustrialObservationRecord,
    IndustrialTagRecord,
    ThreadEdgeRecord,
)
from solera_api.storage import Database, KnowledgeRepository
from solera_flows import run_loop1_replay, run_loop1_seed
from sqlalchemy import func, select


@pytest.mark.asyncio
async def test_loop1_seed_and_replay_are_idempotent() -> None:
    database = Database("sqlite+aiosqlite:///:memory:")
    await database.initialize()
    data_hub = DataHubRepository(database)
    knowledge = KnowledgeRepository(database)
    engine = Loop1ScenarioEngine()
    try:
        first_seed = await run_loop1_seed(
            repository=data_hub,
            knowledge=knowledge,
            manifest=engine.manifest,
        )
        second_seed = await run_loop1_seed(
            repository=data_hub,
            knowledge=knowledge,
            manifest=engine.manifest,
        )
        first_replay = await run_loop1_replay(
            repository=data_hub,
            engine=engine,
            to_tick=5,
        )
        second_replay = await run_loop1_replay(
            repository=data_hub,
            engine=engine,
            to_tick=5,
        )
        snapshot = await data_hub.snapshot("tenant-demo", engine.run.run_id)
        async with database.sessions() as session:
            counts = {
                "assets": await session.scalar(
                    select(func.count()).select_from(IndustrialAssetRecord)
                ),
                "tags": await session.scalar(
                    select(func.count()).select_from(IndustrialTagRecord)
                ),
                "cases": await session.scalar(
                    select(func.count()).select_from(IndustrialCaseRecordDb)
                ),
                "edges": await session.scalar(
                    select(func.count()).select_from(ThreadEdgeRecord)
                ),
                "observations": await session.scalar(
                    select(func.count()).select_from(IndustrialObservationRecord)
                ),
            }
    finally:
        await database.close()

    assert first_seed["changed"] is True
    assert second_seed["changed"] is False
    assert counts["assets"] == len(engine.manifest.assets)
    assert counts["tags"] == len(engine.manifest.tags)
    assert counts["cases"] == 10
    assert counts["edges"] > len(engine.manifest.tags)
    assert counts["observations"] == len(engine.manifest.tags) * 5
    assert first_replay["pulse"]["status"] == "healthy"
    assert second_replay["changed"] is False
    assert snapshot is not None
    assert snapshot["run"]["tick"] == 5


@pytest.mark.asyncio
async def test_thread_connects_case_to_asset_tag_and_document() -> None:
    database = Database("sqlite+aiosqlite:///:memory:")
    await database.initialize()
    data_hub = DataHubRepository(database)
    try:
        await run_loop1_seed(
            repository=data_hub,
            knowledge=KnowledgeRepository(database),
            manifest=Loop1ScenarioEngine().manifest,
        )
        edges = await data_hub.thread(
            "tenant-demo",
            "case",
            "case-valve-stiction-001",
        )
    finally:
        await database.close()

    assert {edge["targetKind"] for edge in edges} == {"asset", "tag", "document"}
