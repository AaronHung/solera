from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from loop1_simulator import Loop1ScenarioEngine, build_manifest
from solera_flows import run_loop1_replay, run_loop1_seed

from ...data_hub import DataHubRepository
from ...industrial_contracts import FaultDefinition
from ...storage import Database, KnowledgeRepository
from .models import Loop1InvestigationResult
from .orchestrator import Loop1Investigator
from .tools import Loop1ReadOnlyTools

DEFAULT_GOLDEN_PATH = (
    Path(__file__).resolve().parents[5] / "fixtures" / "loop1" / "golden_cases.json"
)


def load_golden_cases(path: Path = DEFAULT_GOLDEN_PATH) -> dict[str, Any]:
    payload = json.loads(path.read_text())
    if not isinstance(payload.get("cases"), list) or len(payload["cases"]) < 30:
        raise ValueError("LOOP-1 golden dataset must contain at least 30 cases")
    return payload


def score_golden_case(
    case: dict[str, Any],
    result: Loop1InvestigationResult,
    *,
    deterministic: bool,
) -> dict[str, Any]:
    expected = case["expected"]
    evidence_ids = {item.evidence_id for item in result.evidence}
    hypothesis_refs = [
        reference
        for hypothesis in result.hypotheses
        for reference in hypothesis.evidence_refs
    ]
    expected_top3 = expected.get("top3")
    expected_document = expected.get("document")
    forbidden = [item.lower() for item in expected.get("forbiddenClaims", [])]
    narrative = " ".join(
        [
            result.summary,
            *result.recommendations,
            result.action_draft.title if result.action_draft else "",
        ]
    ).lower()
    checks = {
        "deterministic": deterministic,
        "status": result.status == expected["status"],
        "top3Truth": (
            expected_top3 is None
            or expected_top3
            in [hypothesis.hypothesis_id for hypothesis in result.hypotheses[:3]]
        ),
        "documentRetrieval": (
            expected_document is None
            or expected_document
            in [document["documentId"] for document in result.documents]
        ),
        "alarmClusters": (
            "clusterCount" not in expected
            or len(result.alarm_clusters) == expected["clusterCount"]
        ),
        "evidenceComplete": (
            not result.hypotheses
            or bool(hypothesis_refs) and set(hypothesis_refs).issubset(evidence_ids)
        ),
        "actionBoundary": (
            not expected.get("actionDraft")
            or (
                result.action_draft is not None
                and "Draft only" in result.action_draft.safety_boundary
            )
        ),
        "unsupportedClaims": not any(claim in narrative for claim in forbidden),
    }
    return {
        "caseId": case["caseId"],
        "category": case["category"],
        "passed": all(checks.values()),
        "checks": checks,
        "status": result.status,
        "topHypotheses": [
            hypothesis.hypothesis_id for hypothesis in result.hypotheses[:3]
        ],
    }


def build_scoreboard(
    *,
    dataset_version: str,
    thresholds: dict[str, float],
    results: list[dict[str, Any]],
) -> dict[str, Any]:
    total = len(results)

    def rate(check: str, categories: set[str] | None = None) -> float:
        selected = [
            result
            for result in results
            if categories is None or result["category"] in categories
        ]
        if not selected:
            return 1.0
        return sum(bool(result["checks"][check]) for result in selected) / len(selected)

    metrics = {
        "replayDeterminism": rate("deterministic"),
        "top3TruthHitRate": rate("top3Truth", {"root-cause", "retrieval"}),
        "safeDeclineAccuracy": rate("status", {"missing-data"}),
        "documentRetrievalRate": rate("documentRetrieval", {"root-cause", "retrieval"}),
        "evidenceCompleteness": rate("evidenceComplete"),
        "unsupportedClaimRate": 1 - rate("unsupportedClaims"),
    }
    threshold_checks = {
        "replayDeterminism": metrics["replayDeterminism"]
        >= thresholds["replayDeterminism"],
        "top3TruthHitRate": metrics["top3TruthHitRate"]
        >= thresholds["top3TruthHitRate"],
        "safeDeclineAccuracy": metrics["safeDeclineAccuracy"]
        >= thresholds["safeDeclineAccuracy"],
        "documentRetrievalRate": metrics["documentRetrievalRate"]
        >= thresholds["documentRetrievalRate"],
        "evidenceCompleteness": metrics["evidenceCompleteness"]
        >= thresholds["evidenceCompleteness"],
        "unsupportedClaimRate": metrics["unsupportedClaimRate"]
        <= thresholds["unsupportedClaimRateMax"],
    }
    return {
        "datasetVersion": dataset_version,
        "synthetic": True,
        "caseCount": total,
        "passedCases": sum(bool(result["passed"]) for result in results),
        "metrics": metrics,
        "thresholds": thresholds,
        "thresholdChecks": threshold_checks,
        "gatePassed": all(threshold_checks.values()),
        "results": results,
        "disclosure": "Synthetic capability evaluation — not customer KPI evidence.",
    }


async def run_golden_suite(
    path: Path = DEFAULT_GOLDEN_PATH,
) -> dict[str, Any]:
    dataset = load_golden_cases(path)
    profile_cache: dict[
        tuple[str, str | None, str | None, int],
        tuple[Loop1InvestigationResult, bool],
    ] = {}
    results = []
    for case in dataset["cases"]:
        fault = case.get("fault")
        profile = (
            case["category"] if case["category"] in {"normal", "missing-data"} else "hero",
            fault.get("kind") if fault else None,
            fault.get("tagId") if fault else None,
            case["toTick"],
        )
        if profile not in profile_cache:
            manifest = build_manifest(seed=case["seed"])
            if fault:
                manifest = manifest.model_copy(
                    update={
                        "faults": [
                            *manifest.faults,
                            FaultDefinition(
                                fault_id=f"golden-{case['caseId']}",
                                kind=fault["kind"],
                                inject_at_tick=fault["injectAtTick"],
                                asset_id=_asset_for_tag(manifest, fault["tagId"]),
                                parameters={
                                    "tagId": fault["tagId"],
                                    "durationTicks": fault["durationTicks"],
                                },
                            ),
                        ]
                    }
                )
            first = Loop1ScenarioEngine(manifest)
            second = Loop1ScenarioEngine(manifest)
            first.replay(case["toTick"])
            second.replay(case["toTick"])
            deterministic = first.export_replay() == second.export_replay()

            database = Database("sqlite+aiosqlite:///:memory:")
            await database.initialize()
            data_hub = DataHubRepository(database)
            knowledge = KnowledgeRepository(database)
            engine = Loop1ScenarioEngine(manifest)
            try:
                await run_loop1_seed(
                    repository=data_hub,
                    knowledge=knowledge,
                    manifest=manifest,
                )
                await run_loop1_replay(
                    repository=data_hub,
                    engine=engine,
                    to_tick=case["toTick"],
                )
                investigation = await Loop1Investigator(
                    Loop1ReadOnlyTools(data_hub=data_hub, knowledge=knowledge)
                ).investigate(
                    tenant_id=manifest.tenant_id,
                    run_id=engine.run.run_id,
                )
            finally:
                await database.close()
            profile_cache[profile] = (investigation, deterministic)
        investigation, deterministic = profile_cache[profile]
        results.append(
            score_golden_case(
                case,
                investigation,
                deterministic=deterministic,
            )
        )
    return build_scoreboard(
        dataset_version=dataset["datasetVersion"],
        thresholds=dataset["thresholds"],
        results=results,
    )


def _asset_for_tag(manifest, tag_id: str) -> str:
    return next(tag.asset_id for tag in manifest.tags if tag.tag_id == tag_id)
