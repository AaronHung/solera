import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ExperienceView } from "./ExperienceView";

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ExperienceView", () => {
  it("changes the dashboard priority when the role changes", () => {
    render(<ExperienceView />);
    expect(screen.getByRole("heading", { name: "Energy operations, distilled" })).toBeTruthy();

    fireEvent.change(screen.getByLabelText("View as"), {
      target: { value: "reliability" },
    });
    expect(
      screen.getByRole("heading", {
        name: "Maintenance readiness",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Predictive work queue")).toBeTruthy();
  });

  it("navigates from Sites to Site Operations and Asset Detail", () => {
    render(<ExperienceView />);
    fireEvent.click(screen.getByRole("button", { name: /Sites$/ }));
    expect(
      screen.getByRole("heading", { name: "Operations across the portfolio" }),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Open Clark Mountain Solar Plant",
      }),
    );
    expect(
      screen.getByRole("heading", { name: "Clark Mountain Solar Plant" }),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Open Solar Block 1" }),
    );
    expect(screen.getByRole("heading", { name: "Solar Block 1" })).toBeTruthy();
    expect(screen.getByText("Service readiness")).toBeTruthy();
  });

  it("updates fast telemetry every second and exposes warning states", () => {
    vi.useFakeTimers();
    const { container } = render(<ExperienceView />);
    const production = () =>
      container.querySelector(".exp-kpi-value strong")?.textContent;
    expect(production()).toBe("842.6");
    expect(screen.getByText("LIVE TELEMETRY")).toBeTruthy();
    const frequencyCard = screen.getByText("Grid frequency").closest("article")!;
    const frequency = () =>
      frequencyCard.querySelector("strong")?.textContent;
    expect(frequency()).toContain("50.04");

    act(() => vi.advanceTimersByTime(1_000));
    const afterTick = production();
    expect(afterTick).not.toBe("842.6");
    expect(frequency()).not.toContain("50.04");

    act(() => vi.advanceTimersByTime(1_000));
    expect(frequencyCard.classList.contains("exp-tone-critical")).toBe(true);
    expect(screen.getByText("Frequency excursion")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    const pausedProduction = production();
    const pausedFrequency = frequency();
    act(() => vi.advanceTimersByTime(5_000));
    expect(production()).toBe(pausedProduction);
    expect(frequency()).toBe(pausedFrequency);

    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    act(() => vi.advanceTimersByTime(1_000));
    expect(production()).not.toBe(afterTick);
  });

  it("keeps the prior five-second trend snapshot as a dashed comparison", () => {
    vi.useFakeTimers();
    const { container } = render(<ExperienceView />);
    fireEvent.click(screen.getByRole("button", { name: /Sites$/ }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Open Clark Mountain Solar Plant",
      }),
    );

    const currentLine = () =>
      container.querySelector(".primary-line")?.getAttribute("points");
    const previousLine = () =>
      container.querySelector(".previous-line")?.getAttribute("points");
    const initial = currentLine();
    expect(previousLine()).toBe(initial);

    act(() => vi.advanceTimersByTime(5_000));
    expect(previousLine()).toBe(initial);
    expect(currentLine()).not.toBe(initial);
    expect(screen.getByText("Previous snapshot")).toBeTruthy();
  });

  it("updates Map and Site fleet values on the slow operational cadence", () => {
    vi.useFakeTimers();
    const { container } = render(<ExperienceView />);
    fireEvent.click(screen.getByRole("button", { name: "Map", exact: true }));

    const mapProduction = () =>
      container.querySelector(".map-site-1 strong")?.textContent;
    const initialMapProduction = mapProduction();
    act(() => vi.advanceTimersByTime(15_000));
    expect(mapProduction()).not.toBe(initialMapProduction);

    fireEvent.click(screen.getByRole("button", { name: "Sites", exact: true }));
    const siteProduction = () =>
      screen
        .getByRole("button", { name: "Open Clark Mountain Solar Plant" })
        .querySelectorAll("dl dd")[1]?.textContent;
    const initialSiteProduction = siteProduction();
    act(() => vi.advanceTimersByTime(15_000));
    expect(siteProduction()).not.toBe(initialSiteProduction);
  });

  it("gives Revenue, Collaboration, HSE, and Activities distinct live workspaces", () => {
    const { container } = render(<ExperienceView />);
    expect(container.querySelectorAll(".exp-bottom-nav svg")).toHaveLength(9);
    expect(container.querySelectorAll(".exp-rail svg")).toHaveLength(5);

    fireEvent.click(screen.getByRole("button", { name: "Revenue", exact: true }));
    expect(
      screen.getByRole("heading", { name: "Turn operating signal into value" }),
    ).toBeTruthy();
    expect(screen.getByText("Where value comes from")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Collaboration", exact: true }),
    );
    expect(screen.getByRole("heading", { name: "Keep the shift in sync" })).toBeTruthy();
    expect(screen.getByText("Operational handover")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "HSE", exact: true }));
    expect(screen.getByRole("heading", { name: "Make safe work visible" })).toBeTruthy();
    expect(screen.getByText("Control effectiveness")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Activities", exact: true }),
    );
    expect(
      screen.getByRole("heading", { name: "See the system behind the signal" }),
    ).toBeTruthy();
    expect(screen.getByText("Freshness by source")).toBeTruthy();
  });

  it("keeps frequency profiles stable across ticks and varies radar coverage", () => {
    vi.useFakeTimers();
    const { container } = render(<ExperienceView />);
    const barHeights = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          ".exp-spectrum-bars > i",
        ),
        (bar) => bar.style.height,
      );

    fireEvent.click(
      screen.getByRole("button", { name: "Collaboration", exact: true }),
    );
    const collaborationProfile = barHeights();
    act(() => vi.advanceTimersByTime(5_000));
    expect(barHeights()).toEqual(collaborationProfile);

    fireEvent.click(
      screen.getByRole("button", { name: "Activities", exact: true }),
    );
    const ingestionProfile = barHeights();
    act(() => vi.advanceTimersByTime(5_000));
    expect(barHeights()).toEqual(ingestionProfile);

    fireEvent.click(screen.getByRole("button", { name: "HSE", exact: true }));
    const radarValues = Array.from(
      container.querySelectorAll(".exp-radar-labels b"),
      (label) => Number(label.textContent),
    );
    expect(Math.max(...radarValues) - Math.min(...radarValues)).toBeGreaterThan(
      20,
    );
  });

  it("adds trusted components and returns mock Preview and Save feedback", () => {
    render(<ExperienceView />);
    fireEvent.click(screen.getByRole("button", { name: "Create workspace" }));
    expect(
      screen.getByRole("heading", {
        name: "Compose a role-specific workspace",
      }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Add Gauge" }));
    expect(screen.getByText("Gauge added to the demo canvas")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(
      screen.getByText("Preview ready — this is a simulated workflow"),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Save demo" }));
    expect(
      screen.getByText("Demo workspace saved locally for this session"),
    ).toBeTruthy();
  });
});
