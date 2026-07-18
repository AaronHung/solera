# Solera v0.1 Threat Model

Scope: Chrome/Edge Sidecar, Easy PI/PI Vision adapters, Solera API, model
gateway, Canvas renderer, and the in-process Easy PI connector.

## Protected assets

- User and tenant identity.
- PI/model credentials and tokens.
- Industrial time-series values and metadata.
- Asset-to-Tag mappings and internal documents.
- Tool policy, prompts, traces, audit records, and saved Canvas views.
- Integrity and availability of the host industrial application.

## Trust assumptions

- The host page, its DOM, images, URLs, and text can be malicious.
- Browser users can inspect extension traffic; no server secret can be stored
  in the extension.
- Model output is untrusted data.
- Connector responses can be malformed, stale, partial, or oversized.
- Authenticated users can still attempt cross-tenant and over-broad queries.

## Threats and required controls

### Page prompt injection

Risk: page text instructs the Agent to reveal data or call tools.

Controls:
- label page content as untrusted in `PageContext`;
- policy decisions never consume page instructions;
- validate tenant, role, asset, time range, point count, and egress at tool
  execution;
- include adversarial pages in golden policy tests.

### Excessive extension access

Risk: broad host permission or context capture leaks credentials or unrelated
data.

Controls:
- runtime domain allowlist and minimal declared host permissions;
- ignore password fields and configured sensitive selectors;
- never read cookies, local/session storage tokens, or host network traffic;
- screenshot capture is explicit, visible, and policy-controlled;
- redact before transmission.

### Arbitrary UI/code execution

Risk: a model or server response injects script into a privileged page.

Controls:
- JSON Schema ViewSpec;
- trusted local Widget registry;
- no `eval`, dynamic script, inline event handler, or arbitrary HTML;
- MV3 Content Security Policy;
- lifecycle test verifies complete cleanup.

### Industrial write or control

Risk: analysis becomes an unintended control path.

Controls:
- no write/control tools in v0.1 source or registry;
- connector permits only allowlisted GET operations;
- read-only capability test fails the build if a mutating operation appears;
- no browser-to-PLC or browser-to-historian credential path.

### Cross-tenant access

Risk: object IDs, saved Canvas, traces, or connector scopes leak between tenants.

Controls:
- tenant derived from verified identity, never request body;
- tenant key included in every persistence and policy operation;
- object lookup and tool execution enforce tenant scope;
- cross-tenant tests cover direct IDs and streamed events.

### Credential leakage

Risk: PI/model credentials reach the browser, logs, model, or trace.

Controls:
- server-side secret providers and typed redaction;
- no secrets in configuration committed to git;
- structured logs with allowlisted fields;
- trace payload minimization and configurable retention.

### Numerical hallucination or stale data

Risk: fluent text presents wrong industrial facts.

Controls:
- deterministic analytics only;
- complete Evidence and data quality;
- source timestamps and calculation versions;
- decline or qualify when coverage or freshness policy fails;
- replayable golden fixtures.

### Denial of service and cost abuse

Risk: huge ranges, dense series, repeated model calls, or slow APIs exhaust the
system.

Controls:
- per-tool range, point, timeout, and concurrency limits;
- connector-side downsampling and bounded retries;
- per-tenant rate/cost budgets;
- cancellable streaming and global/tenant kill switches.

## Security release checks

- Registry capability snapshot contains only read-only tools.
- Prompt-injection fixtures cannot change policy or scope.
- Cross-tenant object and stream requests are denied.
- Secret scanning reports no credentials.
- Dependency and extension package manifests are reviewable.
- Overlay cleanup and host-state integrity pass in Chrome and Edge.
- Audit events exist for denied and successful tool attempts.

## Known residual risks

- Browser extensions cannot honestly guarantee zero effect on a host page.
- Context extraction can break after an upstream UI change.
- Public test endpoints do not validate a real OT/IT network boundary.
- Shadow DOM reduces style/event interference but is not a security sandbox.

The product claim is therefore “read-only analysis and visual augmentation,”
not “incapable of affecting a page.”
