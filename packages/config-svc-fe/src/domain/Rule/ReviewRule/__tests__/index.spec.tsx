import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ReviewRule from '../index';
import '../../../../../setup';
import { AuthProvider } from '~/context/auth';
import * as service from '../service';
import { IRule } from '../../RuleDetailPage/service';
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

const mockRule: IRule = {
    _key: '1234',
    _id: 'rule/1234',
    _rev: '',
    cfg: '1.2.0',
    state: '01_DRAFT',
    dataType: 'CURRENCY',
    desc: 'Rule description',
    ownerId: '',
    createdAt: new Date().toDateString(),
    updatedAt: new Date().toString(),
    name: 'Rule Name',
    ruleConfigs: []
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
jest.mock('next/navigation', () => ({
    useParams: jest.fn(() => ({ id: '123' })),
    useSearchParams: jest.fn(() => ({ id: '123' })),
}));
jest.mock('~/components/common/AccessDenied', () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="access-denied" />),
}));
const useAuth = jest.spyOn(Auth, "useAuth");
const usePrivileges = jest.spyOn(require('~/hooks/usePrivileges'), 'default');
const getRule = jest.spyOn(service, "getRule");

describe('Review Rule', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })
    it('should render page', () => {
        const result = render(<AuthProvider><ReviewRule /></AuthProvider>);
        expect(result).toBeDefined();
    });

    it('should render access denied page', () => {
        usePrivileges.mockReturnValueOnce({
            canReviewRule: false
        })
        render(<AuthProvider><ReviewRule /></AuthProvider>);
        expect(screen.getByTestId('access-denied')).toBeDefined();
    });

    it('should render error', () => {
        const mock = getRule.mockRejectedValueOnce({
            data: {
                message: 'something went wrong'
            },
            status: 500,
            statusText: 'error',
            headers: {},
            config: { headers: {} as any }
        });
        const userAuthMock = useAuth.mockReturnValueOnce({
            profile: {
                clientId: null,
                username: '',
                platformRoleIds: [],
                privileges: []
            },
            ...useAuthDefault

        })
        usePrivileges.mockReturnValue({
            canReviewRule: true
        })
        render(<AuthProvider><ReviewRule /></AuthProvider>);
        waitFor(() => expect(screen.getByTestId('error')).toBeDefined());
        mock.mockReset();
        userAuthMock.mockClear();
    });


    it('should render data', async() => {
        const configMock = getRule.mockResolvedValueOnce({
            data: {
                ...mockRule
            },
            status: 200,
            statusText: 'ok',
            headers: {},
            config: { headers: {} as any }
        });

        const ruleMock = getRule.mockResolvedValueOnce({
            data: {
                ...mockRule
            },
            status: 200,
            statusText: 'ok',
            headers: {},
            config: { headers: {} as any }
        });

        const userAuthMock = useAuth.mockReturnValue({ 
            profile: {
            clientId: null,
            username: '',
            platformRoleIds: [],
            privileges: []
        },
        ...useAuthDefault });
        usePrivileges.mockReturnValue({
            canReviewRule: true
        });
        render(<AuthProvider><ReviewRule /></AuthProvider>);
       await waitFor(() => expect(screen.getByText(mockRule.desc)).toBeDefined());
       await waitFor(() => expect(screen.getByText(mockRule.name)).toBeDefined());
       await waitFor(() => expect(screen.getByText(mockRule.state)).toBeDefined());
        configMock.mockReset();
        ruleMock.mockReset();
        userAuthMock.mockClear()
    });

    it('should render approve button ', async() => {

        const ruleMock = getRule.mockResolvedValue({
            data: {
                ...mockRule,
                updatedBy: 'test1',
                state: '10_PENDING_REVIEW'
            },
            status: 200,
            statusText: 'ok',
            headers: {},
            config: { headers: {} as any }
        });

        const userAuthMock = useAuth.mockReturnValue({ 
            profile: {
            clientId: null,
            username: 'test',
            platformRoleIds: [],
            privileges: ["SECURITY_APPROVE_RULE"]
        },
        ...useAuthDefault 
        });
        usePrivileges.mockReturnValue({
            canReviewRule: true
        });
        render(<AuthProvider><ReviewRule /></AuthProvider>);
       await waitFor(() => expect(screen.getByText('Approve')).toBeDefined());
        ruleMock.mockReset();
        userAuthMock.mockReset()
    });

    it('should hide approve button if approver is the same as updatedBy ', async() => {
        const ruleMock = getRule.mockResolvedValue({
            data: {
                ...mockRule,
                updatedBy: 'test2',
                state: '10_PENDING_REVIEW'
            },
            status: 200,
            statusText: 'ok',
            headers: {},
            config: { headers: {} as any }
        });

        const userAuthMock = useAuth.mockReturnValue({ 
            profile: {
            clientId: null,
            username: 'test2',
            platformRoleIds: [],
            privileges: ["SECURITY_APPROVE_RULE"]
        },
        ...useAuthDefault 
        });
        usePrivileges.mockReturnValue({
            canReviewRule: true
        });
        render(<AuthProvider><ReviewRule /></AuthProvider>);
       await waitFor(() => expect(screen.queryByText('Approve')).not.toBeInTheDocument());
        ruleMock.mockReset();
        userAuthMock.mockReset()
    });
})