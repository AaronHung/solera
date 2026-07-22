import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { AgentPlatformExperience } from "./AgentPlatformExperience";

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => cleanup());

describe("AgentPlatformExperience", () => {
  it("shows one live Agent and three clearly labeled concept Agents", () => {
    render(
      <AgentPlatformExperience
        apiBaseUrl="http://localhost:8000"
        bearerToken="dev:tenant-demo:test:viewer"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "一個可信平台，長出多種工業 Agent" }),
    ).toBeTruthy();
    expect(screen.getByText("反應器冷卻偏差調查")).toBeTruthy();
    expect(screen.getByText("FCC 再生器後燃風險 Agent")).toBeTruthy();
    expect(screen.getByText("觸媒活性與 Run-length Agent")).toBeTruthy();
    expect(screen.getByText("水質 Soft Sensor 與合規風險 Agent")).toBeTruthy();
    expect(screen.getAllByText("CONCEPT")).toHaveLength(3);
    expect(screen.getByText("LIVE")).toBeTruthy();
  });

  it("runs the LOOP-2 concept through trace, result, Evidence, and draft", async () => {
    render(
      <AgentPlatformExperience
        apiBaseUrl="http://localhost:8000"
        bearerToken="dev:tenant-demo:test:viewer"
      />,
    );

    const loop2Heading = screen.getByRole("heading", {
      name: "FCC 再生器後燃風險 Agent",
    });
    const loop2Card = loop2Heading.closest("article");
    expect(loop2Card).toBeTruthy();
    fireEvent.click(
      within(loop2Card as HTMLElement).getByRole("button", {
        name: /Explore Concept/,
      }),
    );

    expect(
      screen.getByText("SYNTHETIC CONCEPT · NOT FOR OPERATIONS"),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Run Afterburn Analysis" }),
    );

    await waitFor(
      () => expect(screen.getByText("後燃風險正在形成")).toBeTruthy(),
      { timeout: 4_000 },
    );
    expect(screen.getAllByText("82%")).toHaveLength(2);
    expect(screen.getByText("RG-TI-DILUTE-04")).toBeTruthy();
    expect(screen.getByText("Review regenerator air distribution")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Back to Gallery" }));
    expect(
      screen.getByRole("heading", { name: "一個可信平台，長出多種工業 Agent" }),
    ).toBeTruthy();
  });

  it.each([
    {
      code: "LOOP-3",
      run: "Estimate Catalyst Activity",
      verdict: "觸媒活性下降快於 feed-normalized baseline",
      evidence: "HDT-WABT / RX-ΔP",
    },
    {
      code: "LOOP-4",
      run: "Run Water Quality Estimate",
      verdict: "Effluent excursion risk 高於 synthetic site envelope",
      evidence: "WW-UV254 / ORP / DO",
    },
  ])("runs the $code concept to a distinct result", async ({ code, run, verdict, evidence }) => {
    render(
      <AgentPlatformExperience
        apiBaseUrl="http://localhost:8000"
        bearerToken="dev:tenant-demo:test:viewer"
      />,
    );

    const agentCard = screen.getByText(code).closest("article");
    expect(agentCard).toBeTruthy();
    fireEvent.click(
      within(agentCard as HTMLElement).getByRole("button", {
        name: /Explore Concept/,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: run }));

    await waitFor(() => expect(screen.getByText(verdict)).toBeTruthy(), {
      timeout: 4_000,
    });
    expect(screen.getByText(evidence)).toBeTruthy();
  });

  it("presents FASTEN-1 as a multi-screen RFQ-to-first-good-part workflow", async () => {
    render(
      <AgentPlatformExperience
        apiBaseUrl="http://localhost:8000"
        bearerToken="dev:tenant-demo:test:viewer"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Precision Manufacturing/ }),
    );
    expect(
      screen.getByRole("heading", {
        name: "從一張客戶圖面，到第一顆合格螺絲",
      }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: /Open Workflow Story/ }),
    );
    expect(screen.getAllByText("RFQ-2026-00182")).toHaveLength(2);

    fireEvent.click(
      screen.getByRole("button", { name: "Accept RFQ & Start Workflow" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Open Drawing Intelligence/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Analyze Drawing" }));
    await waitFor(() => expect(screen.getByText("7 verified · 1 missing")).toBeTruthy());
    expect(screen.getByText("Not specified")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: /Confirm Gate A/ }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Search Similar Products" }),
    );
    await waitFor(() => expect(screen.getByText("P-008821 / Rev B")).toBeTruthy());

    fireEvent.click(screen.getByRole("button", { name: "Use Case P-008821" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Build Manufacturing Plan" }),
    );
    await waitFor(() => expect(screen.getByText("New DIE-2047 required")).toBeTruthy());

    fireEvent.click(
      screen.getByRole("button", { name: /Confirm Gate B/ }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Run Synthetic Trial" }),
    );
    await waitFor(() =>
      expect(screen.getByText("Second-station die radius / alignment")).toBeTruthy(),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Approve Inspection Order" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Generate First Article Package" }),
    );
    await waitFor(() => expect(screen.getByText("CONDITIONAL PASS")).toBeTruthy());

    fireEvent.click(
      screen.getByRole("button", { name: "Complete FASTEN-1 Story" }),
    );
    expect(screen.getByText("FASTEN-1 STORY COMPLETE")).toBeTruthy();
  }, 12_000);
});
