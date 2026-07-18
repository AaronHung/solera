import pytest
from pydantic import ValidationError
from solera_api.config import Settings


def test_production_fails_closed_without_oidc_and_with_dev_auth() -> None:
    with pytest.raises(ValidationError, match="development authentication"):
        Settings(environment="production", dev_auth_enabled=True)

    with pytest.raises(ValidationError, match="OIDC"):
        Settings(environment="production", dev_auth_enabled=False)

    settings = Settings(
        environment="production",
        dev_auth_enabled=False,
        oidc_issuer="https://identity.example",
        oidc_audience="solera-api",
        oidc_jwks_url="https://identity.example/jwks",
    )
    assert settings.environment == "production"
