import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ImportRuleConfig from "../import";
import * as usePrivileges from "~/hooks/usePrivileges"; // Import the actual module

jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  return {
    __esModule: true,
    default: {
      ...actualAxios,
      create: jest.fn(() => actualAxios),
    },
  };
});

// Mock usePrivileges dynamically for individual test cases
// We create a jest.fn() for usePrivileges to allow mocking its return value
const mockUsePrivileges = jest.fn();

jest.mock("~/hooks/usePrivileges", () => ({
  __esModule: true,
  default: () => mockUsePrivileges(), // Make the default export use the mock function
  usePrivileges: () => mockUsePrivileges(), // Make the named export use the mock function
}));

jest.mock("~/hooks/useCommonTranslations", () => ({
  __esModule: true,
  useCommonTranslations: () => ({ t: (key: string) => key }),
}));

jest.mock('~/components/common/AccessDenied', () => {
  return function MockAccessDenied() {
    return <div data-testid="access-denied">Access Denied</div>;
  };
});

describe("ImportRuleConfig", () => {
  // Reset the mock before each test to ensure isolation
  beforeEach(() => {
    mockUsePrivileges.mockClear();
    // Default mock implementation for most tests where access is granted
    mockUsePrivileges.mockReturnValue({ canImportRule: true });
  });

  it("renders the drag and drop area and heading", () => {
    render(<ImportRuleConfig />);
    expect(screen.getByText("importRulePage.ImportRuleConfigTitle")).toBeInTheDocument();
    expect(screen.getByText("importRulePage.uploadPrompt")).toBeInTheDocument();
  });

  it("renders access denied if privilege is missing", () => {
    // Override the mock specifically for this test
    mockUsePrivileges.mockReturnValue({ canImportRule: false });
    render(<ImportRuleConfig />);
    expect(screen.getByTestId("access-denied")).toBeInTheDocument();
  });

  it("does not crash on file upload with invalid JSON", async () => {
    // Ensure the mock is set to true for this test
    mockUsePrivileges.mockReturnValue({ canImportRule: true });
    const { container } = render(<ImportRuleConfig />);
    const file = new File(["not valid json"], "invalid.json", { type: "application/json" });
    const input = container.querySelector("input[type='file']");

    fireEvent.change(input!, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("importRulePage.errorParsingJson")).toBeInTheDocument();
    });
  });
});