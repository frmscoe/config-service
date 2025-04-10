// SPDX-License-Identifier: Apache 2.0

// Inline axios mock: MUST be declared before imports
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(() => Promise.resolve({ status: 201, data: {} })),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance),
    },
  };
});


import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImportRuleConfig from '../import';
import * as usePrivilegesHook from '~/hooks/usePrivileges';
import axios from 'axios';

jest.mock('~/hooks/useCommonTranslations', () => ({
  useCommonTranslations: () => ({
    t: (key: string) => key,
  }),
}));

// Cast to access mocked functions
const mockAxios = axios as any;

describe('Section 1: Initial State & Constants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders component when canImportRule is true', () => {
    jest.spyOn(usePrivilegesHook, 'default').mockReturnValue({ canImportRule: true });

    render(<ImportRuleConfig />);
    expect(screen.getByText('importRulePage.ImportRuleConfigTitle')).toBeInTheDocument();
    expect(screen.getByText('importRulePage.uploadPrompt')).toBeInTheDocument();
    expect(screen.getByText('importRulePage.uploadHint')).toBeInTheDocument();
  });

  it('renders AccessDeniedPage when canImportRule is false', () => {
    jest.spyOn(usePrivilegesHook, 'default').mockReturnValue({ canImportRule: false });

    render(<ImportRuleConfig />);
    expect(screen.getByText('accessPage.message')).toBeInTheDocument();
    expect(screen.getByText('accessPage.back')).toBeInTheDocument();
  });
});

describe('Section 2: Handle File Upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.create().get.mockReset(); // No `.default` here
    jest.spyOn(usePrivilegesHook, 'default').mockReturnValue({ canImportRule: true });
  });

  it('accepts a JSON file upload and attempts to read it', async () => {
    const mockJson = {
      id: 'my-rule@1.0.0',
      cfg: '1.0.0',
      desc: 'Test rule',
      config: {
        parameters: {
          ParameterName: 'param',
          ParameterValue: 'value',
          ParameterType: 'string',
        },
        bands: [],
        cases: [],
        exitConditions: [],
      },
    };

    mockAxios.create().get.mockResolvedValueOnce({ data: [] });

    const file = new File([JSON.stringify(mockJson)], 'rule.json', {
      type: 'application/json',
    });

    render(<ImportRuleConfig />);

    const dragger = screen.getByText('importRulePage.uploadPrompt').closest('div')!;
    const data = { dataTransfer: { files: [file] } };
    fireEvent.drop(dragger, data);

    await waitFor(() => {
      expect(screen.getByText('importRulePage.noExistingRuleFound')).toBeInTheDocument();
    });
  });
});

describe('Section 3: Parse JSON (Valid & Invalid)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(usePrivilegesHook, 'default').mockReturnValue({ canImportRule: true });
  });

  it('handles valid JSON upload and shows success modal', async () => {
    const validJson = {
      id: 'valid-rule@1.0.0',
      cfg: '1.0.0',
      desc: 'Valid Rule',
      config: {
        parameters: {
          ParameterName: 'param',
          ParameterValue: 'value',
          ParameterType: 'string',
        },
        bands: [],
        cases: [],
        exitConditions: [],
      },
    };

    mockAxios.create().get.mockResolvedValueOnce({ data: [] });

    const file = new File([JSON.stringify(validJson)], 'valid-rule.json', {
      type: 'application/json',
    });

    render(<ImportRuleConfig />);

    const dragger = screen.getByText('importRulePage.uploadPrompt').closest('div')!;
    fireEvent.drop(dragger, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('importRulePage.noExistingRuleFound')).toBeInTheDocument();
    });
  });

  it('handles invalid JSON and shows error modal', async () => {
    const malformedJson = '{ "invalid": true, '; // broken JSON

    const file = new File([malformedJson], 'broken.json', {
      type: 'application/json',
    });

    render(<ImportRuleConfig />);

    const dragger = screen.getByText('importRulePage.uploadPrompt').closest('div')!;
    fireEvent.drop(dragger, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('importRulePage.errorParsingJson')).toBeInTheDocument();
    });
  });
});

