// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import LoginPage from "~/domain/Auth/LoginPage/LoginPage";
import { useAuth } from "~/context/auth";
import axios from "axios";

// Mock axios and patch axios.create
jest.mock("axios");
(axios.create as any) = jest.fn(() => axios);

// Mock useAuth hook
jest.mock("~/context/auth", () => ({
  useAuth: jest.fn(),
}));

// Mock getUser
jest.mock("~/context/service", () => ({
  getUser: jest.fn(() =>
    Promise.resolve({
      data: {
        username: "test@example.com",
        privileges: [],
        platformRoleIds: [],
        clientId: "",
      },
    })
  ),
}));

const mockLogin = jest.fn();

describe("LoginPage", () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      login: mockLogin,
      error: null,
    });
  });

  it("transitions from email input to password input", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.submit(emailInput);
    });

    const passwordInput = await screen.findByLabelText(/password/i);
    expect(passwordInput).toBeInTheDocument();
  });

  it("handles successful login", async () => {
    mockLogin.mockResolvedValueOnce({});

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.submit(emailInput);
    });

    const passwordInput = await screen.findByLabelText(/password/i);
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.submit(passwordInput);
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: "test@example.com",
        password: "password123",
      });
    });
  });

  it("displays error message on failed login", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Login failed"));
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      login: mockLogin,
      error: "Login failed",
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.submit(emailInput);
    });

    const passwordInput = await screen.findByLabelText(/password/i);
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
      fireEvent.submit(passwordInput);
    });

    await waitFor(() => {
      expect(screen.getAllByText(/login failed/i).length).toBeGreaterThan(0);
    });
  });
});
