import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { EmailInputForm } from "./EmailInputForm";

describe("EmailInputForm", () => {
  it("renders correctly", () => {
    const handleMockSubmitEmail = jest.fn();
    render(<EmailInputForm onSubmitEmail={handleMockSubmitEmail} isLoading={false} />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByText("Continue With Email")).toBeInTheDocument();
  });

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

  it("shows an error message when ano email is entered", async () => {
    const handleMockSubmitEmail = jest.fn();
    render(<EmailInputForm onSubmitEmail={handleMockSubmitEmail} isLoading={false} />);

    fireEvent.input(screen.getByLabelText("Email"), { target: { value: "" } });
    fireEvent.submit(screen.getByText("Continue With Email"));

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });

    expect(handleMockSubmitEmail).not.toHaveBeenCalled();
  });

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
