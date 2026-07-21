from loop1_simulator import Loop1ScenarioEngine
from solera_api.industrial_contracts import FaultDefinition


def _value(engine: Loop1ScenarioEngine, tag_id: str) -> float:
    value = engine.current(tag_id).value
    assert isinstance(value, float)
    return value


def test_same_seed_replays_byte_for_byte() -> None:
    first = Loop1ScenarioEngine()
    second = Loop1ScenarioEngine()

    first.replay(220)
    second.replay(220)

    assert first.export_replay() == second.export_replay()


def test_valve_mismatch_precedes_process_and_alarm_flood() -> None:
    engine = Loop1ScenarioEngine()
    engine.replay(160)

    mismatch = _value(engine, "cooling-valve-command") - _value(engine, "cooling-valve-position")
    assert mismatch > 5
    assert _value(engine, "reactor-temperature") < 128

    engine.step(37)

    assert len(engine.alarms) == 18
    assert engine.alarms[0].tag_id == "cooling-valve-position"
    assert engine.alarms[0].occurred_at < engine.alarms[3].occurred_at
    assert engine.truth["rootAssetId"] == "component-cooling-valve"


def test_fault_recovery_stays_inside_process_invariants() -> None:
    engine = Loop1ScenarioEngine()
    engine.replay(440)

    assert engine.run.state == "recovery"
    assert abs(_value(engine, "cooling-valve-command") - 52) < 1
    assert abs(_value(engine, "cooling-valve-position") - 52) < 1
    assert 118 < _value(engine, "reactor-temperature") < 122


def test_missing_data_fault_is_explicit_and_replayable() -> None:
    engine = Loop1ScenarioEngine()
    engine.inject_fault(
        FaultDefinition(
            fault_id="reactor-temp-dropout",
            kind="missing-data",
            inject_at_tick=10,
            asset_id="equipment-reactor",
            parameters={"tagId": "reactor-temperature", "durationTicks": 5},
        )
    )

    engine.step(10)

    observation = engine.current("reactor-temperature")
    assert observation.quality == "missing"
    assert observation.value is None
