from __future__ import annotations

from functools import lru_cache

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="SOLERA_",
        env_file=".env",
        extra="ignore",
    )

    environment: str = "development"
    api_prefix: str = "/v1"
    database_url: str = "sqlite+aiosqlite:///./solera.db"
    allowed_domains: list[str] = Field(
        default_factory=lambda: [
            "easypi.iiotfab.com",
            "pivision.iiotfab.com",
        ]
    )
    easy_pi_base_url: str = "https://easypi.iiotfab.com"
    easy_pi_setting_name: str = "PI-PRD"
    easy_pi_timezone: str = "Asia/Taipei"
    easy_pi_timeout_ms: int = 10_000
    max_range_seconds: int = 7 * 24 * 60 * 60
    max_points: int = 5000
    allowed_tags: list[str] = Field(default_factory=lambda: ["CDT158", "CDT159", "SINUSOID"])

    model_provider: str = "disabled"
    model_endpoint: str = "https://api.openai.com/v1/responses"
    model_name: str = "frontier-model"
    model_api_key: str | None = None
    model_timeout_seconds: float = 30
    model_data_policy: str = "summary-only"
    model_input_cost_per_million: float = 0
    model_output_cost_per_million: float = 0

    tenant_requests_per_minute: int = 30
    trace_retention_days: int = 30
    audit_retention_days: int = 365
    aggregate_retention_days: int = 90

    oidc_issuer: str | None = None
    oidc_audience: str | None = None
    oidc_jwks_url: str | None = None
    dev_auth_enabled: bool = True

    @field_validator("allowed_domains", mode="before")
    @classmethod
    def parse_domains(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip().lower() for item in value.split(",") if item.strip()]
        return value

    @field_validator("allowed_tags", mode="before")
    @classmethod
    def parse_tags(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip().upper() for item in value.split(",") if item.strip()]
        return value

    @field_validator("model_data_policy")
    @classmethod
    def validate_model_data_policy(cls, value: str) -> str:
        if value not in {"none", "summary-only", "sampled", "raw"}:
            raise ValueError("invalid model data policy")
        return value

    @model_validator(mode="after")
    def validate_production_identity(self) -> Settings:
        if self.environment == "production":
            if self.dev_auth_enabled:
                raise ValueError("development authentication is forbidden in production")
            if not (self.oidc_issuer and self.oidc_audience and self.oidc_jwks_url):
                raise ValueError("production requires complete OIDC configuration")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
