// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateRulePage from '../index';
import { useCommonTranslations } from '~/hooks';




jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  return {
    ...actualAxios,
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    })),
  };
});



jest.mock('~/hooks', () => ({
  useCommonTranslations: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'createRulePage.errors.nameRequired': 'Name is required',
        'createRulePage.errors.descriptionRequired': 'Description is required',
        'createRulePage.name': 'Rule Name',
        'createRulePage.description': 'Description',
        'createRulePage.submit': 'Submit',
        'createRulePage.exit': 'Exit',
      };
      return translations[key] || key;
    },
  }),
}));

// Fix for Ant Design's use of matchMedia in tests
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


describe('EDGE-001: CreateRulePage', () => {
  // it('should show validation error when rule name is empty', async () => {
  //   render(
  //     <CreateRulePage
  //       open={true}
  //       setOpen={jest.fn()}
  //       afterCreate={jest.fn()}
  //     />
  //   );

  //   // Fill in description field to isolate 'name' field validation
  //   const descriptionInput = screen.getByPlaceholderText('Description');
  //   fireEvent.change(descriptionInput, { target: { value: 'Sample Description' } });

  //   // Submit the form without filling name
  //   const submitButton = screen.getByRole('button', { name: 'Submit' });
  //   fireEvent.click(submitButton);

  //   // Wait for validation error to appear
  //   await waitFor(() => {
  //     expect(screen.getByText('Name is required')).toBeInTheDocument();
  //   });
  // });
  it(
    'should show validation error when rule name is empty',
    async () => {
      render(
        <CreateRulePage
          open={true}
          setOpen={jest.fn()}
          afterCreate={jest.fn()}
        />
      );

      const descriptionInput = screen.getByPlaceholderText('Description');
      fireEvent.change(descriptionInput, { target: { value: 'Sample Description' } });

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    },
    20000 // 10s timeout
  );

});
