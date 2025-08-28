// src/domain/Rule/EditRule/__tests__/rule-modify.spec.tsx

// axios mock kept minimal
jest.mock('axios', () => {
  const mock = {
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
  return { create: () => mock };
});

// i18n mock
jest.mock('~/hooks', () => ({
  useCommonTranslations: jest.fn(() => ({ t: (k: string) => k })),
}));

//Only mock the update service used by the Edit modal
jest.mock('../service', () => ({
  __esModule: true,
  updateRule: jest.fn(() =>
    Promise.resolve({ data: { _key: '123', name: 'Renamed Rule', cfg: '1.2.3' } })
  ),
}));

jest.mock('../../RuleDetailPage/service', () => ({
  __esModule: true,
  getRules: jest.fn(() =>
    Promise.resolve({
      data: {
        rules: [
          // return at least the rule being edited or keep it empty if you don't use it
          { _key: '123', name: 'Original Rule', cfg: '1.2.3', state: '01_DRAFT' },
        ],
      },
    })
  ),
}));

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

// antd portal helper
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({ matches: false, addListener: jest.fn(), removeListener: jest.fn() }),
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditRuleModal from '../index.tsx'; // <-- your Edit modal
import { updateRule } from '../service';
import { message } from 'antd';

jest.setTimeout(10000);
afterEach(() => jest.clearAllMocks());

const makeProps = () => ({
  open: true,
  setOpen: jest.fn(),
  afterEdit: jest.fn(),
  setSelectedRule: jest.fn(),
  // Ensure MODIFY path (not clone)
  rule: {
    _key: '123',          // <-- this should be the id your API expects
    cfg: '1.2.3',
    name: 'Original Rule',
    desc: 'Original description',
    state: '01_DRAFT',    // <-- important to avoid clone path
    category: 'AML',
    dataType: 'NUMERIC',
  },
});

describe('EDGE-004: RuleController — rename rule (modify/update)', () => {
  it('updates the rule name via updateRule, no cloning', async () => {
    const props = makeProps();

    render(<EditRuleModal {...props} />);

    // Change name
    const nameInput =
      (await screen.findByPlaceholderText('createRulePage.name')) ||
      screen.getByRole('textbox', { name: /createRulePage\.name/i });
    fireEvent.change(nameInput, { target: { value: 'Renamed Rule' } });

    // Submit
    const submitBtn =
      (await screen.findByRole('button', { name: /createRulePage\.submit/i })) ||
      screen.getAllByRole('button').find(b => b.textContent?.includes('createRulePage.submit'))!;
    fireEvent.click(submitBtn);

    // Assert update called with body + id; drawer closed; success feedback
    await waitFor(() => {
      expect(updateRule).toHaveBeenCalledTimes(1);
      const [body, id] = (updateRule as jest.Mock).mock.calls[0];

      // id used in PATCH /rule/:id
      expect(id).toBe('123');

      // body should contain the new name; other fields may be present too
      expect(body).toEqual(expect.objectContaining({ name: 'Renamed Rule' }));

      expect(props.setOpen).toHaveBeenCalledWith(false);
    });

    // Optional: your UI might show a success toast
    // expect(message.success).toHaveBeenCalled();
  });
});
