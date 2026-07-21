from __future__ import annotations

from datetime import datetime

from easy_pi import (
    ConnectorCapabilities,
    ConnectorLimits,
    ConnectorPolicyError,
    CurrentValue,
    DataPoint,
    PointQuality,
    TagDefinition,
    TagSeries,
)
from loop1_simulator import Loop1ScenarioEngine
from solera_api.industrial_contracts import IndustrialObservation, SignalTag


class SyntheticPiConnector:
    """Read-only PI-shaped adapter over the LOOP-1 scenario engine."""

    def __init__(
        self,
        *,
        engine: Loop1ScenarioEngine | None = None,
        limits: ConnectorLimits | None = None,
    ) -> None:
        self.engine = engine or Loop1ScenarioEngine()
        self.limits = limits or ConnectorLimits(
            max_range_seconds=7_200,
            max_points=5_000,
            timeout_ms=2_000,
        )
        self._aliases: dict[str, str] = {}
        for tag in self.engine.manifest.tags:
            self._aliases[tag.tag_id] = tag.tag_id
            for alias in tag.aliases:
                if alias.system == "pi":
                    self._aliases[alias.value] = tag.tag_id

    @property
    def capabilities(self) -> ConnectorCapabilities:
        return ConnectorCapabilities(
            connectorId="synthetic-pi",
            connectorVersion="0.1.0",
            operations=["health", "list-tags", "current", "recorded"],
            limits={
                "maxRangeSeconds": self.limits.max_range_seconds,
                "maxPoints": self.limits.max_points,
                "timeoutMs": self.limits.timeout_ms,
            },
        )

    async def __aenter__(self) -> SyntheticPiConnector:
        return self

    async def __aexit__(self, *_: object) -> None:
        return None

    async def close(self) -> None:
        return None

    async def health(self) -> bool:
        return True

    async def list_tags(self) -> list[TagDefinition]:
        return [
            TagDefinition(
                tag=tag.tag_id,
                descriptor=tag.name,
                value_type=tag.data_type,
            )
            for tag in self.engine.manifest.tags
        ]

    async def current(self, tag: str) -> CurrentValue:
        tag_id = self._resolve_tag(tag)
        if self.engine.run.tick == 0:
            self.engine.step()
        observation = self.engine.current(tag_id)
        definition = self._definition(tag_id)
        return CurrentValue(
            tag=tag_id,
            descriptor=definition.name,
            value_type=definition.data_type,
            point=self._point(observation),
        )

    async def recorded(
        self,
        tag: str,
        *,
        start: datetime,
        end: datetime,
        max_points: int = 1_000,
        boundary_type: int = 2,
    ) -> TagSeries:
        del boundary_type
        tag_id = self._resolve_tag(tag)
        self._validate_range(start, end, max_points)
        target_tick = int(
            (end - self.engine.manifest.starts_at).total_seconds()
            / self.engine.manifest.tick_seconds
        )
        if target_tick > self.engine.run.tick:
            if target_tick - self.engine.run.tick > self.limits.max_range_seconds:
                raise ConnectorPolicyError("synthetic replay request is too large")
            self.engine.step(target_tick - self.engine.run.tick)
        observations = [
            observation
            for observation in self.engine.history(tag_id)
            if start <= observation.timestamp <= end
        ]
        if len(observations) > max_points:
            stride = max(1, len(observations) // max_points)
            observations = observations[::stride][:max_points]
        definition = self._definition(tag_id)
        return TagSeries(
            tag=tag_id,
            descriptor=definition.name,
            value_type=definition.data_type,
            points=[self._point(observation) for observation in observations],
            upstream_metadata={
                "connector": "synthetic-pi",
                "synthetic": True,
                "scenarioId": self.engine.manifest.scenario_id,
                "runId": self.engine.run.run_id,
                "seed": self.engine.run.seed,
            },
        )

    def _resolve_tag(self, value: str) -> str:
        try:
            return self._aliases[value]
        except KeyError as error:
            raise ConnectorPolicyError(f"unknown synthetic PI tag: {value}") from error

    def _definition(self, tag_id: str) -> SignalTag:
        return next(tag for tag in self.engine.manifest.tags if tag.tag_id == tag_id)

    def _validate_range(
        self,
        start: datetime,
        end: datetime,
        max_points: int,
    ) -> None:
        if start.tzinfo is None or end.tzinfo is None:
            raise ConnectorPolicyError("synthetic PI range must be timezone aware")
        if end <= start:
            raise ConnectorPolicyError("synthetic PI end must be after start")
        if (end - start).total_seconds() > self.limits.max_range_seconds:
            raise ConnectorPolicyError("synthetic PI range exceeds connector limit")
        if max_points < 1 or max_points > self.limits.max_points:
            raise ConnectorPolicyError("synthetic PI max_points exceeds connector limit")

    @staticmethod
    def _point(observation: IndustrialObservation) -> DataPoint:
        return DataPoint(
            timestamp=observation.timestamp,
            value=observation.value,
            quality=PointQuality(observation.quality),
        )
