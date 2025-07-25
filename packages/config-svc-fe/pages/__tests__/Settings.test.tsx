// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Settings from "../settings";
import * as service from "../service";
import { message } from "antd";

jest.mock("../service");


jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance),
    },
  };
});


// Fix for AntD's use of matchMedia in Jest
if (!window.matchMedia) {
  window.matchMedia = function () {
    return {
      matches: false,
      media: '',
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  };
}



describe("Settings (Exit Conditions)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders heading and button", async () => {
    (service.fetchExitConditions as jest.Mock).mockResolvedValue([]);
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText("Exit Library Page")).toBeInTheDocument();
    });
    // expect(screen.getByText("Add New Exit Condition")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Add New Exit Condition")).toBeInTheDocument();
    });

  });

 

  it("shows loading spinner and then table", async () => {
    let resolvePromise: (value: any) => void;
    (service.fetchExitConditions as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    const { container } = render(<Settings />);

    // Look for spinner class instead of specific text
    expect(container.querySelector(".ant-spin-spinning")).toBeInTheDocument();

    // Simulate fetch completion
    await waitFor(() => {
      resolvePromise([]);
    });

    // Ensure content loads after fetch
    await waitFor(() => {
      expect(screen.getByText("Exit Library Page")).toBeInTheDocument();
    });

    // Ensure spinner disappears
    expect(container.querySelector(".ant-spin-spinning")).not.toBeInTheDocument();
  });


  it("displays error message on fetch failure", async () => {
    (service.fetchExitConditions as jest.Mock).mockRejectedValue(new Error("Fetch failed"));
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText("Failed to load exit conditions. Please try again.")).toBeInTheDocument();
    });
  });

  it("opens and closes modal", async () => {
    (service.fetchExitConditions as jest.Mock).mockResolvedValue([]);
    render(<Settings />);
    // Click the button by its role and accessible name
    fireEvent.click(screen.getByRole("button", { name: /Add New Exit Condition/i }));

    // Assert that the modal is visible by its role and accessible name (which is derived from the title)
    expect(await screen.findByRole("dialog", { name: /Add New Exit Condition/i })).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel")); // This line is fine as "Cancel" is unique within the modal context

    // Wait for the modal (identified by its role and name) to be removed from the document
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /Add New Exit Condition/i })).not.toBeInTheDocument();
    });
  });

  it("submits a new exit condition", async () => {
    (service.fetchExitConditions as jest.Mock).mockResolvedValue([]);
    (service.createExitCondition as jest.Mock).mockResolvedValue({});
    const spy = jest.spyOn(message, "success");

    render(<Settings />);
    fireEvent.click(screen.getByText("Add New Exit Condition"));

    fireEvent.change(screen.getByLabelText("Exit ID (e.g., .X05)"), { target: { value: ".X01" } });
    fireEvent.change(screen.getByLabelText("Reason / Text"), { target: { value: "Test reason" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Test description" } });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith("Exit Condition created successfully!");
    });
  });

  it("toggles checkbox and updates default status", async () => {
    const updateMock = jest.fn().mockResolvedValue({});
    (service.fetchExitConditions as jest.Mock).mockResolvedValue([
      { id: ".X99", reason: "Test", label: "X", isUserDefault: false, _key: "x" }
    ]);
    (service.updateExitCondition as jest.Mock).mockImplementation(updateMock);
    const spy = jest.spyOn(message, "success");

    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText(".X99")).toBeInTheDocument();
    });

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith("Exit Condition default status updated successfully!");
    });
  });
});