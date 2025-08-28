// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RuleList from "../index";
import * as service from "../service";
import * as privileges from "~/hooks/usePrivileges";
import { message } from "antd";

// Mock external dependencies
jest.mock("../service");

jest.mock('axios', () => {
  const axiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => axiosInstance),
    },
  };
});


jest.mock("~/hooks/usePrivileges", () => ({
  __esModule: true,
  default: () => ({
    canViewRules: true,
    canCreateRule: true,
    canTransition: true,
  }),
  usePrivileges: () => ({
    canViewRules: true,
    canCreateRule: true,
    canTransition: true,
  }),
}));

jest.mock("antd", () => {
  const actual = jest.requireActual("antd");
  return {
    ...actual,
    message: {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
    },
    // Mock Modal to immediately render content for tests
    Modal: {
      ...actual.Modal,
      useModal: () => [
        {
          confirm: jest.fn((options) => options.onOk()), // Automatically confirm modals
        },
        null, // contextHolder
      ],
    },
  };
});

// Mock the AuthContext and useAuth hook
jest.mock("~/context/auth", () => ({
  useAuth: () => ({
    profile: { // Provide a mock profile object
      username: 'testuser',
      privileges: ['SECURITY_CREATE_RULE', 'SECURITY_UPDATE_RULE', 'SECURITY_GET_RULE'],
    },
  }),
}));

// Mock the common translations hook if it's used for "Cancel" or other text
jest.mock('~/hooks', () => ({
  useCommonTranslations: () => ({
    t: (key: string) => {
      switch (key) {
        case 'rulesListPage.create': return 'Create';
        case 'rulesListPage.retry': return 'Retry';
        case 'rulesListPage.table.name': return 'Name';
        case 'rulesListPage.table.version': return 'Version';
        case 'rulesListPage.table.description': return 'Description';
        case 'rulesListPage.table.state': return 'State';
        case 'rulesListPage.table.owner': return 'Owner';
        case 'rulesListPage.table.updatedAt': return 'Updated At';
        case 'rulesListPage.table.action': return 'Action';
        case 'rulesListPage.table.modify': return 'Modify';
        case 'rulesListPage.table.review': return 'Review';
        // Add other translations as needed for your tests
        case 'common.cancel': return 'Cancel'; // Assuming 'Cancel' is from common translations
        case 'common.ok': return 'OK';
        default: return key;
      }
    },
  }),
}));


// Mock the lazy-loaded components to render immediately for tests
jest.mock('../../CreateRule/index', () => {
  return ({ open, setOpen, afterCreate }: any) => {
    if (!open) return null;
    return (
      <div role="dialog" aria-label="Create Rule Modal">
        <h1>Create Rule</h1>
        <button onClick={() => {
          setOpen(false);
          afterCreate();
        }}>Cancel</button>
        <button onClick={() => {
          setOpen(false);
          afterCreate();
        }}>OK</button>
      </div>
    );
  };
});

jest.mock('../../EditRule/index', () => {
  return ({ open, setOpen, setSelectedRule, afterEdit }: any) => {
    if (!open) return null;
    return (
      <div role="dialog" aria-label="Edit Rule Modal">
        <h1>Edit Rule</h1>
        <button onClick={() => {
          setOpen(false);
          setSelectedRule(null);
          afterEdit();
        }}>Cancel</button>
        <button onClick={() => {
          setOpen(false);
          afterEdit();
        }}>Save</button>
      </div>
    );
  };
});


// Setup for AntD matchMedia
if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
}

describe("RuleList Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders rule list heading", async () => {
    (service.getRules as jest.Mock).mockResolvedValue({ total: 0, page: 1, countInPage: 0, data: [] });
    render(<RuleList />);
    expect(await screen.findByTestId("rule-view")).toBeInTheDocument();
  });

  it("shows loading state and then table", async () => {
    (service.getRules as jest.Mock).mockResolvedValue({ total: 1, page: 1, countInPage: 1, data: [] });
    const { container } = render(<RuleList />);
    expect(container.querySelector(".ant-spin-nested-loading")).toBeInTheDocument(); // Changed to ant-spin-nested-loading
    await waitFor(() => {
      // There is no static text "Rules", confirm the table is present
      expect(screen.getByTestId("rule-view")).toBeInTheDocument();
    });
  });

  it("shows error alert on fetch failure", async () => {
    (service.getRules as jest.Mock).mockRejectedValue(new Error("Failed to fetch"));
    render(<RuleList />);
    expect(await screen.findByText("Failed to fetch")).toBeInTheDocument();
  });

  it("shows Create Rule button if permission exists", async () => {
    (service.getRules as jest.Mock).mockResolvedValue({ total: 0, page: 1, countInPage: 0, data: [] });
    render(<RuleList />);
    expect(await screen.findByText("Create")).toBeInTheDocument();
  });

  it("opens and closes Create Rule modal", async () => {
    (service.getRules as jest.Mock).mockResolvedValue({ total: 0, page: 1, countInPage: 0, data: [] });
    render(<RuleList />);
    fireEvent.click(await screen.findByText("Create"));
    // Ensure the modal content is rendered and then find the Cancel button
    expect(await screen.findByRole("dialog", { name: /create rule modal/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i })); // Use role and name for robustness
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /create rule modal/i })).not.toBeInTheDocument();
    });
  });

  it("retries fetch when Retry button is clicked", async () => {
    (service.getRules as jest.Mock)
      .mockRejectedValueOnce(new Error("Failed to fetch"))
      .mockResolvedValueOnce({ total: 0, page: 1, countInPage: 0, data: [] });

    render(<RuleList />);
    // Wait for the error alert and then the retry button
    await waitFor(() => screen.getByTestId("retry-button"));
    fireEvent.click(screen.getByTestId("retry-button")); // Use data-testid for the retry button

    // After retry, expect the table to be visible (no error)
    expect(await screen.findByTestId("rule-view")).toBeInTheDocument();
  });
});