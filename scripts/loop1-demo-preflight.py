#!/usr/bin/env python3
"""Preflight and deterministically prepare the Solera LOOP-1 demo."""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlparse

import httpx

DEFAULT_LOCAL_IDENTITY = "dev:tenant-demo:demo-user:viewer"


@dataclass
class Check:
    name: str
    passed: bool
    detail: str


class DemoApi:
    def __init__(self, base_url: str, token: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.token = token
        if urlparse(self.base_url).scheme not in {"http", "https"}:
            raise RuntimeError("Demo API URL must use http or https")

    def request(
        self,
        method: str,
        path: str,
        payload: dict[str, object] | None = None,
        *,
        authenticated: bool = True,
    ) -> Any:
        headers = {"Accept": "application/json"}
        if authenticated:
            headers["Authorization"] = f"Bearer {self.token}"
        try:
            response = httpx.request(
                method,
                f"{self.base_url}{path}",
                headers=headers,
                json=payload,
                timeout=60,
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as error:
            raise RuntimeError(
                f"{method} {path} failed ({error.response.status_code}): {error.response.text}"
            ) from error
        except httpx.RequestError as error:
            raise RuntimeError(
                f"Cannot reach {self.base_url}; start the API with npm run dev:api"
            ) from error

    def get(self, path: str, *, authenticated: bool = True) -> Any:
        return self.request("GET", path, authenticated=authenticated)

    def post(self, path: str, payload: dict[str, object] | None = None) -> Any:
        return self.request("POST", path, payload)


def check(name: str, condition: bool, detail: str) -> Check:
    return Check(name=name, passed=condition, detail=detail)


def prepare(
    api: DemoApi,
    mode: str | None,
) -> tuple[dict[str, Any], dict[str, Any] | None]:
    investigation = None
    if mode == "normal":
        api.post("/v1/loop1/control", {"action": "replay", "toTick": 60})
        investigation = api.post("/v1/loop1/investigate")
    elif mode == "hero":
        api.post("/v1/loop1/control", {"action": "replay", "toTick": 220})
        investigation = api.post("/v1/loop1/investigate")
    elif mode == "reset":
        api.post("/v1/loop1/control", {"action": "reset"})
    return api.get("/v1/loop1/snapshot"), investigation


def run_checks(
    api: DemoApi,
    mode: str | None,
) -> tuple[list[Check], dict[str, object]]:
    health = api.get("/health", authenticated=False)
    ready = api.get("/ready", authenticated=False)
    catalog = api.get("/v1/loop1/catalog")
    skills = api.get("/v1/loop1/skills")
    gates = api.get("/v1/loop1/productization-gates")
    snapshot, investigation = prepare(api, mode)

    manifest = catalog.get("manifest", {})
    run = snapshot.get("run", {})
    pulse = snapshot.get("pulse", {})
    quality = pulse.get("quality", {})
    gate_items = gates.get("gates", [])

    checks = [
        check("API health", health.get("status") == "ok", str(health)),
        check("API readiness", ready.get("status") == "ready", str(ready)),
        check(
            "Synthetic disclosure",
            catalog.get("synthetic") is True,
            str(catalog.get("truthDisclosure")),
        ),
        check(
            "Asset catalog",
            len(manifest.get("assets", [])) == 10,
            f"{len(manifest.get('assets', []))} assets",
        ),
        check(
            "Tag catalog",
            len(manifest.get("tags", [])) == 60,
            f"{len(manifest.get('tags', []))} tags",
        ),
        check("Bounded Skills", len(skills) == 6, f"{len(skills)} skills"),
        check(
            "Productization gates",
            gates.get("coreDemoReady") is True and len(gate_items) == 4,
            f"{len(gate_items)} gates; coreDemoReady={gates.get('coreDemoReady')}",
        ),
        check(
            "Pulse health",
            pulse.get("status") == ("degraded" if mode == "reset" else "healthy"),
            (f"status={pulse.get('status')}; lag={pulse.get('lagSeconds')}; quality={quality}"),
        ),
        check(
            "Synthetic clock",
            pulse.get("details", {}).get("clockMode") == "synthetic-replay",
            str(pulse.get("details")),
        ),
    ]

    if mode == "normal" and investigation is not None:
        checks.extend(
            [
                check("Normal replay tick", run.get("tick") == 60, str(run)),
                check(
                    "Normal investigation",
                    investigation.get("status") == "no-abnormality",
                    (
                        f"status={investigation.get('status')}; "
                        f"hypotheses={len(investigation.get('hypotheses', []))}"
                    ),
                ),
                check(
                    "No normal-state draft",
                    investigation.get("actionDraft") is None,
                    f"actionDraft={investigation.get('actionDraft') is not None}",
                ),
            ]
        )
    elif mode == "hero" and investigation is not None:
        hypotheses = investigation.get("hypotheses", [])
        documents = investigation.get("documents", [])
        top_hypothesis = hypotheses[0] if hypotheses else {}
        checks.extend(
            [
                check("Hero replay tick", run.get("tick") == 220, str(run)),
                check(
                    "Hero alarm count",
                    len(snapshot.get("alarms", [])) == 18,
                    f"{len(snapshot.get('alarms', []))} raw alarms",
                ),
                check(
                    "Hero investigation",
                    investigation.get("status") == "complete",
                    f"status={investigation.get('status')}",
                ),
                check(
                    "Top-1 truth",
                    top_hypothesis.get("hypothesisId") == "hypothesis-valve-stiction",
                    str(top_hypothesis.get("title")),
                ),
                check(
                    "SOP revision retrieval",
                    any(item.get("documentId") == "sop-r101-cooling-rev4" for item in documents),
                    f"{len(documents)} retrieved documents",
                ),
                check(
                    "Evidence ledger",
                    len(investigation.get("evidence", [])) > 0,
                    f"{len(investigation.get('evidence', []))} evidence records",
                ),
                check(
                    "Draft-only Action",
                    investigation.get("actionDraft") is not None,
                    f"actionDraft={investigation.get('actionDraft') is not None}",
                ),
            ]
        )
    elif mode == "reset":
        checks.extend(
            [
                check("Reset tick", run.get("tick") == 0, str(run)),
                check(
                    "Reset observations",
                    len(snapshot.get("observations", [])) == 0,
                    f"{len(snapshot.get('observations', []))} observations",
                ),
                check(
                    "Reset alarms",
                    len(snapshot.get("alarms", [])) == 0,
                    f"{len(snapshot.get('alarms', []))} alarms",
                ),
            ]
        )

    summary: dict[str, object] = {
        "mode": mode or "inspect",
        "runId": run.get("runId"),
        "tick": run.get("tick"),
        "state": run.get("state"),
        "assets": len(manifest.get("assets", [])),
        "tags": len(manifest.get("tags", [])),
        "alarms": len(snapshot.get("alarms", [])),
        "pulse": pulse.get("status"),
        "skills": len(skills),
        "gates": {item.get("gateId"): item.get("status") for item in gate_items},
    }
    if investigation is not None:
        hypotheses = investigation.get("hypotheses", [])
        summary["investigation"] = {
            "status": investigation.get("status"),
            "topHypothesis": hypotheses[0].get("title") if hypotheses else None,
            "evidence": len(investigation.get("evidence", [])),
            "documents": len(investigation.get("documents", [])),
            "similarCases": len(investigation.get("similarCases", [])),
            "actionDraft": investigation.get("actionDraft") is not None,
        }
    return checks, summary


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Verify and prepare the Solera LOOP-1 customer demo."
    )
    parser.add_argument(
        "--base-url",
        default=os.getenv("SOLERA_DEMO_API_URL", "http://localhost:8000"),
    )
    parser.add_argument(
        "--token",
        default=os.getenv("SOLERA_DEMO_TOKEN", DEFAULT_LOCAL_IDENTITY),
    )
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--normal", action="store_true", help="Replay to normal tick 60")
    mode.add_argument("--hero", action="store_true", help="Replay Hero to tick 220")
    mode.add_argument("--reset", action="store_true", help="Reset the current run")
    parser.add_argument("--json", action="store_true", help="Print JSON only")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    mode = "normal" if args.normal else "hero" if args.hero else "reset" if args.reset else None
    try:
        checks, summary = run_checks(DemoApi(args.base_url, args.token), mode)
    except RuntimeError as error:
        if args.json:
            print(json.dumps({"status": "fail", "error": str(error)}, indent=2))
        else:
            print(f"LOOP-1 demo preflight FAIL\n{error}", file=sys.stderr)
        return 1

    failed = [item for item in checks if not item.passed]
    if args.json:
        print(
            json.dumps(
                {
                    "status": "pass" if not failed else "fail",
                    "summary": summary,
                    "checks": [item.__dict__ for item in checks],
                },
                indent=2,
            )
        )
    else:
        for item in checks:
            marker = "PASS" if item.passed else "FAIL"
            print(f"[{marker}] {item.name}: {item.detail}")
        print()
        print(json.dumps(summary, indent=2))
        print(f"\nLOOP-1 demo preflight {'PASS' if not failed else 'FAIL'}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
