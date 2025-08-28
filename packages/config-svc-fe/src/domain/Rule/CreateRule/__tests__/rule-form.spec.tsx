// src/domain/Rule/CreateRule/__tests__/rule-form.spec.tsx


// --- axios mock so src/client/api.ts can safely call axios.create(...) ---
jest.mock('axios', () => {
  const mockInterceptors = {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  };
  const mockInstance = {
    interceptors: mockInterceptors,
    // CRITICAL: resolve with { rules: [] } so checkRuleDuplicate() continues
    get: jest.fn().mockResolvedValue({ data: { rules: [] } }),
    // post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    post: jest.fn().mockResolvedValue({ data: {} }),
  };
  const axiosMock = {
    create: jest.fn(() => mockInstance),
    // In case something calls axios.<verb> directly:
    interceptors: mockInterceptors,
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
  return { __esModule: true, default: axiosMock };
});

// Make i18n labels predictable (last token -> "name", "description", "submit")
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k.split('.').slice(-1)[0],
    i18n: { changeLanguage: jest.fn() },
  }),
}));

// // At the very top of your test file, before imports that use the spinner
// jest.mock('~/components/common/FullScreenLoader', () => ({
//   __esModule: true,
//   default: () => null,  // renders nothing
// }));

// jest.mock('antd', () => {
//   const actual = jest.requireActual('antd');
//   return { 
//     ...actual,
//     Spin: ({ children }: any) => <>{children}</>  // bypass spinner overlay
//   };
// });

// Optional: capture success feedback
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    message: {
      success: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      open: jest.fn(),
      config: jest.fn(),
    },
  };
});

// AntD needs matchMedia in JSDOM
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((q: string) => ({
      matches: false,
      media: q,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // keep logs quiet for this file
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  (console.warn as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
  (console.log as jest.Mock).mockRestore();
});

// Object.defineProperty(window, 'matchMedia', {
//   writable: true,
//   value: jest.fn().mockImplementation((q: string) => ({
//     matches: false, media: q, onchange: null,
//     addListener: jest.fn(), removeListener: jest.fn(),
//     addEventListener: jest.fn(), removeEventListener: jest.fn(),
//     dispatchEvent: jest.fn(),
//   })),
// });

class ResizeObserver { observe(){} unobserve(){} disconnect(){} }
// @ts-ignore
global.ResizeObserver = ResizeObserver;

window.scrollTo = jest.fn();

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CreateRule from '../CreateRule';

jest.setTimeout(10000);
afterEach(() => jest.clearAllMocks());

describe('FE-RULE-003 / FE-RULE-004 RuleForm (Create)', () => {
  it('creates a rule when form is filled and submitted (FE-RULE-003)', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <CreateRule
        open={true}
        setOpen={() => {}}
        loading={false}
        error=""
        success=""
        onSubmit={onSubmit}
      />
    );

    const name = await screen.findByPlaceholderText(/name/i);
    const desc = screen.getByPlaceholderText(/description/i);

    fireEvent.change(name, { target: { value: 'My New Rule' } });
    fireEvent.change(desc, { target: { value: 'Test description' } });

    // Button label is "submit" via i18n mock
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it('shows validation errors and blocks submit (FE-RULE-004)', async () => {
    const onSubmit = jest.fn();

    render(
      <CreateRule
        open={true}
        setOpen={() => {}}
        loading={false}
        error=""
        success=""
        onSubmit={onSubmit}
      />
    );

    // fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    // Await the fireEvent.click if it triggers an async action
    // that updates the UI or state.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    // should render some "required" style error text
    const errors = await screen.findAllByText(/required|must|invalid/i);
    expect(errors.length).toBeGreaterThan(0);
    expect(onSubmit).not.toHaveBeenCalled();
  }, 50000);
});
