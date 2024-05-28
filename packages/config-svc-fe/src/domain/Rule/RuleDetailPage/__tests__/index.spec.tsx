import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Rule from '../index';
import '../../../../../setup';

jest.mock('~/context/auth', () => ({
    useAuth: jest.fn(() => ({ profile: {privileges: []} })),
}));

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

const usePrivileges = jest.spyOn(require('~/hooks/usePrivileges'), 'default');
const getRules = jest.spyOn(require('../service'), 'getRules');

jest.mock('~/components/common/AccessDenied', () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="access-denied" />),
}));

describe('Rule component', () => {
    beforeEach(() => {
        getRules.mockResolvedValue({ data: { rules: [], count: 0 } });
    });

    test('renders component with RuleView when user has permission', async () => {
        usePrivileges.mockReturnValue({ canViewRules: true });
        render(<Rule />);

        // Check if RuleView is rendered
        await waitFor(() => {
            expect(screen.queryByTestId('access-denied')).not.toBeInTheDocument();
            expect(screen.getByTestId('rule-view')).toBeInTheDocument();
        });
    });

    test('renders AccessDeniedPage when user does not have permission', () => {
        usePrivileges.mockReturnValue({ canViewRules: false });
        render(<Rule />);

        // Check if AccessDeniedPage is rendered
        expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    });

    test('fetches rules on mount', async () => {
        render(<Rule />);

        // Check if getRules function is called
        await waitFor(() => {
            expect(getRules).toHaveBeenCalled();
        });
    });

    test('retry fetches rules with specified page number', async () => {
        getRules.mockRejectedValueOnce({ data: { message: 'Error'} });
        usePrivileges.mockReturnValue({ canViewRules: true });


        render(<Rule />);

        // Simulate retry action
        waitFor(() => {
            fireEvent.click(screen.getByTestId('retry-button'));
        });

        // Check if getRules function is called with correct page number
        await waitFor(() => {
            expect(getRules).toHaveBeenCalledWith({ page: 1, limit: 10 });
        });
    });

    // Add more tests as needed for other interactions and edge cases
});
