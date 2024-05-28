import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RuleConfig from '../index';
import '../../../../../../setup';

jest.mock('../service', () => ({
  getRulesWithConfigs: jest.fn(),
}));

jest.mock('~/context/auth', () => ({
  useAuth: jest.fn(() => ({ profile: {} })),
}));

const usePrivileges  = jest.spyOn(require('~/hooks/usePrivileges'), 'default');
const getRulesWithConfigs  = jest.spyOn(require('../service'), 'getRulesWithConfigs');

jest.mock('~/components/common/AccessDenied', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="access-denied" />),
}));

describe('RuleConfig component', () => {
  beforeEach(() => {
    getRulesWithConfigs.mockResolvedValue({ data: { rules: [], count: 0 } });
  });

  test('renders component with RuleView when user has permission', async () => {
    usePrivileges.mockReturnValue({ canViewRuleWithConfigs: true });
    render(<RuleConfig />);
    
    // Check if RuleView is rendered
    await waitFor(() => {
      expect(screen.queryByTestId('access-denied')).not.toBeInTheDocument();
      expect(screen.getByTestId('rule-config-view')).toBeInTheDocument();
    });
  });

  test('renders AccessDeniedPage when user does not have permission', () => {
    usePrivileges.mockReturnValue({ canViewRuleWithConfigs: false });
    render(<RuleConfig />);
    
    // Check if AccessDeniedPage is rendered
    expect(screen.getByTestId('access-denied')).toBeInTheDocument();
  });

  test('fetches configurations on mount', async () => {
    render(<RuleConfig />);
    
    // Check if getRulesWithConfigs function is called
    await waitFor(() => {
      expect(getRulesWithConfigs).toHaveBeenCalled();
    });
  });

  test('retry fetches configurations with specified page number', async () => {
    getRulesWithConfigs.mockRejectedValueOnce({ data: { message: 'Error'} });

    usePrivileges.mockReturnValue({ canViewRuleWithConfigs: true });

    render(<RuleConfig />);
    
    // Simulate retry action
    waitFor(async() => {
        fireEvent.click(screen.getByTestId('retry-button'));
    
        // Check if getRulesWithConfigs function is called with correct page number
        await waitFor(() => {
          expect(getRulesWithConfigs).toHaveBeenCalledWith({ page: 1, limit: 10 });
        });
    })
    
  });

});
