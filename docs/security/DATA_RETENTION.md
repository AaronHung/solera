# Solera v0.1 Data and Retention Policy

This is the implementation default, not a substitute for a customer Data
Processing Agreement or OT security approval.

## Data classes

- Identity: tenant, subject, roles, asset scopes.
- Page context: approved URL without query, title, bounded/redacted text digest,
  candidate asset, time range.
- Industrial data: on-demand PI values and bounded chart samples.
- Derived data: deterministic summaries, aggregates, Evidence, Canvas.
- Knowledge: approved documents, chunks, citations.
- Agent operations: prompts/questions, tool metadata, responses, traces,
  feedback, audit.
- Secrets: PI/model/OIDC credentials and signing material.

## Defaults

- Extension local storage: API endpoint, tenant, and bearer token for the Pilot.
  Enterprise deployment should replace long-lived bearer storage with an OIDC
  session flow and short-lived tokens.
- Raw PI archive: not copied wholesale. Connector responses are processed in
  memory; bounded series may be returned to the browser for Canvas.
- Traces: 30 days by default. Stored tool-result traces omit chart series and
  retain summaries/query metadata.
- Audit: 365 days recommended for Pilot security review; customer policy wins.
- Canvas/Evidence: retained until owner deletion or Pilot teardown.
- Knowledge documents/chunks: retained until admin deletion or source
  revocation.
- Nightly aggregates: 90 days suggested for v0.1.
- Model provider: `store=false`; provider/region/ZDR terms must be separately
  approved. Solera defaults to summary-only model egress.

## Prohibited handling

- No passwords, cookies, local/session-storage tokens, host network requests,
  or unrestricted screenshots in page context.
- No secrets in git, logs, traces, model prompts, Canvas, or Evidence.
- No raw page/PI data sent to a model when policy is `none` or `summary-only`.
- No automatic publication of feedback or model output as approved knowledge.

## Deletion and export

Pilot onboarding must assign an owner for tenant export/deletion. Deletion must
cover Canvas, traces, feedback/evals, aggregates, documents/chunks, audit
subject to legal retention, extension-local settings, backups, and model
provider records.

The current schema exposes storage boundaries but does not yet provide a
self-service deletion UI. Pilot teardown is an operator runbook action and must
be verified with tenant-scoped queries.

Run scheduled retention cleanup with:

```bash
PYTHONPATH=apps/solera-api:connectors/easy-pi:flows \
  uv run python -m solera_flows.cli retention --tenant tenant-demo
```
