from __future__ import annotations

import json
from datetime import UTC, datetime, timedelta

import httpx
import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from solera_api.config import Settings
from solera_api.oidc import OidcVerificationError, OidcVerifier


@pytest.mark.asyncio
async def test_oidc_verifier_enforces_signature_tenant_roles_and_asset_scope() -> None:
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    jwk = json.loads(jwt.algorithms.RSAAlgorithm.to_jwk(private_key.public_key()))
    jwk.update({"kid": "pilot-key", "alg": "RS256", "use": "sig"})

    async def handler(request: httpx.Request) -> httpx.Response:
        assert str(request.url) == "https://identity.example/.well-known/jwks.json"
        return httpx.Response(200, json={"keys": [jwk]})

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    settings = Settings(
        dev_auth_enabled=False,
        oidc_issuer="https://identity.example",
        oidc_audience="solera-api",
        oidc_jwks_url="https://identity.example/.well-known/jwks.json",
    )
    verifier = OidcVerifier(settings, client=client)
    now = datetime.now(UTC)
    token = jwt.encode(
        {
            "iss": settings.oidc_issuer,
            "aud": settings.oidc_audience,
            "sub": "engineer-1",
            "tenant_id": "tenant-demo",
            "roles": ["engineer"],
            "asset_scopes": ["mixing-tank-1"],
            "iat": now,
            "exp": now + timedelta(minutes=5),
        },
        private_key,
        algorithm="RS256",
        headers={"kid": "pilot-key"},
    )

    identity = await verifier.verify(token)
    assert identity.tenant_id == "tenant-demo"
    assert identity.roles == frozenset({"engineer"})
    assert identity.asset_scopes == frozenset({"mixing-tank-1"})

    header, payload, signature = token.split(".")
    replacement = "A" if signature[0] != "A" else "B"
    invalid = f"{header}.{payload}.{replacement}{signature[1:]}"
    with pytest.raises(OidcVerificationError):
        await verifier.verify(invalid)
    await client.aclose()
