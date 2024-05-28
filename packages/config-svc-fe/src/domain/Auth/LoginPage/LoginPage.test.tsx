// Import necessary modules
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import React from "react";
import { AuthProvider } from "~/context/auth";
import LoginPage from "./LoginPage";
import * as router from "next/router";

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  // Mock axios.create() to return a mocked axios instance
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
}));

// Mock useRouter
jest.mock('next/navigation', () => {
  const original = jest.requireActual('next/navigation');
  const useRouter = jest.fn().mockReturnValue({pathname: '', push: jest.fn()});
  const usePathname = jest.fn(() => {
    const router = useRouter();
    return router.pathname;
  });
  const useSearchParams = jest.fn(() => {
    const router = useRouter();
    return new URLSearchParams(router?.query?.toString());
  });
  return {
    ...original,
    useRouter,
    usePathname,
    useSearchParams,
  };
});

// Mock axios instance
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("LoginPage", () => {
  afterAll(() => {jest.resetAllMocks()});
  it("successfully logs in and navigates to the home page", async () => {
    // Mock the response of axios.post
    mockedAxios.post.mockResolvedValueOnce({ data: { access_token: "fake_token" } });

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    );

    // Step 1: Enter email and submit
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByText("Continue With Email"));

    // Step 2: Enter password and submit
    await waitFor(() => screen.getByLabelText("Password"));
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());
    expect(localStorage.setItem).toHaveBeenCalledWith("token", "fake_token");
  });

  it("handles login failure", async () => {
    // Mock the rejection of axios.post
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: {
          message: "Login failed",
        },
      },
    });

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByText("Continue With Email"));

    await waitFor(() => screen.getByLabelText("Password"));
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrongpassword" } });
    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());
  });
});
