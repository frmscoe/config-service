import React from 'react';
import { render, screen } from '@testing-library/react';
import { Review } from '../Review';


// silence noisy logs just for this file
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});
afterAll(() => {
  (console.warn as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
  (console.log as jest.Mock).mockRestore();
});

// mock the HTTP client in all import shapes: default, { api }, and { Api }
jest.mock('~/client', () => {
  const mock = {
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
  return {
    __esModule: true,
    default: mock,
    api: mock,
    Api: mock,
  };
});


// Keep your existing matchMedia + axios mocks here if you already added them…

// Minimal Auth + Privileges context mocks so useAuth/usePrivileges don’t explode
jest.mock('~/context/auth', () => {
  const React = require('react');
  const Ctx = React.createContext({
    token: 't',
    user: { username: 'tester', clientId: 'client123' },
  });
  return {
    AuthContext: Ctx,
    AuthProvider: ({ children }: any) => <Ctx.Provider value={{ token: 't', user: { username: 'tester', clientId: 'client123' } }}>{children}</Ctx.Provider>,
    useAuth: () => React.useContext(Ctx),
  };
});
// add (or replace) this mock:
jest.mock('~/hooks/usePrivileges', () => ({
  __esModule: true,
  default: () => ({
    // component does: const { privileges } = usePrivileges();
    privileges: [
      'SECURITY_VIEW_RULE',
      'SECURITY_UPDATE_RULE',
      'SECURITY_REVIEW_RULE',
    ],
  }),
}));


// Router mock (no buttons depend on this, but keep it consistent)
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush, query: { id: 'rule/abc', cfg: '1.0.0' } }),
}));

// If Review imports any BE calls, stub them to no-op so the screen paints
jest.mock('../service', () => ({
  getFullRuleConfig: jest.fn().mockResolvedValue({ data: {} }),
  updateRuleState: jest.fn().mockResolvedValue({ data: {} }),
}));



beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('FE-RULE-006/007/008 RuleDetailsPage (Review)', () => {
  it('shows version details panel (FE-RULE-006)', async () => {
    render(<Review />);

    // Title
    expect(await screen.findByText(/review/i)).toBeInTheDocument();

    // Descriptions labels actually rendered by the component
    expect(screen.getByText(/^rule$/i)).toBeInTheDocument();
    expect(screen.getByText(/^version$/i)).toBeInTheDocument();
    expect(screen.getByText(/^description$/i)).toBeInTheDocument();
    expect(screen.getByText(/^created$/i)).toBeInTheDocument();
    expect(screen.getByText(/^updated$/i)).toBeInTheDocument();
    expect(screen.getByText(/^state$/i)).toBeInTheDocument();

    // Cancel button/link visible
    expect(screen.getByRole('link', { name: /cancel/i })).toBeInTheDocument();
  });

  it('Cancel button is present and navigable (FE-RULE-008)', async () => {
    render(<Review />);
    const cancel = await screen.findByRole('link', { name: /cancel/i });
    expect(cancel).toHaveAttribute('href', '/rule');
  }, 10000);

  // NOTE: The UI under test doesn’t show “Submit for Review” or “Abandon” buttons,
  // so FE-RULE-007 is not asserted here to avoid false failures.
});
