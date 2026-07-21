from .models import Loop1SkillManifest

LOOP1_SKILLS = (
    Loop1SkillManifest(
        skill_id="loop1-alarm-triage",
        name="Alarm Triage",
        purpose="Cluster dependent alarms and preserve critical alarm visibility.",
        tools=["cluster_alarms", "find_change_points"],
    ),
    Loop1SkillManifest(
        skill_id="loop1-process-context",
        name="Process Context",
        purpose="Compare linked signals and causal timing without generating control advice.",
        tools=["query_signals", "find_change_points", "get_asset_neighbors"],
    ),
    Loop1SkillManifest(
        skill_id="loop1-procedure-safety",
        name="Procedure & Safety",
        purpose="Retrieve the effective procedure revision and state safety boundaries.",
        tools=["get_document_revision"],
    ),
    Loop1SkillManifest(
        skill_id="loop1-case-retrieval",
        name="Case Retrieval",
        purpose="Find similar tenant-scoped synthetic cases using linked assets and Tags.",
        tools=["search_cases"],
    ),
    Loop1SkillManifest(
        skill_id="loop1-asset-integrity",
        name="Asset Integrity",
        purpose="Separate valve, instrument, utility, and rotating-equipment hypotheses.",
        tools=["query_signals", "get_asset_neighbors", "search_cases"],
    ),
    Loop1SkillManifest(
        skill_id="loop1-shift-handover",
        name="Shift Handover",
        purpose="Draft an evidence-linked handover or inspection request for human approval.",
        tools=["calculate_kpi", "draft_work_order"],
        requires_approval=True,
    ),
)

LOOP1_SKILLS_BY_ID = {skill.skill_id: skill for skill in LOOP1_SKILLS}
