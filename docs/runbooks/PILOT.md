# Solera v0.1 Pilot Runbook

## Entry gate

Do not start a user Pilot until all items are signed off:

- Named tenant, owner, Pilot users, roles, Sites, assets, Tags, and support hours.
- Approved Easy PI/PI endpoints, authentication, certificate, limits, timezone,
  bad-value behavior, and data owner.
- Approved Chrome/Edge versions and managed extension policy.
- Domain allowlist and Site Adapter fixtures.
- OIDC issuer/audience/JWKS and token role/asset-scope claims.
- Model provider, region, enterprise terms, retention, egress, and pricing.
- Trace/audit/Canvas/document retention and deletion owners.
- Incident contacts and tenant/domain/adapter/connector/model/capability kill
  switch owners.
- 30–50 golden questions reviewed by a PI/OT Subject Matter Expert.

Production must set `SOLERA_ENVIRONMENT=production` and
`SOLERA_DEV_AUTH_ENABLED=false`. Startup with development auth is not an
acceptable production identity design.

## Deployment checks

1. Run `npm run verify`.
2. Run `npm run package:extension`, verify SHA-256, and archive SBOM outputs.
3. Deploy API over TLS behind the enterprise ingress.
4. Confirm Postgres backup, encryption, access, and restore test.
5. Confirm API cannot reach PLC/control endpoints.
6. Confirm PI/model credentials exist only in the server/secret provider.
7. Confirm model data policy defaults to `summary-only`.
8. Execute cross-tenant, prompt-injection, ViewSpec, and cleanup tests.
9. Run a dry demo with a non-production tenant.

## Daily operations

- Review `/v1/operations/metrics` for connector, analytics, and model p95.
- Review model token/cost counters against the Pilot budget.
- Review connector timeout/rate-limit failures and data-quality warnings.
- Review admin audit events and denied policy attempts.
- Verify nightly aggregate and trace-to-eval Flow runs.
- Sample accepted/rejected feedback; do not automatically train or publish Wiki
  knowledge from raw feedback.

## Incident actions

1. Preserve the trace ID and avoid copying raw data into chat/tickets.
2. Disable the narrowest affected capability:
   capability → model/connector → adapter/domain → tenant → global.
3. Revoke identity/session or credentials when applicable.
4. Stop model egress if classification or retention is uncertain.
5. Record timeline, affected tenant/assets, queries, model/tool versions, and
   containment.
6. Restore only after golden, policy, and browser cleanup tests pass.

Solera has no write/control tools, so incident response must not add a temporary
write path.

## Pilot exit criteria

- All release contract tests pass.
- Every numerical answer in the sample has complete Evidence.
- Supported-page context reaches the 95% target or requests confirmation.
- 5–10 users complete the four contracted journeys.
- At least 60% repeat weekly, with measured task-time or quality benefit.
- No cross-tenant, credential, executable ViewSpec, or host-state incident.
- Product owner decides v0.2 based on observed adapters, private PI deployment,
  and real equipment/work-order data—not synthetic-tag enthusiasm.
