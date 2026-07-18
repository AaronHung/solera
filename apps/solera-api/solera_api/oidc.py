from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

import httpx
import jwt

from .config import Settings


class OidcVerificationError(RuntimeError):
    pass


@dataclass(frozen=True)
class VerifiedIdentity:
    tenant_id: str
    actor_id: str
    roles: frozenset[str]
    asset_scopes: frozenset[str]


class OidcVerifier:
    def __init__(
        self,
        settings: Settings,
        *,
        client: httpx.AsyncClient | None = None,
        cache_seconds: int = 300,
    ) -> None:
        self.settings = settings
        self._owns_client = client is None
        self._client = client or httpx.AsyncClient(timeout=10, follow_redirects=False)
        self.cache_seconds = cache_seconds
        self._keys: dict[str, Any] = {}
        self._keys_expire_at = 0.0

    async def close(self) -> None:
        if self._owns_client:
            await self._client.aclose()

    @property
    def configured(self) -> bool:
        return bool(
            self.settings.oidc_issuer
            and self.settings.oidc_audience
            and self.settings.oidc_jwks_url
        )

    async def verify(self, token: str) -> VerifiedIdentity:
        if not self.configured:
            raise OidcVerificationError("OIDC is not configured")
        try:
            header = jwt.get_unverified_header(token)
        except jwt.PyJWTError as exc:
            raise OidcVerificationError("Token header is invalid") from exc
        algorithm = header.get("alg")
        key_id = header.get("kid")
        if algorithm != "RS256" or not isinstance(key_id, str):
            raise OidcVerificationError("Only RS256 tokens with a key ID are accepted")

        key = await self._get_key(key_id)
        try:
            claims = jwt.decode(
                token,
                key=key,
                algorithms=["RS256"],
                audience=self.settings.oidc_audience,
                issuer=self.settings.oidc_issuer,
                options={"require": ["exp", "iat", "sub"]},
            )
        except jwt.PyJWTError as exc:
            raise OidcVerificationError("Token signature or claims are invalid") from exc

        tenant_id = claims.get("tenant_id") or claims.get("tid")
        actor_id = claims.get("sub")
        if not isinstance(tenant_id, str) or not isinstance(actor_id, str):
            raise OidcVerificationError("Token is missing tenant or subject claims")
        raw_roles = claims.get("roles", [])
        if isinstance(raw_roles, str):
            raw_roles = raw_roles.split()
        if not isinstance(raw_roles, list):
            raise OidcVerificationError("Token roles claim is invalid")
        roles = frozenset(str(role) for role in raw_roles if role)
        if not roles:
            raise OidcVerificationError("Token grants no Solera role")

        raw_assets = claims.get("asset_scopes", ["*"])
        if isinstance(raw_assets, str):
            raw_assets = raw_assets.split()
        if not isinstance(raw_assets, list):
            raise OidcVerificationError("Token asset scopes claim is invalid")
        asset_scopes = frozenset(str(scope) for scope in raw_assets if scope)
        return VerifiedIdentity(
            tenant_id=tenant_id,
            actor_id=actor_id,
            roles=roles,
            asset_scopes=asset_scopes or frozenset({"*"}),
        )

    async def _get_key(self, key_id: str) -> Any:
        now = time.monotonic()
        if now >= self._keys_expire_at or key_id not in self._keys:
            await self._refresh_keys()
        key = self._keys.get(key_id)
        if key is None:
            raise OidcVerificationError("Token signing key was not found")
        return key

    async def _refresh_keys(self) -> None:
        try:
            response = await self._client.get(str(self.settings.oidc_jwks_url))
            response.raise_for_status()
            body = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise OidcVerificationError("OIDC signing keys could not be loaded") from exc
        raw_keys = body.get("keys") if isinstance(body, dict) else None
        if not isinstance(raw_keys, list):
            raise OidcVerificationError("OIDC JWKS response is invalid")
        parsed: dict[str, Any] = {}
        for item in raw_keys:
            if not isinstance(item, dict) or not isinstance(item.get("kid"), str):
                continue
            try:
                parsed[item["kid"]] = jwt.PyJWK.from_dict(item, algorithm="RS256").key
            except (jwt.PyJWTError, ValueError):
                continue
        if not parsed:
            raise OidcVerificationError("OIDC JWKS contains no usable RS256 keys")
        self._keys = parsed
        self._keys_expire_at = time.monotonic() + self.cache_seconds
