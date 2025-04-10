// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { EmailInputForm } from "./EmailInputForm";

describe("EmailInputForm", () => {
  // Component renders correctly  Props: onSubmitEmail, isLoading: false  Shows email input and “Continue With Email” button
  it("renders correctly", () => {
    const handleMockSubmitEmail = jest.fn();
    render(<EmailInputForm onSubmitEmail={handleMockSubmitEmail} isLoading={false} />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByText("Continue With Email")).toBeInTheDocument();
  });

  // Invalid email  Input: invalid-email => Submit Shows error: Email is not valid Does not call onSubmitEmail
  it("shows an error message when an invalid email is submitted", async () => {
    const handleMockSubmitEmail = jest.fn();
    render(<EmailInputForm onSubmitEmail={handleMockSubmitEmail} isLoading={false} />);

    fireEvent.input(screen.getByLabelText("Email"), { target: { value: "invalid-email" } });
    fireEvent.submit(screen.getByText("Continue With Email"));

    await waitFor(() => {
      expect(screen.getByText("Email is not valid")).toBeInTheDocument();
    });

    expect(handleMockSubmitEmail).not.toHaveBeenCalled();
  });

  // Empty email  Submit without input  Shows error: Email is required Does not call onSubmitEmail
  it("shows an error message when an email is entered", async () => {
    const handleMockSubmitEmail = jest.fn();
    render(<EmailInputForm onSubmitEmail={handleMockSubmitEmail} isLoading={false} />);

    fireEvent.input(screen.getByLabelText("Email"), { target: { value: "" } });
    fireEvent.submit(screen.getByText("Continue With Email"));

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });

    expect(handleMockSubmitEmail).not.toHaveBeenCalled();
  });

  // Valid email  Input: test@example.com => Submit  Calls onSubmitEmail('test@example.com')
  it("calls onSubmitEmail with the email when a valid email is submitted", async () => {
    const handleMockSubmitEmail = jest.fn();
    render(<EmailInputForm onSubmitEmail={handleMockSubmitEmail} isLoading={false} />);

    const validEmail = "test@example.com";
    fireEvent.input(screen.getByLabelText("Email"), { target: { value: validEmail } });
    fireEvent.submit(screen.getByText("Continue With Email"));

    await waitFor(() => {
      expect(handleMockSubmitEmail).toHaveBeenCalledWith(validEmail);
    });
  });
});
