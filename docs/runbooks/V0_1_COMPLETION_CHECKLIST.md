# Solera v0.1 Completion Checklist

Last updated: 2026-07-20  
Contract: `docs/contracts/SOLERA_V0_1.md` v0.1.0

This checklist separates local implementation evidence from external Pilot
acceptance. A green local test does not mean that a customer browser, identity
provider, or production deployment has been accepted.

## Completed local implementation gates

- [x] Read-only Easy PI connector and deterministic analytics.
- [x] Bounded/redacted PageContext capture for Easy PI, PI Vision, and generic
      approved pages.
- [x] Evidence, trace, audit, policy, tenant, role, rate, range, and kill-switch
      seams.
- [x] Six trusted Canvas widgets with ViewSpec validation and Shadow DOM
      cleanup tests.
- [x] Sidecar streaming lifecycle and page-first PI Vision explanation.
- [x] OpenRouter-compatible model gateway with server-side credentials.
- [x] Brave-compatible MV3 smoke: 2/2 tests passed on 2026-07-20.
- [x] Chrome/Edge managed-package contract test passed.
- [x] Docker Compose configuration parsed with a local placeholder
      `POSTGRES_PASSWORD`.
- [x] `npm run check`: build, typecheck, and frontend tests passed.
- [x] Ruff and Python tests passed: 28 tests.

## Approved SCADA test-site gates

- [x] `http://203.146.71.23/*` added to extension
      `host_permissions`.
- [x] `http://203.146.71.23/*` added to extension
      `content_scripts.matches`.
- [x] `203.146.71.23` added to backend domain policy and local `.env`.
- [x] Generic SCADA PageContext policy regression test added.
- [x] Browser manifest regression test added.
- [ ] Live authenticated SCADA PageContext capture in Brave.
- [ ] SPA navigation, browser restart, extension reload, and stale-receiver
      recovery on the SCADA site.

The SCADA rule is an HTTP/IP development exception for this Pilot only. It must
not become a wildcard production permission.

## Live integration evidence

- [x] Easy PI live smoke on 2026-07-20:
      `CDT158`, 17 one-hour points, coverage `1.0`,
      `timeseries-analytics@0.1.0`, summary latency `2840.35 ms`.
- [x] PI Vision endpoint reachability checked; unauthenticated request returned
      HTTP `401`.
- [ ] Authenticated PI Vision DOM/context capture on `Tank_Details`.
- [ ] Live PI Vision display-to-approved-Tag mapping.
- [ ] Add to Canvas, close, and host-page restoration on live pages.

## External Pilot acceptance still required

- [ ] Branded Chrome and Edge workflow matrix.
- [ ] Managed extension distribution and update policy.
- [ ] Customer OIDC claims, secret provider, model region/ZDR/price policy,
      retention, and legal approval.
- [ ] Container image build and runtime with a running Docker daemon.
- [ ] Prompt-injection and customer security review evidence.
- [ ] First-text and full-analysis p95 under Pilot load.
- [ ] Context resolution target of at least 95%.
- [ ] Named 5–10 user Pilot with outcome/adoption evidence.
- [ ] Credential/certificate rotation and private-network Bridge validation.

## Completion rule

v0.1 is ready for Pilot acceptance only when every item in the external
section has an owner, environment, evidence link, and recorded result. Items
marked as not applicable require an ADR or an explicit contract change.

## Handoff ownership

- **Solera engineering:** live adapters, Canvas behavior, failure paths,
  managed package, load test, trace replay, and security test evidence.
- **Customer IT/security:** OIDC claims, secret provider, browser management,
  network access, certificate rotation, retention, and legal approval.
- **Pilot operator:** named users, supported displays, golden questions,
  outcome measures, and adoption evidence.

The first handoff cannot be marked complete from local code alone. It requires
the three roles above to attach evidence for the same environment and release.
