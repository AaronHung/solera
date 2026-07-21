from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path

from solera_api.skills.loop1.evaluation import run_golden_suite


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run the offline LOOP-1 golden replay and KPI scoreboard.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Optional JSON output path. Parent directory must already exist.",
    )
    return parser.parse_args()


async def main() -> int:
    args = parse_args()
    scoreboard = await run_golden_suite()
    rendered = json.dumps(scoreboard, indent=2, ensure_ascii=False)
    if args.output:
        args.output.write_text(f"{rendered}\n")
        print(args.output)
    else:
        print(rendered)
    return 0 if scoreboard["gatePassed"] else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
