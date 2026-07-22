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
    expect(
      screen.getByRole("button", {
        name: /Chemical Process｜化學製程 Agent/,
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: /Precision Manufacturing｜精密加工・金屬製程 Agent/,
      }),
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
    const { container } = render(
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
        name: "從新品導入到熱處理品質，跨越兩種製造決策",
      }),
    ).toBeTruthy();
    const fastenCard = screen
      .getByRole("heading", { name: "從客戶詢價圖面到首件良品" })
      .closest("article");
    expect(fastenCard?.classList.contains("accent-steel")).toBe(true);
    fireEvent.click(
      within(fastenCard as HTMLElement).getByRole("button", {
        name: /Open Workflow Story/,
      }),
    );
    expect(container.querySelector(".fasten-shell")).toBeTruthy();
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

  it("presents HEAT-1 as a copper six-stage batch-to-release workflow", async () => {
    const { container } = render(
      <AgentPlatformExperience
        apiBaseUrl="http://localhost:8000"
        bearerToken="dev:tenant-demo:test:viewer"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Precision Manufacturing/ }),
    );
    const heatCard = screen
      .getByRole("heading", { name: "從熱處理批次到可核准放行" })
      .closest("article");
    expect(heatCard?.classList.contains("accent-copper")).toBe(true);
    fireEvent.click(
      within(heatCard as HTMLElement).getByRole("button", {
        name: /Open Workflow Story/,
      }),
    );
    expect(container.querySelector(".heat-shell")).toBeTruthy();
    expect(screen.getAllByText("HT-BATCH-260722-17").length).toBeGreaterThan(1);

    fireEvent.click(screen.getByRole("button", { name: "Lock Batch Passport" }));
    fireEvent.click(screen.getByRole("button", { name: "Open Load & Recipe" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Validate Load & Recipe" }),
    );
    await waitFor(() => expect(screen.getByText("TC coverage checked")).toBeTruthy());

    fireEvent.click(
      screen.getByRole("button", { name: /Confirm Gate A & Replay Journey/ }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Replay Furnace Journey" }),
    );
    await waitFor(() => expect(screen.getByText("3 deviations linked")).toBeTruthy());

    fireEvent.click(
      screen.getByRole("button", { name: "Run Quality Soft Sensor" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Estimate Quality Distribution" }),
    );
    await waitFor(() =>
      expect(screen.getByText("T6 edge tray requires HOLD candidate")).toBeTruthy(),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Investigate T6 Deviation" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Build Evidence Investigation" }),
    );
    await waitFor(() =>
      expect(
        screen.getByText("Zone 3 edge load + quench agitation interaction"),
      ).toBeTruthy(),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Approve Sampling Plan" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Reconcile Official Lab" }),
    );
    await waitFor(() => expect(screen.getByText("4 / 4 received")).toBeTruthy());
    expect(screen.getByText("PARTIAL HOLD")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Complete HEAT-1 Story" }),
    );
    expect(screen.getByText("HEAT-1 STORY COMPLETE")).toBeTruthy();
  }, 12_000);
});
