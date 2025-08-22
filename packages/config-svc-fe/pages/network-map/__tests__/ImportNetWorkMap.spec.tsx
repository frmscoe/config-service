import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import ImportNetWorkMap from '../import'; // Adjust path if needed

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
        'importNetworkMapPage.errorParsingJson': 'Error parsing JSON',
        'importNetworkMapPage.importErrorTitle': 'Import Error',
        'importNetworkMapPage.uploadPrompt': 'Click or drag file to this area to upload',
        'importNetworkMapPage.ImportRuleConfigTitle': 'Import Network Map',
        'importNetworkMapPage.OK': 'OK',
        'importNetworkMapPage.uploadHint': 'Upload a JSON file',
      };
      return translations[key] || key;
    },
  }),
}));

describe('EDGE-003 - ImportNetWorkMap - Invalid JSON upload', () => {
  it('should show error modal when uploading malformed JSON', async () => {
    const { container } = render(<ImportNetWorkMap />);

    const malformedFile = new File(['{invalidJson:'], 'broken.json', {
      type: 'application/json',
    });

    const input = container.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [malformedFile] } });

    await waitFor(() => {
      expect(screen.getByText('Import Error')).toBeInTheDocument();
      expect(screen.getByText('Error parsing JSON')).toBeInTheDocument();
    });

    expect(screen.getByRole('dialog')).toHaveTextContent('Error parsing JSON');
  });
});
