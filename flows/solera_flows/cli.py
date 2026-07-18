from __future__ import annotations

import argparse
import asyncio
import json

from easy_pi import ConnectorLimits, EasyPiConnector
from solera_api.config import Settings
from solera_api.storage import Database, FlowRepository, RetentionRepository

from .jobs import run_nightly_aggregates, run_retention_cleanup, run_trace_to_eval


async def run(command: str, tenant_id: str) -> dict[str, object]:
    settings = Settings()
    database = Database(settings.database_url)
    await database.initialize()
    repository = FlowRepository(database)
    try:
        if command == "retention":
            return await run_retention_cleanup(
                repository=RetentionRepository(database),
                tenant_id=tenant_id,
                trace_days=settings.trace_retention_days,
                audit_days=settings.audit_retention_days,
                aggregate_days=settings.aggregate_retention_days,
            )
        if command == "evals":
            return await run_trace_to_eval(repository=repository, tenant_id=tenant_id)
        connector = EasyPiConnector(
            base_url=settings.easy_pi_base_url,
            setting_name=settings.easy_pi_setting_name,
            timezone=settings.easy_pi_timezone,
            limits=ConnectorLimits(
                max_range_seconds=settings.max_range_seconds,
                max_points=settings.max_points,
                timeout_ms=settings.easy_pi_timeout_ms,
            ),
        )
        try:
            return await run_nightly_aggregates(
                repository=repository,
                connector=connector,
                tenant_id=tenant_id,
                tags=settings.allowed_tags,
                timezone=settings.easy_pi_timezone,
            )
        finally:
            await connector.close()
    finally:
        await database.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Run idempotent Solera Flow jobs")
    parser.add_argument("command", choices=["aggregates", "evals", "retention"])
    parser.add_argument("--tenant", required=True)
    arguments = parser.parse_args()
    result = asyncio.run(run(arguments.command, arguments.tenant))
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