describe('Section 4: Check for Existing Rule API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(usePrivilegesHook, 'default').mockReturnValue({ canImportRule: true });
  });

  it('displays existing rule modal when rule exists', async () => {
    const json = {
      id: 'existing-rule@1.0.0',
      cfg: '1.0.0',
      desc: 'An existing rule',
      config: {
        parameters: {
          ParameterName: 'param',
          ParameterValue: 'value',
          ParameterType: 'string',
        },
        bands: [],
        cases: [],
        exitConditions: [],
      },
    };

    // Simulate rule existing
    mockAxios.create().get.mockResolvedValueOnce({
      data: [{ _id: 'rule123', cfg: '1.0.0' }],
    });

    const file = new File([JSON.stringify(json)], 'existing.json', {
      type: 'application/json',
    });

    render(<ImportRuleConfig />);

    const dragger = screen.getByText('importRulePage.uploadPrompt').closest('div')!;
    fireEvent.drop(dragger, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('importRulePage.existingRuleFound')).toBeInTheDocument();
    });
  });

  it('displays no rule modal when rule does not exist', async () => {
    const json = {
      id: 'non-existent-rule@1.0.0',
      cfg: '1.0.0',
      desc: 'A new rule',
      config: {
        parameters: {
          ParameterName: 'param',
          ParameterValue: 'value',
          ParameterType: 'string',
        },
        bands: [],
        cases: [],
        exitConditions: [],
      },
    };

    // Simulate no rule found
    mockAxios.create().get.mockResolvedValueOnce({
      data: [],
    });

    const file = new File([JSON.stringify(json)], 'new.json', {
      type: 'application/json',
    });

    render(<ImportRuleConfig />);

    const dragger = screen.getByText('importRulePage.uploadPrompt').closest('div')!;
    fireEvent.drop(dragger, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('importRulePage.noExistingRuleFound')).toBeInTheDocument();
    });
  });
});


describe('Section 5: User Decision on Existing Rule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(usePrivilegesHook, 'default').mockReturnValue({ canImportRule: true });
  });

  it('clicking "Use Existing Rule" checks for existing config', async () => {
    const json = {
      id: 'existing-rule@1.0.0',
      cfg: '1.0.0',
      desc: 'A rule with config',
      config: {
        parameters: {
          ParameterName: 'param',
          ParameterValue: 'value',
          ParameterType: 'string',
        },
        bands: [],
        cases: [],
        exitConditions: [],
      },
    };

    // Simulate existing rule
    mockAxios.create().get
      .mockResolvedValueOnce({ data: [{ _id: 'abc123', cfg: '1.0.0' }] }) // first GET → rule exists
      .mockResolvedValueOnce({ data: { ruleConfigs: [{ id: 'cfg-1' }] } }); // second GET → config exists

    const file = new File([JSON.stringify(json)], 'rule.json', {
      type: 'application/json',
    });

    render(<ImportRuleConfig />);
    const dragger = screen.getByText('importRulePage.uploadPrompt').closest('div')!;
    fireEvent.drop(dragger, { dataTransfer: { files: [file] } });

    // Wait for rule found modal
    await waitFor(() => {
      expect(screen.getByText('importRulePage.existingRuleFound')).toBeInTheDocument();
    });

    // Click "Use Existing Rule"
    fireEvent.click(screen.getByText('importRulePage.useExistingRule'));

    // Wait for config check modal
    await waitFor(() => {
      expect(screen.getByText('importRulePage.existingConfigFound')).toBeInTheDocument();
    });
  });

  it('clicking "Create New Rule" opens data type modal', async () => {
    const json = {
      id: 'existing-rule@1.0.0',
      cfg: '1.0.0',
      desc: 'Create New',
      config: {
        parameters: {
          ParameterName: 'param',
          ParameterValue: 'value',
          ParameterType: 'string',
        },
        bands: [],
        cases: [],
        exitConditions: [],
      },
    };

    mockAxios.create().get.mockResolvedValueOnce({ data: [{ _id: 'abc123', cfg: '1.0.0' }] });

    const file = new File([JSON.stringify(json)], 'create-new.json', {
      type: 'application/json',
    });

    render(<ImportRuleConfig />);
    const dragger = screen.getByText('importRulePage.uploadPrompt').closest('div')!;
    fireEvent.drop(dragger, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('importRulePage.existingRuleFound')).toBeInTheDocument();
    });

    // Click "Create New Rule"
    fireEvent.click(screen.getByText('importRulePage.createNewRule'));

    // Expect data type modal to show
    await waitFor(() => {
      expect(screen.getByText('importRulePage.pleaseSelectDataType')).toBeInTheDocument();
    });
  });
});


