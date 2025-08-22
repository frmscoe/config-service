import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import ImportTypology from '../import';

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
    t: (key: string) => {
      const translations: Record<string, string> = {
        'importTypologyPage.errorParsingJson': 'Error parsing JSON',
        'importTypologyPage.ImportRuleConfigTitle': 'Import Typology',
        'importTypologyPage.uploadPrompt': 'Click or drag file to this area to upload',
        'importTypologyPage.uploadHint': 'Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files',
        'importTypologyPage.OK': 'OK',
      };
      return translations[key] || key;
    },
  }),
}));

// EDGE-003 for Import Typology
describe('EDGE-003 - ImportTypology - Invalid JSON upload', () => {
  it('should show toast error when uploading malformed JSON', async () => {
    const { container } = render(<ImportTypology />);

    const file = new File(['{invalidJson:'], 'broken.json', {
      type: 'application/json',
    });

    const input = container.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const toast = document.querySelector('.ant-message-custom-content');
      expect(toast?.textContent).toContain("Expected property name");
    });
  });
});
