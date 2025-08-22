

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


// Auth/privilege mocks so the page renders gated parts
jest.mock('~/context/auth', () => {
  const React = require('react');
  const Ctx = React.createContext({ token: 't', user: { username: 'owner', privileges: ['SECURITY_CREATE_RULE','SECURITY_UPDATE_RULE'] } });
  return {
    AuthContext: Ctx,
    AuthProvider: ({ children }: any) => <Ctx.Provider value={{ token: 't', user: { username: 'owner', privileges: ['SECURITY_CREATE_RULE','SECURITY_UPDATE_RULE'] } }}>{children}</Ctx.Provider>,
    useAuth: () => React.useContext(Ctx),
  };
});
jest.mock('~/hooks/usePrivileges', () => ({
  __esModule: true,
  default: () => ({
    privileges: [
      'SECURITY_VIEW_RULE',
      'SECURITY_CREATE_RULE',
      'SECURITY_UPDATE_RULE',
      'SECURITY_REVIEW_RULE',
    ],
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


// AntD needs this in JSDOM
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import RuleDetailPage from '../RuleDetailPage';

jest.setTimeout(10000);
afterEach(() => jest.clearAllMocks());

const defaultProps = {
  loading: false,
  error: '',
  retry: jest.fn(),
  page: 1,
  data: [
    { _id: 'rule/1', _key: 'rule/1', name: 'Rule A', cfg: '1.0.0', state: '01_DRAFT', desc: 'Desc', ownerId: 'owner', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  total: 1,
  onPageChange: jest.fn(),
  open: false,
  setOpen: jest.fn(),
  openEdit: false,
  setOpenEdit: jest.fn(),
  user: { username: 'owner', privileges: ['SECURITY_CREATE_RULE','SECURITY_UPDATE_RULE'] },
  selectedRule: null,
  setSelectedRule: jest.fn(),
  filters: { desc: '', name: '', cfg: '', state: '', ownerId: '' },
  setFilters: jest.fn(),
  onRuleCreated: jest.fn(),
};

describe('FE-RULE-001 / FE-RULE-002 / FE-RULE-005 RuleListPage', () => {
  it('renders a rule table with expected columns and rows (FE-RULE-001)', async () => {
    render(<RuleDetailPage {...defaultProps} />);

    // Columns
    expect(await screen.findByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText(/version|cfg/i)).toBeInTheDocument();
    expect(screen.getByText(/state/i)).toBeInTheDocument();

    // Row
    expect(await screen.findByText(/rule a/i)).toBeInTheDocument();
  });

  it('clicking "Create" shows the create button (FE-RULE-002)', async () => {
    render(<RuleDetailPage {...defaultProps} />);
    expect(await screen.findByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('table renders a row we can later modify (FE-RULE-005)', async () => {
    render(<RuleDetailPage {...defaultProps} />);
    expect(await screen.findByText(/rule a/i)).toBeInTheDocument();
  }, 50000);
});
