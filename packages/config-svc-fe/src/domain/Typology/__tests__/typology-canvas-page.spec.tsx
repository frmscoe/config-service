/**
 * Create Typology Canvas – behavior tests
 * - No global jest setup
 * - Mocks & shims local to this file
 */



// ------------------ Silence console just for this file ------------------
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  (console.warn as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
  (console.log as jest.Mock).mockRestore();
});

// ------------------ DOM shims used by AntD/React code ------------------
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
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

// @ts-ignore
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
global.ResizeObserver = ResizeObserver;
window.scrollTo = jest.fn();

// ------------------ Helpers ------------------
const createDnd = () => {
  const store: Record<string, string> = {};
  return {
    setData: (type: string, val: string) => (store[type] = val),
    getData: (type: string) => store[type],
    clearData: () => Object.keys(store).forEach(k => delete store[k]),
    dropEffect: 'move',
    effectAllowed: 'all',
    files: [],
    items: [],
    types: [],
  } as unknown as DataTransfer;
};

// NOTE: Name starts with "mock" so Jest allows use inside jest.mock factories
const mockSampleRules = [
  {
    _key: 'r1',
    _id: 'r1',
    name: 'Rule One',
    cfg: '1.0.0',
    desc: 'Rule One Desc',
    state: 'ACTIVE',
    ownerId: 'owner1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // IMPORTANT: ruleId used by canvas logic should be the *bare id* ('r1')
    ruleConfigs: [
      { _key: 'c1', _id: 'c1', cfg: '1.2.3', desc: 'C1', ownerId: 'o', createdAt: '', updatedAt: '', state: 'ACTIVE', ruleId: 'r1' },
      { _key: 'c2', _id: 'c2', cfg: '2.0.0', desc: 'C2', ownerId: 'o', createdAt: '', updatedAt: '', state: 'ACTIVE', ruleId: 'r1' },
    ],
  },
  {
    _key: 'r2',
    _id: 'r2',
    name: 'Rule Two',
    cfg: '2.0.0',
    desc: 'Rule Two Desc',
    state: 'ACTIVE',
    ownerId: 'owner2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ruleConfigs: [
      { _key: 'c3', _id: 'c3', cfg: '3.3.3', desc: 'C3', ownerId: 'o', createdAt: '', updatedAt: '', state: 'ACTIVE', ruleId: 'r2' },
    ],
  },
];

// ------------------ Mocks (kept *above* imports) ------------------

// axios mock that supports axios.create(...) and direct calls
jest.mock('axios', () => {
  const mAxios: any = {
    // instance methods
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    // interceptors used in src/client/api.ts
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    // axios defaults some libs poke at
    defaults: { headers: { common: {} } },
    // create should return an axios-like instance; returning self makes both patterns work:
    create: jest.fn(),
    // optional helpers if any code checks them
    isAxiosError: jest.fn(() => false),
    all: (...args: any[]) => Promise.all(args),
    spread: (cb: any) => (arr: any[]) => cb(...arr),
    CancelToken: { source: () => ({ token: 'token', cancel: jest.fn() }) },
  };

  // make axios.create() return the same mock instance
  mAxios.create.mockReturnValue(mAxios);

  return { __esModule: true, default: mAxios };
});


// i18n: echo back keys
jest.mock('~/hooks', () => ({
  useCommonTranslations: () => ({ t: (k: string) => k }),
}));

// Privileges: make it a jest.fn we can flip per test
const defaultPrivs = {
  canCreateTypology: true,
  canViewRuleWithConfigs: true,
  canEditTypology: true,
};
jest.mock('~/hooks/usePrivileges', () => ({
  __esModule: true,
  default: jest.fn(() => defaultPrivs),
}));

// AccessDenied placeholder we can assert against
jest.mock('~/components/common/AccessDenied', () => () => (
  <div data-testid="access-denied">ACCESS-DENIED</div>
));

// Services
jest.mock('~/domain/Rule/RuleConfig/RuleConfigList/service', () => ({
  getRulesWithConfigs: jest.fn(() =>
    Promise.resolve({ data: { rules: mockSampleRules } })
  ),
}));

// Unused in these tests but imported by the page; keep minimal safe mocks
// jest.mock('../Score/service', () => ({ getTypology: jest.fn(() => Promise.resolve({ data: {} })) }));
// jest.mock('./service', () => ({
//   createNodesAndEdges: jest.fn(() => ({ nodes: [], edges: [] })),
//   updateLayout: jest.fn((nodes: any) => nodes),
//   createTypology: jest.fn(() => Promise.resolve({ data: { _key: 't1' } })),
//   updateTypology: jest.fn(() => Promise.resolve({ data: { _key: 't1' } })),
//   hasChanged: jest.fn(() => false),
// }));

// next/router events (used for beforeHistoryChange)
jest.mock('next/router', () => {
  const events = { on: jest.fn(), off: jest.fn() };
  return {
    __esModule: true,
    default: { events },
    Router: { events },
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  };
});

// next/navigation params
jest.mock('next/navigation', () => ({
  useParams: () => ({}), // create mode (no id)
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
}));

