// SPDX-License-Identifier: Apache-2.0
// EDGE-012 — Typology: '+' operator appears when scores are dragged to canvas

// silence noisy logs just for this file
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});
afterAll(() => {
  (console.warn as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
  (console.log as jest.Mock).mockRestore();
});


// 1) Define matchMedia BEFORE anything that imports AntD / ScorePage.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((q) => ({
    matches: false,
    media: q,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// 2) Keep other mocks as you already had:
jest.mock("~/hooks", () => ({
  useCommonTranslations: () => ({ t: (key: string) => key }),
}));
jest.mock("~/hooks/usePrivileges", () => () => ({ privileges: [], canReviewTypology: true }));
jest.mock("next/navigation", () => ({ useParams: () => ({ id: "typology-123" }) }));
jest.mock("next/router", () => ({ useRouter: () => ({ push: jest.fn() }) }));

jest.mock("../Score/service", () => ({
  getTypologyWithRules: jest.fn().mockResolvedValue({ _key: "typology-123", rules_rule_configs: [] }),
  getRuleById: jest.fn(),
  getRuleConfigById: jest.fn(),
  updateTypology: jest.fn().mockResolvedValue({ ok: true }),
}));

// 3) Silence/normalize outcome label mapping for this test only:
jest.mock("../Score/helpers", () => {
  const actual = jest.requireActual("../Score/helpers");
  return {
    ...actual,
    getOutcomeLabelFromType: () => "Exit Condition", // avoid Unknown-type warnings
  };
});

// 4) Mock Flow to expose a drop target and render node labels:
jest.mock("../Create/Flow", () => ({
  Flow: ({ children, onDrop, nodes }: any) => (
    <div>
      <div
        data-testid="drop-target"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ width: 400, height: 300, border: "1px dashed #999" }}
      />
      <ul data-testid="node-labels">
        {(nodes || []).map((n: any) => (
          <li key={n.id}>{n?.data?.label}</li>
        ))}
      </ul>
      {children}
    </div>
  ),
}));

// 5) Use require AFTER the polyfill so AntD sees matchMedia:
const ScorePage = require("../Score/index").default;

// Helper to simulate DataTransfer
const makeDataTransfer = (payload: Record<string, string>) => {
  const store: Record<string, string> = { ...payload };
  return {
    setData: (k: string, v: string) => (store[k] = v),
    getData: (k: string) => store[k] ?? "",
    effectAllowed: "move",
  };
};

describe("EDGE-012: '+' operator appears when scores are dragged to canvas", () => {
  it("renders a '+' operator node after dropping two outcomes (score nodes)", async () => {
    render(<ScorePage />);

    // Optional: if your onDrop requires a 'selected rule', inject one:
    const fakeSelectedRule = document.createElement("div");
    fakeSelectedRule.setAttribute("data-testid", "rule-item-0");
    fakeSelectedRule.setAttribute("style", "border: 2px solid #4CAE47;");
    document.body.appendChild(fakeSelectedRule);

    const dropTarget = await screen.findByTestId("drop-target");

    // First outcome drop
    fireEvent.drop(dropTarget, {
      dataTransfer: makeDataTransfer({
        type: "outcome",
        data: JSON.stringify({
          ruleId: "rule-1",
          type: "EXIT_CONDITION",
          subRuleRef: "X01",
          reason: "First",
        }),
      }),
    });

    // Second outcome drop — should create the '+' operator between score nodes
    fireEvent.drop(dropTarget, {
      dataTransfer: makeDataTransfer({
        type: "outcome",
        data: JSON.stringify({
          ruleId: "rule-1",
          type: "EXIT_CONDITION",
          subRuleRef: "X02",
          reason: "Second",
        }),
      }),
    });

    await waitFor(() => {
      const list = screen.getByTestId("node-labels");
      expect(list.textContent).toContain("+");
    });
  });
});
