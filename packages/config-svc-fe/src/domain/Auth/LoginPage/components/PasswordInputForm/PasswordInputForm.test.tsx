// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { PasswordInputForm } from "./PasswordInputForm";

describe("PasswordInputForm", () => {

  // Renders correctly  onSubmitPassword, onBack, isLoading: false  Field labeled “Password” and button “Login” are present
  it("renders correctly", () => {
    const handleMockSubmitPassword = jest.fn();
    render(
      <PasswordInputForm
        onSubmitPassword={handleMockSubmitPassword}
        isLoading={false}
        onBack={jest.fn()}
      />,
    );
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  // No Password Entered  Submit with empty input Show “Password is required”, do not call handler
  it("shows an error message when no password is entered", async () => {
    const handleMockSubmitPassword = jest.fn();
    render(
      <PasswordInputForm
        onSubmitPassword={handleMockSubmitPassword}
        isLoading={false}
        onBack={jest.fn()}
      />,
    );

    fireEvent.submit(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });

    expect(handleMockSubmitPassword).not.toHaveBeenCalled();
  });

  // Password Too Short Input: "123"  Show “Password must be at least 6 characters”, do not call handler
  it("shows an error message when the password is too short", async () => {
    const handleMockSubmitPassword = jest.fn();
    render(
      <PasswordInputForm
        onSubmitPassword={handleMockSubmitPassword}
        isLoading={false}
        onBack={jest.fn()}
      />,
    );

    fireEvent.input(screen.getByLabelText("Password"), { target: { value: "123" } });
    fireEvent.submit(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText("Password must be at least 6 characters")).toBeInTheDocument();
    });

    expect(handleMockSubmitPassword).not.toHaveBeenCalled();
  });

  // Valid Password Submission  Input: "password123"  Call handler with "password123"
  it("calls onSubmitPassword with the password when a valid password is submitted", async () => {
    const handleMockSubmitPassword = jest.fn();
    render(
      <PasswordInputForm
        onSubmitPassword={handleMockSubmitPassword}
        isLoading={false}
        onBack={jest.fn()}
      />,
    );

    const validPassword = "password123";
    fireEvent.input(screen.getByLabelText("Password"), { target: { value: validPassword } });
    fireEvent.submit(screen.getByText("Login"));

    await waitFor(() => {
      expect(handleMockSubmitPassword).toHaveBeenCalledWith(validPassword);
    });
  });
});
