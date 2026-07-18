from __future__ import annotations

import math
from collections import defaultdict, deque
from dataclasses import dataclass


@dataclass(frozen=True)
class Usage:
    input_tokens: int = 0
    output_tokens: int = 0
    estimated_cost_usd: float = 0


def _percentile(values: list[float], percentile: float) -> float:
    if not values:
        return 0
    ordered = sorted(values)
    index = max(0, min(math.ceil(percentile * len(ordered)) - 1, len(ordered) - 1))
    return ordered[index]


class MetricsRegistry:
    def __init__(self, max_samples: int = 2000) -> None:
        self._latencies: dict[str, deque[float]] = defaultdict(lambda: deque(maxlen=max_samples))
        self._usage = Usage()

    def record_latency(self, component: str, milliseconds: float) -> None:
        self._latencies[component].append(max(milliseconds, 0))

    def record_model_usage(
        self,
        *,
        input_tokens: int,
        output_tokens: int,
        estimated_cost_usd: float,
    ) -> None:
        self._usage = Usage(
            input_tokens=self._usage.input_tokens + max(input_tokens, 0),
            output_tokens=self._usage.output_tokens + max(output_tokens, 0),
            estimated_cost_usd=self._usage.estimated_cost_usd + max(estimated_cost_usd, 0),
        )

    def snapshot(self) -> dict[str, object]:
        return {
            "latency": {
                component: {
                    "count": len(samples),
                    "p50Ms": round(_percentile(list(samples), 0.5), 2),
                    "p95Ms": round(_percentile(list(samples), 0.95), 2),
                    "maxMs": round(max(samples, default=0), 2),
                }
                for component, samples in sorted(self._latencies.items())
            },
            "modelUsage": {
                "inputTokens": self._usage.input_tokens,
                "outputTokens": self._usage.output_tokens,
                "estimatedCostUsd": round(self._usage.estimated_cost_usd, 6),
            },
        }
