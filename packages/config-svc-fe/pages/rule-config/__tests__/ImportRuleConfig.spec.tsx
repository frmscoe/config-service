// ImportRuleConfig.spec.tsx
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import ImportRuleConfig from '../import';

// Mock axios.create to avoid crashing on import
jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  const mockInstance = {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
  return {
    __esModule: true,
    ...actualAxios,
    create: jest.fn(() => mockInstance),
    default: {
      ...mockInstance,
      create: jest.fn(() => mockInstance),
    },
  };
});

jest.mock('~/hooks/usePrivileges', () => () => ({ canImportRule: true }));

jest.mock('~/hooks', () => ({
  ...jest.requireActual('~/hooks'),
  useCommonTranslations: () => ({
    t: (key: string) => key,
  }),
}));

// EDGE-003 for Import Rule Config
describe('EDGE-003 - ImportRuleConfig - Invalid JSON upload', () => {
  it('should show error modal when uploading malformed JSON', async () => {
    const { container } = render(<ImportRuleConfig />);

    const file = new File(['{invalidJson:'], 'broken.json', {
      type: 'application/json',
    });

    const input = container.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for the error message
    await waitFor(() =>
      expect(screen.getByText('importRulePage.errorParsingJson')).toBeInTheDocument()
    );

    // Updated line to fix the visibility issue
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
