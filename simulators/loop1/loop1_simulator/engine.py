from __future__ import annotations

import hashlib
import json
import math
from dataclasses import dataclass
from datetime import timedelta
from typing import Any

from solera_api.industrial_contracts import (
    AlarmEvent,
    FaultDefinition,
    IndustrialObservation,
    ScenarioManifest,
    ScenarioRun,
    ScenarioState,
    SignalTag,
)

from .manifest import build_manifest


@dataclass(frozen=True)
class EngineFrame:
    run: ScenarioRun
    observations: tuple[IndustrialObservation, ...]
    alarms: tuple[AlarmEvent, ...]


ALARM_SPECS: tuple[tuple[str, str, str, str], ...] = (
    ("fv101-position-deviation", "cooling-valve-position", "high", "FV-101 position deviation"),
    ("cw-flow-low", "cooling-water-flow", "high", "R-101 cooling-water flow low"),
    (
        "cw-outlet-temp-high",
        "cooling-water-outlet-temp",
        "medium",
        "Cooling-water outlet temperature high",
    ),
    ("reactor-temp-high", "reactor-temperature", "critical", "R-101 reactor temperature high"),
    ("reactor-pressure-high", "reactor-pressure", "critical", "R-101 reactor pressure high"),
    ("reactor-heat-duty-high", "reactor-heat-duty", "high", "R-101 heat duty high"),
    ("separator-level-high", "separator-level", "high", "V-101 separator level high"),
    ("separator-pressure-high", "separator-pressure", "high", "V-101 separator pressure high"),
    ("separator-temp-high", "separator-temperature", "medium", "V-101 separator temperature high"),
    ("compressor-load-high", "compressor-load", "high", "K-101 compressor load high"),
    ("compressor-vibration-high", "compressor-vibration-de", "medium", "K-101 vibration high"),
    (
        "compressor-bearing-temp-high",
        "compressor-bearing-temp-de",
        "medium",
        "K-101 bearing temperature high",
    ),
    (
        "compressor-surge-margin-low",
        "compressor-surge-margin",
        "critical",
        "K-101 surge margin low",
    ),
    ("stripper-top-temp-high", "stripper-temperature-top", "medium", "T-101 top temperature high"),
    ("product-quality-low", "product-quality-proxy", "high", "Product quality proxy low"),
    ("unit-energy-high", "unit-energy-intensity", "medium", "Unit energy intensity high"),
    ("unit-on-spec-low", "unit-on-spec-rate", "high", "Unit on-spec rate low"),
    ("alarm-flood", "unit-alarm-rate", "critical", "Unit alarm flood threshold exceeded"),
)


class ScenarioInvariantError(RuntimeError):
    """The deterministic scenario produced an impossible synthetic state."""


