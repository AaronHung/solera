import pytest
from loop1_simulator import Loop1ScenarioEngine
from solera_api.data_hub import DataHubRepository
from solera_api.skills.loop1 import Loop1Investigator, Loop1ReadOnlyTools
from solera_api.storage import Database, KnowledgeRepository
from solera_flows import run_loop1_replay, run_loop1_seed


@pytest.mark.asyncio
async def test_investigation_ranks_truth_with_evidence_and_safe_action() -> None:
    database = Database("sqlite+aiosqlite:///:memory:")
    await database.initialize()
    data_hub = DataHubRepository(database)
    knowledge = KnowledgeRepository(database)
    engine = Loop1ScenarioEngine()
    try:
        await run_loop1_seed(
            repository=data_hub,
            knowledge=knowledge,
            manifest=engine.manifest,
        )
        await run_loop1_replay(repository=data_hub, engine=engine, to_tick=220)
        investigator = Loop1Investigator(
            Loop1ReadOnlyTools(data_hub=data_hub, knowledge=knowledge)
        )
        result = await investigator.investigate(
            tenant_id="tenant-demo",
            run_id=engine.run.run_id,
        )
    finally:
        await database.close()

    assert result.status == "complete"
    assert result.hypotheses[0].hypothesis_id == "hypothesis-valve-stiction"
    assert result.hypotheses[0].confidence >= 0.9
    assert result.alarm_clusters[0]["alarmCount"] == 18
    assert result.action_draft is not None
    assert "Draft only" in result.action_draft.safety_boundary
    assert all(hypothesis.evidence_refs for hypothesis in result.hypotheses)
    assert any(
        evidence.kind == "document"
        and evidence.source_id == "sop-r101-cooling-rev4"
        for evidence in result.evidence
    )


@pytest.mark.asyncio
async def test_investigation_safely_declines_without_history() -> None:
    database = Database("sqlite+aiosqlite:///:memory:")
    await database.initialize()
    data_hub = DataHubRepository(database)
    knowledge = KnowledgeRepository(database)
    engine = Loop1ScenarioEngine()
    try:
        await run_loop1_seed(
            repository=data_hub,
            knowledge=knowledge,
            manifest=engine.manifest,
        )
        await run_loop1_replay(repository=data_hub, engine=engine, to_tick=10)
        result = await Loop1Investigator(
            Loop1ReadOnlyTools(data_hub=data_hub, knowledge=knowledge)
        ).investigate(
            tenant_id="tenant-demo",
            run_id=engine.run.run_id,
        )
    finally:
        await database.close()

    assert result.status == "safe-decline"
    assert result.action_draft is None
    assert result.missing_data
    assert "control" not in " ".join(result.recommendations).lower()


@pytest.mark.asyncio
async def test_approval_remains_auditable_draft_only_record() -> None:
    database = Database("sqlite+aiosqlite:///:memory:")
    await database.initialize()
    data_hub = DataHubRepository(database)
    try:
        requested = await data_hub.request_approval(
            approval_id="approval-1",
            tenant_id="tenant-demo",
            run_id="run-1",
            action_type="draft-inspection-work-order",
            requested_by="engineer-1",
            draft={"title": "Inspect FV-101"},
        )
        approved = await data_hub.decide_approval(
            approval_id="approval-1",
            tenant_id="tenant-demo",
            decided_by="supervisor-1",
            decision="approved",
            rationale="Use normal permit workflow.",
        )
    finally:
        await database.close()

    assert requested["status"] == "requested"
    assert approved["status"] == "approved"
    assert approved["execution"] == "draft-only; no external write or plant control"
