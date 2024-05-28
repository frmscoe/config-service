import React from 'react';
import { render, screen } from '@testing-library/react';
import CreateRuleConfigPage from '../index';
import '../../../../../setup';

jest.mock('axios', () => ({
  create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
          request: {
              use: jest.fn(),
              eject: jest.fn(),
          },
          response: {
              use: jest.fn(),
              eject: jest.fn(),
          },
      },
  })),
}));

jest.mock('next/navigation', () => {
  const original = jest.requireActual('next/navigation');
  const useRouter = jest.fn().mockReturnValue({pathname: '', push: jest.fn()});
  const usePathname = jest.fn(() => {
    const router = useRouter();
    return router.pathname;
  });
  const useParams = jest.fn(() => {
      return {}
    });
  const useSearchParams = jest.fn(() => {
    const router = useRouter();
    return new URLSearchParams(router?.query?.toString());
  });
  return {
    ...original,
    useRouter,
    usePathname,
    useSearchParams,
    useParams
  };
});

jest.mock('~/hooks/usePrivileges', () => ({
  __esModule: true,
  default: jest.fn(() => ({ canCreateRuleConfig: true })),
}));

jest.mock('~/components/common/AccessDenied', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="access-denied" />),
}));

jest.mock('../Create', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="create-config" />),
}));

describe('CreateRuleConfigPage component', () => {
  test('renders CreateConfig when user has privilege', () => {
    render(<CreateRuleConfigPage />);
    
    // Check if CreateConfig is rendered
    expect(screen.getByTestId('create-config')).toBeInTheDocument();

    // Check if AccessDeniedPage is not rendered
    expect(screen.queryByTestId('access-denied')).not.toBeInTheDocument();
  });

  test('renders AccessDeniedPage when user does not have privilege', () => {
    // Mock usePrivileges to return false
    jest.spyOn(require('~/hooks/usePrivileges'), 'default').mockReturnValue({ canCreateRuleConfig: false });

    render(<CreateRuleConfigPage />);
    
    // Check if AccessDeniedPage is rendered
    expect(screen.getByTestId('access-denied')).toBeInTheDocument();

    // Check if CreateConfig is not rendered
    expect(screen.queryByTestId('create-config')).not.toBeInTheDocument();
  });
});
