import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Rule from '../index';
import '../../../../../setup';
import * as Auth from '~/context/auth';

const useAuthDefault = {
    isAuthenticated: false,
    token: null,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    setIsLoading: jest.fn(),
    error: ''
}
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

jest.mock('../service', () => ({
    getRules: jest.fn(),
}));

const usePrivileges = jest.spyOn(require('~/hooks/usePrivileges'), 'default');
const getRules = jest.spyOn(require('../service'), 'getRules');
const useAuth = jest.spyOn(Auth, "useAuth");


jest.mock('~/components/common/AccessDenied', () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="access-denied" />),
}));
useAuth.mockReturnValue({
    ...useAuthDefault,
    profile: {
        clientId: null,
        username: '',
        platformRoleIds: [],
        privileges: ['SECURITY_UPDATE_RULE']
    },
});
describe('Rule component', () => {
 

    test('renders component with RuleView when user has permission', async () => {
        getRules.mockResolvedValue({ data: { rules: [], count: 0 } });

        usePrivileges.mockReturnValue({ canViewRules: true });
        render(<Rule />);

        // Check if RuleView is rendered
        await waitFor(() => {
            expect(screen.queryByTestId('access-denied')).not.toBeInTheDocument();
            expect(screen.getByTestId('rule-view')).toBeInTheDocument();
        });
    });

    test('renders AccessDeniedPage when user does not have permission', () => {
        getRules.mockResolvedValue({ data: { rules: [], count: 0 } });

        usePrivileges.mockReturnValue({ canViewRules: false });
        render(<Rule />);

        // Check if AccessDeniedPage is rendered
        expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    });

    test('fetches rules on mount', async () => {
        getRules.mockResolvedValue({ data: { rules: [], count: 0 } });

        render(<Rule />);

        // Check if getRules function is called
        await waitFor(() => {
            expect(getRules).toHaveBeenCalled();
        });
    });

});
