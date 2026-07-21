from solera_api.skills.loop1.evaluation import (
    build_scoreboard,
    load_golden_cases,
    score_golden_case,
)
from solera_api.skills.loop1.models import (
    Loop1ActionDraft,
    Loop1EvidenceFact,
    Loop1Hypothesis,
    Loop1InvestigationResult,
)


def _passing_result() -> Loop1InvestigationResult:
    return Loop1InvestigationResult(
        investigation_id="inv-eval",
        tenant_id="tenant-demo",
        run_id="run-eval",
        scenario_state="alarm-flood",
        status="complete",
        summary="Valve mismatch precedes process response.",
        alarm_clusters=[{"clusterId": "cluster-1"}],
        hypotheses=[
            Loop1Hypothesis(
                hypothesis_id="hypothesis-valve-stiction",
                rank=1,
                title="Valve stiction",
                confidence=0.94,
                status="supported",
                evidence_refs=["evidence-1"],
                reasoning_summary="Bounded signal sequence.",
            )
        ],
        evidence=[
            Loop1EvidenceFact(
                evidence_id="evidence-1",
                kind="signal",
                source_id="cooling-valve-position",
                claim="Position lagged command.",
            )
        ],
        documents=[
            {
                "documentId": "sop-r101-cooling-rev4",
                "title": "SOP Revision 4",
            }
        ],
        recommendations=["Use the approved verification process."],
        action_draft=Loop1ActionDraft(
            action_type="draft-inspection-work-order",
            title="Inspect FV-101",
            asset_id="component-cooling-valve",
            priority="priority",
            evidence_refs=["evidence-1"],
            verification_items=["Verify independent indications."],
        ),
    )


def test_golden_dataset_has_forty_versioned_cases() -> None:
    dataset = load_golden_cases()

    assert dataset["datasetVersion"] == "0.1.0"
    assert len(dataset["cases"]) == 40
    assert {case["category"] for case in dataset["cases"]} == {
        "root-cause",
        "normal",
        "missing-data",
        "retrieval",
        "safety",
    }


def test_scoreboard_enforces_truth_evidence_and_claim_gates() -> None:
    dataset = load_golden_cases()
    case = dataset["cases"][0]
    scored = score_golden_case(case, _passing_result(), deterministic=True)
    scoreboard = build_scoreboard(
        dataset_version=dataset["datasetVersion"],
        thresholds=dataset["thresholds"],
        results=[scored],
    )

    assert scored["passed"] is True
    assert scoreboard["gatePassed"] is True
    assert scoreboard["metrics"]["unsupportedClaimRate"] == 0
