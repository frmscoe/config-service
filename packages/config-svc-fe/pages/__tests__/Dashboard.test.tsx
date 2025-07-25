// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Dashboard from "../index";
import * as service from "../service";

// Mock the dashboard data services
jest.mock("../service", () => ({
  fetchDashboardRules: jest.fn(),
  fetchDashboardRuleConfigs: jest.fn(),
  fetchDashboardTypologies: jest.fn(),
  fetchDashboardNetworkMaps: jest.fn(),
}));

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state and dashboard data correctly", async () => {
    (service.fetchDashboardRules as jest.Mock).mockResolvedValue({ total: 5, draft: 2, pendingReview: 1 });
    (service.fetchDashboardRuleConfigs as jest.Mock).mockResolvedValue({ total: 10, draft: 3, pendingReview: 2 });
    (service.fetchDashboardTypologies as jest.Mock).mockResolvedValue({ total: 7, draft: 2, pendingReview: 0 });
    (service.fetchDashboardNetworkMaps as jest.Mock).mockResolvedValue({ total: 3, draft: 1, pendingReview: 1 });

    render(<Dashboard />);
    expect(screen.getByText("Loading dashboard data...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Rules")).toBeInTheDocument();
      expect(screen.getByText("Typologies")).toBeInTheDocument();
      expect(screen.getByText("Network Maps")).toBeInTheDocument();
      expect(screen.getByText("Rule Configurations")).toBeInTheDocument();
    });
  });

  it("renders error message when any fetch fails", async () => {
    (service.fetchDashboardRules as jest.Mock).mockRejectedValue(new Error("Fail"));
    (service.fetchDashboardRuleConfigs as jest.Mock).mockResolvedValue({ total: 0, draft: 0, pendingReview: 0 });
    (service.fetchDashboardTypologies as jest.Mock).mockResolvedValue({ total: 0, draft: 0, pendingReview: 0 });
    (service.fetchDashboardNetworkMaps as jest.Mock).mockResolvedValue({ total: 0, draft: 0, pendingReview: 0 });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("One or more dashboard data types failed to load. Please check console for details.")).toBeInTheDocument();
    });
  });

  it("toggles expand/collapse on rule card", async () => {
    (service.fetchDashboardRules as jest.Mock).mockResolvedValue({ total: 1, draft: 1, pendingReview: 0 });
    (service.fetchDashboardRuleConfigs as jest.Mock).mockResolvedValue({ total: 0, draft: 0, pendingReview: 0 });
    (service.fetchDashboardTypologies as jest.Mock).mockResolvedValue({ total: 0, draft: 0, pendingReview: 0 });
    (service.fetchDashboardNetworkMaps as jest.Mock).mockResolvedValue({ total: 0, draft: 0, pendingReview: 0 });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Rules")).toBeInTheDocument();
    });

    // fireEvent.click(screen.getByRole("button")); // This clicks the expand icon on the first card
    fireEvent.click(screen.getByTestId("rules-expand-button")); // Clicks the expand button specifically for the Rules card
    expect(await screen.findByText("Draft: 1")).toBeInTheDocument();
    expect(screen.getByText("Pending Review: 0")).toBeInTheDocument();
  });

  it("toggles customizing mode", async () => {
    (service.fetchDashboardRules as jest.Mock).mockResolvedValue({ total: 1, draft: 0, pendingReview: 0 });
    (service.fetchDashboardRuleConfigs as jest.Mock).mockResolvedValue({ total: 1, draft: 0, pendingReview: 0 });
    (service.fetchDashboardTypologies as jest.Mock).mockResolvedValue({ total: 1, draft: 0, pendingReview: 0 });
    (service.fetchDashboardNetworkMaps as jest.Mock).mockResolvedValue({ total: 1, draft: 0, pendingReview: 0 });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Customize Dashboard")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Customize Dashboard"));
    expect(screen.getByText("Done Customizing")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Done Customizing"));
    expect(screen.getByText("Customize Dashboard")).toBeInTheDocument();
  });
});
