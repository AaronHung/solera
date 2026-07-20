import { useEffect, useMemo, useState } from "react";

import { EXPERIENCE_DATASET } from "./mockData";
import type {
  ExperienceDataset,
  ExperienceLiveMetric,
  ExperienceTone,
} from "./types";

const FAST_TICK_MS = 1_000;
const TREND_CADENCE_SECONDS = 5;
const SLOW_CADENCE_SECONDS = 15;

function bounded(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function perturb(base: number, tick: number, phase: number, scale: number): number {
  const current =
    Math.sin((tick + phase) * 0.71) +
    Math.cos((tick + phase) * 0.31) * 0.35;
  const baseline =
    Math.sin(phase * 0.71) + Math.cos(phase * 0.31) * 0.35;
  return base + (current - baseline) * scale;
}

function toneFor(
  value: number,
  warning: (value: number) => boolean,
  critical: (value: number) => boolean,
): ExperienceTone {
  if (critical(value)) {
    return "critical";
  }
  return warning(value) ? "warning" : "healthy";
}

function liveMetricValue(
  id: ExperienceLiveMetric["id"],
  fastTick: number,
): number {
  const trendTick = Math.floor(fastTick / TREND_CADENCE_SECONDS);
  switch (id) {
    case "grid-frequency":
      return 50.04 + Math.sin(fastTick * 0.82) * 0.28;
    case "net-output":
      return (
        842.6 +
        Math.sin(fastTick * 0.58) * 8.4 +
        (Math.cos(fastTick * 0.21) - 1) * 2.6
      );
    case "inverter-temperature":
      return (
        78.2 +
        Math.sin(fastTick * 0.55) * 8.7 +
        (Math.cos(fastTick * 0.17) - 1) * 1.4
      );
    case "hydrogen-pressure":
      return (
        33.4 +
        Math.sin(fastTick * 0.37) * 4.8 +
        (Math.cos(fastTick * 0.13) - 1) * 0.7
      );
    case "forecast-deviation":
      return 2.2 + Math.sin(trendTick * 0.9) * 7.4;
  }
}

function liveMetricTone(
  id: ExperienceLiveMetric["id"],
  value: number,
): { tone: ExperienceTone; status: string } {
  switch (id) {
    case "grid-frequency": {
      const deviation = Math.abs(value - 50);
      const tone = toneFor(value, () => deviation > 0.16, () => deviation > 0.26);
      return {
        tone,
        status:
          tone === "critical" ? "Frequency excursion" : tone === "warning" ? "Watch band" : "Stable",
      };
    }
    case "inverter-temperature": {
      const tone = toneFor(value, (current) => current > 80, (current) => current > 86);
      return {
        tone,
        status:
          tone === "critical" ? "High temperature" : tone === "warning" ? "Thermal watch" : "Normal",
      };
    }
    case "hydrogen-pressure": {
      const tone = toneFor(value, (current) => current > 35, (current) => current > 38);
      return {
        tone,
        status:
          tone === "critical" ? "Pressure high" : tone === "warning" ? "Approaching limit" : "Normal",
      };
    }
    case "forecast-deviation": {
      const deviation = Math.abs(value);
      const tone = toneFor(value, () => deviation > 4, () => deviation > 7);
      return {
        tone,
        status:
          tone === "critical" ? "Outside forecast" : tone === "warning" ? "Deviation watch" : "Inside plan",
      };
    }
    case "net-output": {
      const deviation = Math.abs(value - 842.6);
      const tone = toneFor(value, () => deviation > 8, () => deviation > 11);
      return {
        tone,
        status:
          tone === "critical" ? "Output excursion" : tone === "warning" ? "Ramping" : "Tracking plan",
      };
    }
  }
}

function liveMetrics(fastTick: number): ExperienceLiveMetric[] {
  return EXPERIENCE_DATASET.liveMetrics.map((metric) => {
    const metricTick =
      metric.cadence === "5s"
        ? Math.floor(fastTick / TREND_CADENCE_SECONDS) * TREND_CADENCE_SECONDS
        : metric.cadence === "15s"
          ? Math.floor(fastTick / SLOW_CADENCE_SECONDS) * SLOW_CADENCE_SECONDS
          : fastTick;
    const value = liveMetricValue(metric.id, metricTick);
    const { tone, status } = liveMetricTone(metric.id, value);
    const history = Array.from({ length: 16 }, (_, index) => {
      const historicalTick = Math.max(0, metricTick - 15 + index);
      return Number(liveMetricValue(metric.id, historicalTick).toFixed(2));
    });
    return {
      ...metric,
      value: Number(value.toFixed(metric.id === "grid-frequency" ? 2 : 1)),
      tone,
      status,
      history,
    };
  });
}

function snapshot(fastTick: number): ExperienceDataset {
  const trendTick = Math.floor(fastTick / TREND_CADENCE_SECONDS);
  const slowTick = Math.floor(fastTick / SLOW_CADENCE_SECONDS);
  const portfolioDelta = perturb(0, fastTick, 1, 4.2);
  return {
    ...EXPERIENCE_DATASET,
    generatedAt: new Date(
      Date.parse(EXPERIENCE_DATASET.generatedAt) + fastTick * FAST_TICK_MS,
    ).toISOString(),
    portfolio: {
      ...EXPERIENCE_DATASET.portfolio,
      productionMw: Number(
        (EXPERIENCE_DATASET.portfolio.productionMw + portfolioDelta).toFixed(1),
      ),
      availability: Number(
        bounded(
          perturb(
            EXPERIENCE_DATASET.portfolio.availability,
            slowTick,
            2,
            0.08,
          ),
          92,
          99.9,
        ).toFixed(1),
      ),
      avoidedCo2Tons: Math.round(
        EXPERIENCE_DATASET.portfolio.avoidedCo2Tons + trendTick * 6 + portfolioDelta,
      ),
      revenueMillions: Number(
        (EXPERIENCE_DATASET.portfolio.revenueMillions + slowTick * 0.004).toFixed(2),
      ),
    },
    sites: EXPERIENCE_DATASET.sites.map((site, siteIndex) => ({
      ...site,
      productionMwh: Number(
        perturb(site.productionMwh, fastTick, siteIndex + 1, site.productionMwh * 0.0012).toFixed(
          1,
        ),
      ),
      availability: Number(
        bounded(perturb(site.availability, slowTick, siteIndex + 3, 0.11), 82, 99.9).toFixed(
          1,
        ),
      ),
      assets: site.assets.map((asset, assetIndex) => {
        const outputMw = Number(
          bounded(
            perturb(asset.outputMw, fastTick, assetIndex + 2, asset.capacityMw * 0.012),
            0,
            asset.capacityMw,
          ).toFixed(1),
        );
        return {
          ...asset,
          outputMw,
          availability: Number(
            bounded(
              perturb(asset.availability, slowTick, assetIndex + 7, 0.16),
              75,
              99.9,
            ).toFixed(1),
          ),
          trend: asset.trend.map((value, index) =>
            index === asset.trend.length - 1
              ? outputMw
              : Number(
                  perturb(
                    value,
                    trendTick,
                    assetIndex + index * 0.12,
                    asset.capacityMw * 0.004,
                  ).toFixed(1),
                ),
          ),
        };
      }),
    })),
    liveMetrics: liveMetrics(fastTick),
    productionTrend: EXPERIENCE_DATASET.productionTrend.map((point, index) => ({
      ...point,
      value: Number(perturb(point.value, trendTick, index * 0.2, 5.2).toFixed(1)),
    })),
    forecastTrend: EXPERIENCE_DATASET.forecastTrend.map((point, index) => ({
      ...point,
      value: Number(perturb(point.value, trendTick, index * 0.15 + 4, 2.2).toFixed(1)),
    })),
    hourlyProduction: EXPERIENCE_DATASET.hourlyProduction.map((point, index) => ({
      ...point,
      value: Number(
        Math.max(0, perturb(point.value, slowTick, index * 0.22 + 1, 0.7)).toFixed(1),
      ),
    })),
  };
}

export function useExperienceSimulation() {
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) {
      return;
    }
    const timer = window.setInterval(() => {
      setTick((current) => current + 1);
    }, FAST_TICK_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  const data = useMemo(() => snapshot(tick), [tick]);
  const trendRevision = Math.floor(tick / TREND_CADENCE_SECONDS);
  const previousTrend = useMemo(
    () =>
      snapshot(Math.max(0, tick - TREND_CADENCE_SECONDS)).productionTrend,
    [trendRevision],
  );
  return {
    data,
    previousTrend,
    tick,
    trendRevision,
    paused,
    setPaused,
    reset: () => setTick(0),
  };
}
