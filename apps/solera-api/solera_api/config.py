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
            "203.146.71.23",
        ]
    )
    easy_pi_base_url: str = "https://easypi.iiotfab.com"
    easy_pi_setting_name: str = "PI-PRD"
    easy_pi_timezone: str = "Asia/Taipei"
    easy_pi_timeout_ms: int = 10_000
    max_range_seconds: int = 7 * 24 * 60 * 60
    max_points: int = 5000
    allowed_tags: list[str] = Field(default_factory=lambda: ["CDT158", "CDT159", "SINUSOID"])
    loop1_enabled: bool = True
    loop1_start_tick: int = Field(default=1, ge=1, le=600)
    loop1_pi_mirror_enabled: bool = False
    loop1_pi_omf_endpoint: str | None = None
    loop1_pi_namespace: str | None = None
    loop1_dwsim_opcua_enabled: bool = False
    loop1_multimodal_enabled: bool = False
    loop1_external_event_bus: str = "in-process"

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
        if self.loop1_pi_mirror_enabled and not (
            self.loop1_pi_omf_endpoint and self.loop1_pi_namespace
        ):
            raise ValueError(
                "LOOP-1 PI mirror requires an OMF endpoint and isolated namespace"
            )
        if self.loop1_external_event_bus not in {
            "in-process",
            "nats-jetstream",
            "redpanda",
        }:
            raise ValueError("invalid LOOP-1 event bus")
        if self.environment == "production":
            if self.dev_auth_enabled:
                raise ValueError("development authentication is forbidden in production")
            if not (self.oidc_issuer and self.oidc_audience and self.oidc_jwks_url):
                raise ValueError("production requires complete OIDC configuration")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
