# Solera v0.1 Deployment

## Supported shapes

### Development

- Local FastAPI and SQLite.
- Public Easy PI connector runs in the API process.
- Unpacked Chrome/Edge extension.
- Development bearer tokens permitted only when environment is not production.

### Pilot

- Solera API container behind enterprise TLS ingress.
- Postgres as tenant-scoped system of record.
- Enterprise OIDC with RS256, issuer, audience, role, tenant, and asset scopes.
- Managed MV3 extension package with a recorded SHA-256 and SBOM.
- Easy PI connector remains server-side while the data source is publicly
  reachable and approved.

### Future Hybrid

- The same Connector contract moves behind an outbound-only customer Bridge.
- PI credentials stay in the customer secret boundary.
- No inbound cloud-to-OT connection is opened.
- The model gateway can move to customer VPC/on-prem without changing Agent
  tools, Evidence, or ViewSpec.

## Container deployment

Copy `.env.example` to a secret-managed environment file. Never commit it.

```bash
export POSTGRES_PASSWORD='use-a-secret-provider'
docker compose up --build
```

The compose file binds API to loopback. Put a TLS ingress in front before
remote access. Postgres is not published to the host.

Production requirements:

```text
SOLERA_ENVIRONMENT=production
SOLERA_DEV_AUTH_ENABLED=false
SOLERA_OIDC_ISSUER=https://...
SOLERA_OIDC_AUDIENCE=solera-api
SOLERA_OIDC_JWKS_URL=https://.../jwks
SOLERA_MODEL_PROVIDER=openai-responses  # only after policy approval
SOLERA_MODEL_API_KEY=<secret reference>
```

Set real per-million pricing to make the operations endpoint's estimated cost
meaningful. A zero price means “not configured,” not “free.”

## Extension distribution

```bash
npm run package:extension
npm run sbom:js
npm run sbom:python
```

Distribute the generated zip through Chrome Enterprise or Microsoft Edge
management. Pin the extension ID/update policy and the exact approved hosts.
Do not replace host permissions with `<all_urls>`.

## Rollback

- Disable the affected tenant/domain/adapter/connector/model/capability.
- Roll back API container and managed extension policy to a known SHA-256.
- Keep database migrations backward compatible within the Pilot release.
- Do not delete traces/audit records during rollback; follow retention policy.