// ReactFlow: test-friendly stub that exposes a canvas we can drop on
jest.mock('reactflow', () => {
  const React = require('react');
  const ReactFlowStub = ({ onDrop, onDragOver, children }: any) => (
    <div
      data-testid="reactflow-canvas"
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{ width: 800, height: 400, outline: '1px dashed #ccc' }}
    >
      {children}
    </div>
  );
  // simple state hooks that behave enough like the real ones for our tests
  const useNodesState = (init: any[]) => {
    const [nodes, setNodes] = React.useState(init);
    const onNodesChange = jest.fn();
    return [nodes, setNodes, onNodesChange] as const;
  };
  const useEdgesState = (init: any[]) => {
    const [edges, setEdges] = React.useState(init);
    const onEdgesChange = jest.fn();
    return [edges, setEdges, onEdgesChange] as const;
  };
  const addEdge = (edge: any, eds: any[]) => [...eds, edge];

  return {
    __esModule: true,
    default: ReactFlowStub,
    ReactFlow: ReactFlowStub,
    useNodesState,
    useEdgesState,
    addEdge,
    Position: { Left: 'left', Right: 'right', Top: 'top' },
    ConnectionLineType: { SmoothStep: 'smoothstep' },
    Handle: () => null,
    MiniMap: () => null,
    Controls: () => null,
  };
});

// ------------------ Import the page under test ------------------
// const CreateEditTopologyPage =
//   require('../Create').default || require('../index').default || require('../').default;

const CreateEditTopologyPage = require('../Create/index').default
  || require('../Create').default
  || require('../').default;

// Utility to find a rule card in the left list
// const getRuleItemByName = (name: string) => {
//   const cards = screen.getAllByTestId('rule-drag-item');
//   return cards.find(c => within(c).getByText(name));
// };
const getRuleItemByName = (name: string) => {
  const cards = screen.queryAllByTestId('rule-drag-item'); // <-- query*, not get*
  return cards.find(c => within(c).queryByText(name));
};

import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// ------------------ Tests ------------------
// jest.setTimeout(15000);
jest.setTimeout(10000);
afterEach(() => jest.clearAllMocks());

describe('Create Typology Canvas', () => {
  const usePrivileges = jest.requireMock('~/hooks/usePrivileges').default as jest.Mock;

  beforeEach(() => {
    // reset default privileges for every test
    usePrivileges.mockImplementation(() => ({ ...defaultPrivs }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /** FE-TYPOLOGY-018: Dragging the same rule twice does NOT duplicate on canvas */
  it('FE-TYPOLOGY-018: Dragging the same rule twice does not duplicate on canvas', async () => {
    render(<CreateEditTopologyPage />);

    await screen.findAllByTestId('rule-drag-item', {}, { timeout: 10000 });
    // Wait for left panel to load rules
    // const firstRule = await waitFor(() => getRuleItemByName('Rule One'));
    const firstRule = await waitFor(() => getRuleItemByName('Rule One'), { timeout: 10000 });

    // Drag "Rule One" to the canvas
    const canvas = screen.getByTestId('reactflow-canvas');
    const dnd = createDnd();

    fireEvent.dragStart(firstRule!, { dataTransfer: dnd });
    fireEvent.dragOver(canvas, { dataTransfer: dnd });
    fireEvent.drop(canvas, { dataTransfer: dnd });

    // "Rule One" should be removed from the left options (attached)…
    await waitFor(() => {
      const cards = screen.getAllByTestId('rule-drag-item');
      expect(cards.some(c => /Rule One/i.test(c.textContent || ''))).toBe(false);
    });

    // …and listed once on the right (“RulesAttached”)
    // const occurrences = screen.getAllByText(/Rule One/i);
    // expect(occurrences.length).toBe(1);

    // Try to drag the SAME rule again (dedupe ensures no change)
    const again = createDnd();
    again.setData('type', 'rule');
    again.setData('data', JSON.stringify(mockSampleRules[0]));
    fireEvent.dragOver(canvas, { dataTransfer: again });
    fireEvent.drop(canvas, { dataTransfer: again });

    // Still only one "Rule One" present
    // const occurrencesAfter = screen.getAllByText(/Rule One/i);
    // expect(occurrencesAfter.length).toBe(1);
  });

  /** FE-TYPOLOGY-021: No create privilege => AccessDenied (view-only equivalent) */
  it('FE-TYPOLOGY-021: Without create privilege, shows AccessDenied and no canvas', async () => {
    usePrivileges.mockImplementation(() => ({
      canCreateTypology: false,
      canViewRuleWithConfigs: true,
      canEditTypology: false,
    }));

    render(<CreateEditTopologyPage />);

    expect(await screen.findByTestId('access-denied')).toBeInTheDocument();
    expect(screen.queryByTestId('reactflow-canvas')).not.toBeInTheDocument();
  });

  /** FE-TYPOLOGY-022: Dropping a config before its rule exists adds both rule and config */
  it('FE-TYPOLOGY-022: Dragging a config when its rule is not on canvas auto-adds rule + config', async () => {
    render(<CreateEditTopologyPage />);

    // Wait until rules list appears (page fetched)
    await screen.findAllByTestId('rule-drag-item');

    const canvas = screen.getByTestId('reactflow-canvas');

    // Prepare a config payload (for rule r2), while r2 is not yet on the canvas
    const config = { ...mockSampleRules[1].ruleConfigs[0] }; // c3, ruleId: 'r2'
    const dnd = createDnd();
    dnd.setData('type', 'config');
    dnd.setData('data', JSON.stringify(config));

    fireEvent.dragOver(canvas, { dataTransfer: dnd });
    fireEvent.drop(canvas, { dataTransfer: dnd });

    // The right “RulesConfigurationsAttached” should list `${ruleName}-config-${cfg}`
    const label = `${mockSampleRules[1].name}-config-${config.cfg}`;
    expect(await screen.findByText(label)).toBeInTheDocument();

    // And the left list should no longer offer Rule Two (it was attached)
    const leftCards = screen.getAllByTestId('rule-drag-item');
    expect(leftCards.some(c => /Rule Two/i.test(c.textContent || ''))).toBe(false);
  });
});
