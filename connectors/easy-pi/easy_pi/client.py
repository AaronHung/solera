from __future__ import annotations

import asyncio
import re
from datetime import datetime
from typing import Any
from urllib.parse import quote
from zoneinfo import ZoneInfo

import httpx

from .models import (
    ConnectorCapabilities,
    ConnectorLimits,
    CurrentValue,
    DataPoint,
    PointQuality,
    TagDefinition,
    TagSeries,
)

SAFE_NAME = re.compile(r"^[A-Za-z0-9_.:-]{1,128}$")


class ConnectorError(RuntimeError):
    """Base class for safe connector failures."""


class ConnectorPolicyError(ConnectorError):
    """The request violates local Solera connector policy."""


class ConnectorUpstreamError(ConnectorError):
    """Easy PI returned an unusable response."""


class EasyPiConnector:
    """Hardcoded GET-only Easy PI connector.

    The Agent never supplies an HTTP method or arbitrary path. Public methods
    validate all identifiers, ranges, and point limits before constructing one
    of the reviewed allowlisted GET URLs.
    """

    def __init__(
        self,
        *,
        base_url: str,
        setting_name: str,
        timezone: str = "Asia/Taipei",
        limits: ConnectorLimits | None = None,
        client: httpx.AsyncClient | None = None,
        max_retries: int = 1,
    ) -> None:
        if not base_url.startswith(("https://", "http://localhost", "http://127.0.0.1")):
            raise ConnectorPolicyError("Easy PI base URL must use HTTPS")
        self._validate_name(setting_name, "setting name")
        self.base_url = base_url.rstrip("/")
        self.setting_name = setting_name
        self.timezone = ZoneInfo(timezone)
        self.limits = limits or ConnectorLimits()
        self.max_retries = max(0, min(max_retries, 2))
        self._owns_client = client is None
        self._client = client or httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.limits.timeout_ms / 1000,
            follow_redirects=False,
            headers={"Accept": "application/json", "User-Agent": "Solera-EasyPI/0.1.0"},
        )

    @property
    def capabilities(self) -> ConnectorCapabilities:
        return ConnectorCapabilities(
            limits={
                "maxRangeSeconds": self.limits.max_range_seconds,
                "maxPoints": self.limits.max_points,
                "timeoutMs": self.limits.timeout_ms,
            }
        )

    async def close(self) -> None:
        if self._owns_client:
            await self._client.aclose()

    async def __aenter__(self) -> EasyPiConnector:
        return self

    async def __aexit__(self, *_: object) -> None:
        await self.close()

    async def health(self) -> bool:
        payload = await self._get("/PIBridge/Server")
        if not isinstance(payload, bool):
            raise ConnectorUpstreamError("Easy PI health response was not boolean")
        return payload

    async def current(self, tag: str) -> CurrentValue:
        safe_tag = self._validate_name(tag, "tag")
        path = f"/PIBridge/PITagData/{quote(self.setting_name, safe='')}/{quote(safe_tag, safe='')}"
        payload = await self._get(path)
        if not isinstance(payload, dict):
            raise ConnectorUpstreamError("Easy PI current response was not an object")
        return self._parse_current(payload, expected_tag=safe_tag)

    async def recorded(
        self,
        tag: str,
        *,
        start: datetime,
        end: datetime,
        max_points: int = 1000,
        boundary_type: int = 2,
    ) -> TagSeries:
        safe_tag = self._validate_name(tag, "tag")
        self._validate_range(start, end)
        if max_points < 1 or max_points > self.limits.max_points:
            raise ConnectorPolicyError(f"max_points must be between 1 and {self.limits.max_points}")
        if boundary_type not in {0, 1, 2}:
            raise ConnectorPolicyError("boundary_type must be 0, 1, or 2")

        start_token = self._time_token(start)
        end_token = self._time_token(end)
        path = (
            f"/PIBridge/PITagData/{quote(self.setting_name, safe='')}/"
            f"{quote(safe_tag, safe='')}/Record/ByTimeRange/"
            f"{start_token}/{end_token}"
        )
        payload = await self._get(
            path,
            params={
                "BoundaryType": boundary_type,
                "PageType": 2,
                "PageSize": max_points,
            },
        )
        if not isinstance(payload, dict):
            raise ConnectorUpstreamError("Easy PI recorded response was not an object")
        return self._parse_series(payload, expected_tag=safe_tag)

    async def search_tags(self, pattern: str) -> list[TagDefinition]:
        if not pattern or len(pattern) > 128 or not re.fullmatch(r"[A-Za-z0-9_.:*-]+", pattern):
            raise ConnectorPolicyError("tag pattern contains unsupported characters")
        path = f"/PIBridge/Tags/{quote(self.setting_name, safe='')}/Query/ByName"
        payload = await self._get(path, params={"TagName": pattern})
        if not isinstance(payload, list):
            raise ConnectorUpstreamError("Easy PI tag search response was not an array")
        return [
            TagDefinition(
                tag=str(item.get("TagName", "")),
                descriptor=item.get("Descriptor"),
                value_type=item.get("ValueType"),
            )
            for item in payload
            if isinstance(item, dict) and item.get("TagName")
        ]

    async def _get(
        self,
        path: str,
        *,
        params: dict[str, str | int] | None = None,
    ) -> Any:
        for attempt in range(self.max_retries + 1):
            try:
                response = await self._client.get(path, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.TimeoutException as exc:
                if attempt < self.max_retries:
                    await asyncio.sleep(0.05 * (attempt + 1))
                    continue
                raise ConnectorUpstreamError("Easy PI request timed out") from exc
            except httpx.HTTPStatusError as exc:
                status = exc.response.status_code
                if status in {502, 503, 504} and attempt < self.max_retries:
                    await asyncio.sleep(0.05 * (attempt + 1))
                    continue
                if status in {401, 403}:
                    raise ConnectorUpstreamError("Easy PI denied the request") from exc
                if status == 404:
                    raise ConnectorUpstreamError("Easy PI resource was not found") from exc
                if status == 429:
                    raise ConnectorUpstreamError("Easy PI rate limit was reached") from exc
                raise ConnectorUpstreamError(f"Easy PI returned HTTP {status}") from exc
            except httpx.HTTPError as exc:
                if attempt < self.max_retries:
                    await asyncio.sleep(0.05 * (attempt + 1))
                    continue
                raise ConnectorUpstreamError("Easy PI network request failed") from exc
            except ValueError as exc:
                raise ConnectorUpstreamError("Easy PI returned invalid JSON") from exc
        raise ConnectorUpstreamError("Easy PI request failed")

    def _validate_range(self, start: datetime, end: datetime) -> None:
        if start.tzinfo is None or end.tzinfo is None:
            raise ConnectorPolicyError("time range must use timezone-aware datetimes")
        seconds = (end - start).total_seconds()
        if seconds <= 0:
            raise ConnectorPolicyError("time range end must be after start")
        if seconds > self.limits.max_range_seconds:
            raise ConnectorPolicyError(
                f"time range exceeds {self.limits.max_range_seconds} seconds"
            )

    def _time_token(self, value: datetime) -> str:
        return value.astimezone(self.timezone).strftime("%Y%m%d%H%M%S")

    @staticmethod
    def _validate_name(value: str, label: str) -> str:
        if not SAFE_NAME.fullmatch(value):
            raise ConnectorPolicyError(f"{label} contains unsupported characters")
        return value

    @staticmethod
    def _parse_timestamp(raw: object) -> datetime:
        if not isinstance(raw, str):
            raise ConnectorUpstreamError("Easy PI point is missing TriggerTime")
        try:
            value = datetime.fromisoformat(raw)
        except ValueError as exc:
            raise ConnectorUpstreamError("Easy PI point has invalid TriggerTime") from exc
        if value.tzinfo is None:
            raise ConnectorUpstreamError("Easy PI point TriggerTime has no timezone")
        return value

    @staticmethod
    def _normalize_value(raw: object) -> tuple[float | str | bool | None, PointQuality]:
        if raw is None:
            return None, PointQuality.MISSING
        if isinstance(raw, bool):
            return raw, PointQuality.GOOD
        if isinstance(raw, int | float):
            return float(raw), PointQuality.GOOD
        if isinstance(raw, str):
            return raw, PointQuality.GOOD
        return None, PointQuality.BAD

    def _parse_current(self, payload: dict[str, Any], *, expected_tag: str) -> CurrentValue:
        tag = str(payload.get("TagName") or expected_tag)
        value, quality = self._normalize_value(payload.get("Value"))
        point = DataPoint(
            timestamp=self._parse_timestamp(payload.get("TriggerTime")),
            value=value,
            quality=quality,
        )
        return CurrentValue(
            tag=tag,
            descriptor=payload.get("Descriptor"),
            value_type=payload.get("ValueType"),
            point=point,
        )

    def _parse_series(self, payload: dict[str, Any], *, expected_tag: str) -> TagSeries:
        raw_record = payload.get("Record")
        if raw_record is None:
            raw_record = []
        if not isinstance(raw_record, list):
            raise ConnectorUpstreamError("Easy PI Record was not an array")

        points: list[DataPoint] = []
        for raw_point in raw_record:
            if not isinstance(raw_point, dict):
                continue
            value, quality = self._normalize_value(raw_point.get("Value"))
            points.append(
                DataPoint(
                    timestamp=self._parse_timestamp(raw_point.get("TriggerTime")),
                    value=value,
                    quality=quality,
                )
            )

        points.sort(key=lambda point: point.timestamp)
        return TagSeries(
            tag=str(payload.get("TagName") or expected_tag),
            descriptor=payload.get("Descriptor"),
            value_type=payload.get("ValueType"),
            points=points,
            upstream_metadata={"boundaryPointsPossible": True},
        )
