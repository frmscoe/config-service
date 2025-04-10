import "~/i18n/config";
import "@testing-library/jest-dom";

// Mock for Next.js useRouter
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock for localStorage
beforeAll(() => (Storage.prototype.setItem = jest.fn()));
afterAll(() => jest.clearAllMocks());

// Manually mock Axios
jest.mock("axios", () => ({
  post: jest.fn(() => Promise.resolve({ data: { access_token: "fake_token" } })),
}));
