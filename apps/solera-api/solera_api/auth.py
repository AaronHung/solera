from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header, HTTPException, Request, status
from pydantic import BaseModel, ConfigDict

from .config import Settings, get_settings
from .oidc import OidcVerificationError, OidcVerifier


class Principal(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    tenant_id: str
    actor_id: str
    roles: frozenset[str]
    asset_scopes: frozenset[str] = frozenset({"*"})
    auth_method: str


def _parse_dev_token(token: str) -> Principal:
    parts = token.split(":")
    if len(parts) != 4 or parts[0] != "dev":
        raise ValueError("invalid development token")
    _, tenant_id, actor_id, raw_roles = parts
    roles = frozenset(role.strip() for role in raw_roles.split(",") if role.strip())
    if not tenant_id or not actor_id or not roles:
        raise ValueError("development token is incomplete")
    return Principal(
        tenant_id=tenant_id,
        actor_id=actor_id,
        roles=roles,
        asset_scopes=frozenset({"*"}),
        auth_method="development",
    )


SettingsDependency = Annotated[Settings, Depends(get_settings)]


async def get_principal(
    request: Request,
    settings: SettingsDependency,
    authorization: Annotated[str | None, Header()] = None,
) -> Principal:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "AUTH_REQUIRED", "message": "Bearer authentication is required"},
        )
    token = authorization.removeprefix("Bearer ").strip()

    if token.startswith("dev:"):
        if not settings.dev_auth_enabled or settings.environment == "production":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "DEV_AUTH_DISABLED", "message": "Development auth is disabled"},
            )
        try:
            return _parse_dev_token(token)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_DEV_TOKEN", "message": str(exc)},
            ) from exc

    verifier: OidcVerifier | None = getattr(request.app.state, "oidc_verifier", None)
    if verifier is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "OIDC_NOT_CONFIGURED",
                "message": "The supplied token cannot be validated by this deployment",
            },
        )
    try:
        identity = await verifier.verify(token)
    except OidcVerificationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_OIDC_TOKEN", "message": str(exc)},
        ) from exc
    return Principal(
        tenant_id=identity.tenant_id,
        actor_id=identity.actor_id,
        roles=identity.roles,
        asset_scopes=identity.asset_scopes,
        auth_method="oidc",
    )


PrincipalDependency = Annotated[Principal, Depends(get_principal)]
