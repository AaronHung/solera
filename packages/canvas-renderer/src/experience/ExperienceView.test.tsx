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