class Loop1ScenarioEngine:
    """Deterministic LOOP-1 process narrative and replay clock.

    The equations are intentionally reduced-order and are not a customer plant
    model. Their purpose is to preserve ordering, delays, and bounded process
    relationships for Agent evaluation.
    """

    def __init__(self, manifest: ScenarioManifest | None = None) -> None:
        self.manifest = manifest or build_manifest()
        self._tags = {tag.tag_id: tag for tag in self.manifest.tags}
        self._history: dict[str, list[IndustrialObservation]] = {
            tag.tag_id: [] for tag in self.manifest.tags
        }
        self._alarms: list[AlarmEvent] = []
        self._alarm_codes: set[str] = set()
        self._extra_faults: list[FaultDefinition] = []
        self._paused_from: ScenarioState | None = None
        self.run = self._new_run()

    def _new_run(self) -> ScenarioRun:
        return ScenarioRun(
            run_id=f"run-{self.manifest.scenario_id}-{self.manifest.seed}",
            scenario_id=self.manifest.scenario_id,
            tenant_id=self.manifest.tenant_id,
            seed=self.manifest.seed,
            state="normal",
            started_at=self.manifest.starts_at,
            simulation_time=self.manifest.starts_at,
            tick=0,
            active_faults=[],
        )

    @property
    def truth(self) -> dict[str, Any]:
        return {
            "synthetic": True,
            "scenarioId": self.manifest.scenario_id,
            "rootCause": "cooling-water control valve stiction",
            "rootAssetId": "component-cooling-valve",
            "rootFaultId": "cooling-valve-stiction",
            "earliestChangeTag": "cooling-valve-position",
            "causalOrder": [
                "cooling-valve-command",
                "cooling-valve-position",
                "cooling-water-flow",
                "reactor-temperature",
                "reactor-pressure",
                "separator-level",
                "product-quality-proxy",
            ],
        }

    @property
    def alarms(self) -> tuple[AlarmEvent, ...]:
        return tuple(self._alarms)

    def history(self, tag_id: str) -> tuple[IndustrialObservation, ...]:
        if tag_id not in self._history:
            raise KeyError(f"unknown LOOP-1 tag: {tag_id}")
        return tuple(self._history[tag_id])

    def current(self, tag_id: str) -> IndustrialObservation:
        history = self.history(tag_id)
        if not history:
            raise KeyError(f"LOOP-1 tag has no observations yet: {tag_id}")
        return history[-1]

    def pause(self) -> None:
        if self.run.state != "paused":
            self._paused_from = self.run.state
            self.run = self.run.model_copy(update={"state": "paused"})

    def resume(self) -> None:
        if self.run.state == "paused":
            self.run = self.run.model_copy(
                update={"state": self._paused_from or self._state_for_tick(self.run.tick)}
            )
            self._paused_from = None

    def reset(self) -> EngineFrame:
        self._history = {tag.tag_id: [] for tag in self.manifest.tags}
        self._alarms.clear()
        self._alarm_codes.clear()
        self._extra_faults.clear()
        self._paused_from = None
        self.run = self._new_run()
        return EngineFrame(run=self.run, observations=(), alarms=())

    def jump_to_fault(self) -> EngineFrame:
        self.reset()
        fault_tick = min(fault.inject_at_tick for fault in self.manifest.faults)
        return self.step(fault_tick)

    def inject_fault(self, fault: FaultDefinition) -> None:
        asset_ids = {asset.asset_id for asset in self.manifest.assets}
        if fault.asset_id not in asset_ids:
            raise ValueError(f"fault references unknown asset: {fault.asset_id}")
        if fault.inject_at_tick < self.run.tick:
            raise ValueError("fault cannot be injected in the past")
        self._extra_faults.append(fault)

    def step(self, count: int = 1) -> EngineFrame:
        if count < 0:
            raise ValueError("step count must be non-negative")
        if self.run.state == "paused" or count == 0:
            return EngineFrame(run=self.run, observations=(), alarms=())

        latest_observations: tuple[IndustrialObservation, ...] = ()
        latest_alarms: tuple[AlarmEvent, ...] = ()
        for _ in range(count):
            tick = self.run.tick + 1
            simulation_time = self.manifest.starts_at + timedelta(
                seconds=tick * self.manifest.tick_seconds
            )
            active_faults = [
                fault.fault_id
                for fault in (*self.manifest.faults, *self._extra_faults)
                if fault.inject_at_tick <= tick
            ]
            self.run = self.run.model_copy(
                update={
                    "tick": tick,
                    "simulation_time": simulation_time,
                    "state": self._state_for_tick(tick),
                    "active_faults": active_faults,
                }
            )
            latest_observations = tuple(self._observation(tag) for tag in self.manifest.tags)
            for observation in latest_observations:
                self._history[observation.tag_id].append(observation)
            latest_alarms = tuple(self._new_alarms())
            self._alarms.extend(latest_alarms)
            self.validate_invariants(latest_observations)
        return EngineFrame(
            run=self.run,
            observations=latest_observations,
            alarms=latest_alarms,
        )

    def replay(self, to_tick: int) -> EngineFrame:
        if to_tick < 0:
            raise ValueError("replay tick must be non-negative")
        self.reset()
        return self.step(to_tick)

    def export_replay(self) -> bytes:
        payload = {
            "manifest": self.manifest.model_dump(by_alias=True, mode="json"),
            "run": self.run.model_dump(by_alias=True, mode="json"),
            "truth": self.truth,
            "observations": {
                tag: [
                    observation.model_dump(by_alias=True, mode="json")
                    for observation in observations
                ]
                for tag, observations in sorted(self._history.items())
            },
            "alarms": [alarm.model_dump(by_alias=True, mode="json") for alarm in self._alarms],
        }
        return json.dumps(
            payload,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
        ).encode()

    def _state_for_tick(self, tick: int) -> ScenarioState:
        if tick < 120:
            return "normal"
        if tick < 180:
            return "degrading"
        if tick < 260:
            return "alarm-flood"
        if tick < 320:
            return "investigation"
        if tick < 360:
            return "approval"
        return "recovery"

    def _observation(self, tag: SignalTag) -> IndustrialObservation:
        value = self._value_for_tag(tag)
        quality = self._quality_for_tag(tag.tag_id)
        if quality == "missing":
            value = None
        return IndustrialObservation(
            observation_id=f"{self.run.run_id}:{tag.tag_id}:{self.run.tick:06d}",
            tenant_id=self.manifest.tenant_id,
            run_id=self.run.run_id,
            tag_id=tag.tag_id,
            timestamp=self.run.simulation_time,
            value=value,
            quality=quality,
            sequence=self.run.tick,
        )

    def _value_for_tag(self, tag: SignalTag) -> float:
        tick = self.run.tick
        fault = self._ramp(tick, 120, 80)
        recovery = self._ramp(tick, 360, 80)
        fault *= 1 - recovery
        thermal = self._ramp(tick, 145, 100) * (1 - recovery)
        downstream = self._ramp(tick, 170, 100) * (1 - recovery)
        periodic = math.sin((tick + self._stable_phase(tag.tag_id)) / 18)
        noise = self._stable_noise(tag.tag_id, tick)

        known = {
            "cooling-valve-command": 52 + 18 * fault + periodic * 0.4,
            "cooling-valve-position": 52 + 3 * fault + periodic * 0.25,
            "cooling-water-flow": 105 - 34 * fault + periodic * 0.7,
            "cooling-water-inlet-temp": 27 + periodic * 0.3,
            "cooling-water-outlet-temp": 40 + 11 * thermal + periodic * 0.4,
            "reactor-temperature": 120 + 13.5 * thermal + periodic * 0.2,
            "reactor-pressure": 2.5 + 0.72 * thermal + periodic * 0.01,
            "reactor-level": 55 + 8 * downstream + periodic * 0.3,
            "reactor-feed-flow": 96 - 4 * downstream + periodic * 0.25,
            "reactor-agitator-current": 78 + 8 * thermal + periodic * 0.2,
            "reactor-heat-duty": 9.2 + 2.7 * thermal + periodic * 0.08,
            "condenser-duty": 5.5 + 1.7 * downstream + periodic * 0.05,
            "condenser-outlet-temp": 38 + 10 * downstream + periodic * 0.2,
            "separator-level": 52 + 24 * downstream + periodic * 0.4,
            "separator-pressure": 2.25 + 0.6 * downstream + periodic * 0.01,
            "separator-temperature": 64 + 13 * downstream + periodic * 0.2,
            "compressor-load": 68 + 23 * downstream + periodic * 0.3,
            "compressor-vibration-de": 2.2 + 3.0 * downstream + periodic * 0.05,
            "compressor-vibration-nde": 2.0 + 2.7 * downstream + periodic * 0.05,
            "compressor-bearing-temp-de": 68 + 17 * downstream + periodic * 0.2,
            "compressor-bearing-temp-nde": 66 + 15 * downstream + periodic * 0.2,
            "compressor-surge-margin": 22 - 12 * downstream + periodic * 0.2,
            "stripper-temperature-top": 98 + 12 * downstream + periodic * 0.2,
            "product-quality-proxy": 98.5 - 7.5 * downstream + periodic * 0.08,
            "product-moisture-proxy": 280 + 260 * downstream + periodic * 2,
            "unit-throughput": 100 - 8 * downstream + periodic * 0.2,
            "unit-energy-intensity": 2.2 + 0.75 * downstream + periodic * 0.01,
            "unit-on-spec-rate": 98.2 - 8.5 * downstream + periodic * 0.05,
            "unit-alarm-rate": 2 + 20 * downstream,
            "site-on-spec-rate": 97.6 - 2.5 * downstream + periodic * 0.04,
        }
        base = known.get(tag.tag_id, self._baseline(tag) + periodic * self._amplitude(tag))
        value = base + noise * self._amplitude(tag) * 0.08
        for extra_fault in (*self.manifest.faults, *self._extra_faults):
            if (
                extra_fault.kind == "sensor-bias"
                and extra_fault.inject_at_tick <= tick
                and extra_fault.parameters.get("tagId") == tag.tag_id
            ):
                value += float(extra_fault.parameters.get("bias", 0))
        return round(value, 6)

    def _quality_for_tag(self, tag_id: str) -> str:
        for fault in (*self.manifest.faults, *self._extra_faults):
            if fault.inject_at_tick > self.run.tick:
                continue
            target = fault.parameters.get("tagId")
            duration = int(fault.parameters.get("durationTicks", 30))
            if target != tag_id or self.run.tick >= fault.inject_at_tick + duration:
                continue
            if fault.kind == "missing-data":
                return "missing"
            if fault.kind == "ingest-delay":
                return "questionable"
        return "good"

    def _new_alarms(self) -> list[AlarmEvent]:
        offset = self.run.tick - 180
        if offset < 0 or offset >= len(ALARM_SPECS):
            return []
        code, tag_id, priority, message = ALARM_SPECS[offset]
        if code in self._alarm_codes:
            return []
        self._alarm_codes.add(code)
        tag = self._tags[tag_id]
        return [
            AlarmEvent(
                alarm_id=f"{self.run.run_id}:{code}:active",
                tenant_id=self.manifest.tenant_id,
                run_id=self.run.run_id,
                asset_id=tag.asset_id,
                tag_id=tag_id,
                occurred_at=self.run.simulation_time,
                priority=priority,  # type: ignore[arg-type]
                state="active",
                message=message,
                cause_event_id=f"{self.run.run_id}:cooling-valve-stiction",
            )
        ]

    def validate_invariants(
        self,
        observations: tuple[IndustrialObservation, ...],
    ) -> None:
        values = {
            observation.tag_id: observation.value
            for observation in observations
            if isinstance(observation.value, int | float)
        }
        valve_position = values.get("cooling-valve-position")
        if valve_position is not None and not 0 <= float(valve_position) <= 100:
            raise ScenarioInvariantError("cooling valve position escaped 0..100%")
        cooling_flow = values.get("cooling-water-flow")
        if cooling_flow is not None and float(cooling_flow) <= 0:
            raise ScenarioInvariantError("cooling-water flow must stay positive")
        reactor_temperature = values.get("reactor-temperature")
        if reactor_temperature is not None and not 80 <= float(reactor_temperature) <= 170:
            raise ScenarioInvariantError("reactor temperature escaped demo envelope")
        reactor_pressure = values.get("reactor-pressure")
        if reactor_pressure is not None and float(reactor_pressure) <= 0:
            raise ScenarioInvariantError("reactor pressure must stay positive")
        separator_level = values.get("separator-level")
        if separator_level is not None and not 0 <= float(separator_level) <= 100:
            raise ScenarioInvariantError("separator level escaped 0..100%")

    @staticmethod
    def _ramp(tick: int, start: int, duration: int) -> float:
        return max(0.0, min(1.0, (tick - start) / duration))

    def _stable_noise(self, tag_id: str, tick: int) -> float:
        digest = hashlib.sha256(f"{self.manifest.seed}:{tag_id}:{tick}".encode()).digest()
        return int.from_bytes(digest[:4], "big") / (2**32 - 1) - 0.5

    @staticmethod
    def _stable_phase(tag_id: str) -> int:
        return sum(tag_id.encode()) % 31

    @staticmethod
    def _baseline(tag: SignalTag) -> float:
        limits = tag.limits
        if limits and limits.lo is not None and limits.hi is not None:
            return (limits.lo + limits.hi) / 2
        if limits and limits.hi is not None:
            return limits.hi * 0.65
        if limits and limits.lo is not None:
            return limits.lo * 1.25
        return 50.0

    @staticmethod
    def _amplitude(tag: SignalTag) -> float:
        limits = tag.limits
        if limits and limits.lo is not None and limits.hi is not None:
            return max(0.1, (limits.hi - limits.lo) * 0.03)
        if limits and limits.hi is not None:
            return max(0.1, abs(limits.hi) * 0.02)
        return 0.5