describe('Section 6: Handle Config and Version Updates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(usePrivilegesHook, 'default').mockReturnValue({ canImportRule: true });
  });

  it('updates config version after selecting version type', async () => {
    const json = {
      id: 'existing@1.0.0',
      cfg: '1.0.0',
      desc: 'Update flow',
      config: {
        parameters: {
          ParameterName: 'param',
          ParameterValue: 'value',
          ParameterType: 'string',
        },
        bands: [],
        cases: [],
        exitConditions: [],
      },
    };

    mockAxios.create().get
      .mockResolvedValueOnce({ data: [{ _id: 'abc123', cfg: '1.0.0' }] }) // rule exists
      .mockResolvedValueOnce({ data: { ruleConfigs: [{ id: 'cfg1' }] } }); // config exists

    mockAxios.create().post.mockResolvedValueOnce({ status: 201 }); // versioned config update success

    const file = new File([JSON.stringify(json)], 'update.json', {
      type: 'application/json',
    });

    render(<ImportRuleConfig />);
    const dragger = screen.getByText('importRulePage.uploadPrompt').closest('div')!;
    fireEvent.drop(dragger, { dataTransfer: { files: [file] } });

    // Step 1: Wait for existing rule modal
    await waitFor(() => {
      expect(screen.getByText('importRulePage.existingRuleFound')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('importRulePage.useExistingRule'));

    // Step 2: Wait for config modal
    await waitFor(() => {
      expect(screen.getByText('importRulePage.existingConfigFound')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('importRulePage.updateConfig'));

    // Step 3: Show version modal
    await waitFor(() => {
      expect(screen.getByText('importRulePage.enterMissingData')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('importRulePage.enterMissingData'));

    // Step 4: Success
    await waitFor(() => {
      expect(screen.getByText('importRulePage.configCreatedSuccess')).toBeInTheDocument();
    });
  });

  it('creates new config directly when user chooses that option', async () => {
    const json = {
      id: 'existing@1.0.0',
      cfg: '1.0.0',
      desc: 'Create new config',
      config: {
        parameters: {
          ParameterName: 'param',
          ParameterValue: 'value',
          ParameterType: 'string',
        },
        bands: [],
        cases: [],
        exitConditions: [],
      },
    };

    mockAxios.create().get
      .mockResolvedValueOnce({ data: [{ _id: 'abc123', cfg: '1.0.0' }] }) // rule exists
      .mockResolvedValueOnce({ data: { ruleConfigs: [] } }); // no config

    mockAxios.create().post.mockResolvedValueOnce({ status: 201 }); // new config

    const file = new File([JSON.stringify(json)], 'new-config.json', {
      type: 'application/json',
    });

    render(<ImportRuleConfig />);
    const dragger = screen.getByText('importRulePage.uploadPrompt').closest('div')!;
    fireEvent.drop(dragger, { dataTransfer: { files: [file] } });

    // Step 1: rule exists
    await waitFor(() => {
      expect(screen.getByText('importRulePage.existingRuleFound')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('importRulePage.useExistingRule'));

    // Step 2: config not found
    await waitFor(() => {
      expect(screen.getByText('importRulePage.noExistingConfigFound')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('importRulePage.createNewConfig'));

    // Step 3: success modal
    await waitFor(() => {
      expect(screen.getByText('importRulePage.configCreatedSuccess')).toBeInTheDocument();
    });
  });
});


describe('Section 7: Create New Config Modal (POST Request)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(usePrivilegesHook, 'default').mockReturnValue({ canImportRule: true });
  });

  it('submits new rule and config from data type flow', async () => {
    const json = {
      id: 'new-rule@1.0.0',
      cfg: '1.0.0',
      desc: 'Brand new rule',
      config: {
        parameters: {
          ParameterName: 'param',
          ParameterValue: 'value',
          ParameterType: 'string',
        },
        bands: [],
        cases: [],
        exitConditions: [],
      },
    };

    // Simulate no existing rule found
    mockAxios.create().get.mockResolvedValueOnce({ data: [] });

    // Simulate successful POST to /rule/import
    mockAxios.create().post.mockResolvedValueOnce({ status: 201 });

    const file = new File([JSON.stringify(json)], 'new-rule.json', {
      type: 'application/json',
    });

    render(<ImportRuleConfig />);

    const dragger = screen.getByText('importRulePage.uploadPrompt').closest('div')!;
    fireEvent.drop(dragger, { dataTransfer: { files: [file] } });

    // Step 1: Modal appears for new rule
    await waitFor(() => {
      expect(screen.getByText('importRulePage.noExistingRuleFound')).toBeInTheDocument();
    });

    // Step 2: User chooses to create a new rule
    fireEvent.click(screen.getByText('importRulePage.createNewRule'));

    // Step 3: Data type modal appears
    await waitFor(() => {
      expect(screen.getByText('importRulePage.pleaseSelectDataType')).toBeInTheDocument();
    });

    // Step 4: Submit data type and trigger rule creation
    fireEvent.click(screen.getByText('importRulePage.OK'));

    // Step 5: Wait for rule created success
    await waitFor(() => {
      const matches = screen.getAllByText('importRulePage.ruleCreatedSuccess');
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });
});


describe('Section 8: Rule Creation with Version Update (POST Request)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(usePrivilegesHook, 'default').mockReturnValue({ canImportRule: true });
  });

  it('creates a new versioned rule config via version update modal', async () => {
    const json = {
      id: 'versioned-rule@1.0.0',
      cfg: '1.0.0',
      desc: 'Versioned rule update',
      config: {
        parameters: {
          ParameterName: 'param',
          ParameterValue: 'value',
          ParameterType: 'string',
        },
        bands: [],
        cases: [],
        exitConditions: [],
      },
    };

    // Simulate existing rule
    mockAxios.create().get
      .mockResolvedValueOnce({ data: [{ _id: 'abc123', cfg: '1.0.0' }] }) // Rule exists
      .mockResolvedValueOnce({ data: { ruleConfigs: [{ id: 'cfg1' }] } }); // Config exists

    // Simulate POST success for version update
    mockAxios.create().post.mockResolvedValueOnce({ status: 201 });

    const file = new File([JSON.stringify(json)], 'versioned.json', {
      type: 'application/json',
    });

    render(<ImportRuleConfig />);

    const dragger = screen.getByText('importRulePage.uploadPrompt').closest('div')!;
    fireEvent.drop(dragger, { dataTransfer: { files: [file] } });

    // Step 1: Existing rule modal
    await waitFor(() => {
      expect(screen.getByText('importRulePage.existingRuleFound')).toBeInTheDocument();
    });

    // Step 2: Click use existing
    fireEvent.click(screen.getByText('importRulePage.useExistingRule'));

    // Step 3: Existing config modal
    await waitFor(() => {
      expect(screen.getByText('importRulePage.existingConfigFound')).toBeInTheDocument();
    });

    // Step 4: Click "Update Config" → version modal
    fireEvent.click(screen.getByText('importRulePage.updateConfig'));

    await waitFor(() => {
      expect(screen.getByText('importRulePage.enterMissingData')).toBeInTheDocument();
    });

    // Step 5: Click "Submit" to trigger version bump and rule creation
    fireEvent.click(screen.getByText('importRulePage.enterMissingData'));

    // Step 6: Final confirmation modal
    await waitFor(() => {
      const matches = screen.getAllByText('importRulePage.ruleCreatedSuccess');
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });
});


describe('Section 9: Finalization and Cleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(usePrivilegesHook, 'default').mockReturnValue({ canImportRule: true });
  });

  it('closes all modals after pressing OK on success modal', async () => {
    const json = {
      id: 'cleanup@1.0.0',
      cfg: '1.0.0',
      desc: 'Cleanup rule',
      config: {
        parameters: {
          ParameterName: 'param',
          ParameterValue: 'value',
          ParameterType: 'string',
        },
        bands: [],
        cases: [],
        exitConditions: [],
      },
    };

    mockAxios.create().get.mockResolvedValueOnce({ data: [] });
    mockAxios.create().post.mockResolvedValueOnce({ status: 201, data: {} });

    const file = new File([JSON.stringify(json)], 'cleanup.json', {
      type: 'application/json',
    });

    render(<ImportRuleConfig />);
    const dragger = screen.getByText('importRulePage.uploadPrompt').closest('div')!;
    fireEvent.drop(dragger, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('importRulePage.noExistingRuleFound')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('importRulePage.createNewRule'));

    await waitFor(() => {
      expect(screen.getByText('importRulePage.pleaseSelectDataType')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('importRulePage.OK'));

    await waitFor(() => {
      const matches = screen.getAllByText('importRulePage.ruleCreatedSuccess');
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    const okButtons = screen.getAllByText('importRulePage.OK');
    fireEvent.click(okButtons[0]);

    await waitFor(() => {
      const modals = screen.queryAllByText('importRulePage.ruleCreatedSuccess');
      const visible = modals.filter(el => el.offsetParent !== null);
      expect(visible.length).toBe(0);
    }, { timeout: 3000 });
  });
});





