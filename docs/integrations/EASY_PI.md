# Easy PI v0.1 Integration Notes

Validated: 2026-07-18 against `https://easypi.iiotfab.com`  
Swagger: `/swagger/docs/V1`  
Observed API version: easy PI `2.1.2026.0223`, library `2.3.2026.0223`

## Live observations

- The public test API was reachable without an Authorization header.
- The active setting name was `PI-PRD`.
- `GET /PIBridge/PITagData/PI-PRD/CDT158` and CDT159 returned current
  `System.Single` values with ISO-8601 timestamps and `+08:00` offsets.
- `GET .../Record/ByTimeRange/-1h/Now` returned a `PiTagValueModel` whose
  `Record` contains `{TriggerTime, StringTime, ValueType, Value}` items.
- The recorded response includes synthetic boundary points when
  `BoundaryType=2`; calculations must document or remove boundary points
  according to the requested analysis.
- The outer recorded object used `TriggerTime=0001-01-01T00:00:00`; this is not
  a data point and must not be interpreted as one.
- SINUSOID's observed current timestamp was 2026-06-12 while CDT Tags were
  current on 2026-07-18. Freshness is therefore a required quality signal.
- Swagger defaults `PageSize=1000`; Solera sets its own lower/equal bounded
  policy and never relies on an upstream default.
- No rate-limit headers or documented authentication scheme were present in
  the Swagger contract. This is not evidence that production has no limits or
  authentication.

## Security-critical finding

The Swagger document exposes both read and mutating endpoints, including:

- Tag create/update/delete;
- Tag value POST/PUT;
- recorded value DELETE;
- generic Values POST/PUT/DELETE.

Solera must not generate a full API client and expose it as Agent tools.
`EasyPiConnector` implements a hardcoded GET-only allowlist. URLs are assembled
inside connector methods; the Agent cannot supply a path or HTTP method.

## v0.1 allowlist

- `GET /PIBridge/Server`
- `GET /PIBridge/Server/PIBridgeServerVision`
- `GET /PIBridge/PIServer/PIServerList`
- `GET /PIBridge/Tags/{setting}/Query/ByName`
- `GET /PIBridge/PITagData/{setting}/{tag}`
- `GET /PIBridge/PITagData/{setting}/MultiTag`
- `GET /PIBridge/PITagData/{setting}/{tag}/Record/ByTimeRange/{start}/{end}`
- `GET /PIBridge/PITagData/{setting}/MultiTag/Record/ByTimeRange/{start}/{end}`
- Interpolated GET variants after interval/range validation
- AF database, element, template, and attribute GET endpoints after path scope
  validation
- `GET /PIBridge/PIVision/{setting}`

The Pilot implementation initially exposes health, current, recorded, and
Tag lookup. Additional allowlisted operations require connector contract tests.

## Unverified production assumptions

- Authentication and certificate chain.
- Sustained rate and concurrency limits.
- Maximum response/body size.
- Semantics of bad/questionable PI values.
- Pagination behavior beyond `PageSize`.
- Production timezone and clock synchronization.
- Private-network deployment and credential rotation.

These remain explicit Pilot onboarding checks.
