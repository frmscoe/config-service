import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateEditTopologyPage from '../index';
import * as configService from '~/domain/Rule/RuleConfig/RuleConfigList/service';
import '../../../../../setup';
import * as service from '~/domain/Typology/Score/service';
// Mock the hooks and services
jest.mock('~/hooks/usePrivileges');
jest.mock('~/domain/Rule/RuleConfig/RuleConfigList/service');
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
class ResizeObserver {
    constructor() { }
    observe() { }
    unobserve() { }
    disconnect() { }
}
jest.mock('next/navigation', () => ({
    useParams: jest.fn(() => ({ id: undefined })),
}));

// Assign the mock to the global window object
global.ResizeObserver = ResizeObserver;
const usePrivileges = jest.spyOn(require('~/hooks/usePrivileges'), 'default');

// const mockUsePrivileges = usePrivileges as jest.MockedFunction<typeof usePrivileges>;
const mockGetRulesWithConfigs = jest.spyOn(configService, 'getRulesWithConfigs');

describe('CreateEditTopologyPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders access denied page if user lacks privileges', async() => {
        usePrivileges.mockReturnValue({
            canCreateTypology: false,
            canViewRuleWithConfigs: false,
            canCreateRuleConfig: false,
            canEditRule: false,
            canReviewRule: false,
            canEditConfig: false,
            canReviewConfig: false,
            privileges: [],
            canViewRules: false,
            canViewRuleConfigs: false,
            canViewTypologyList: false,
            canEditTypology: false,
            canReviewTypology: false
        });
        jest.spyOn(service,'getTypology').mockResolvedValueOnce({data: null} as any);
        const result = render(<CreateEditTopologyPage />);
        expect(screen.queryByText('Rules')).not.toBeInTheDocument();
        expect(result.queryByText('Recently removed')).not.toBeInTheDocument();

    });

    it('fetches rules with configurations on mount if user has privileges', async () => {
        usePrivileges.mockReturnValue({
            canCreateTypology: true,
            canViewRuleWithConfigs: true,
            canCreateRuleConfig: false,
            canEditRule: false,
            canReviewRule: false,
            canEditConfig: false,
            canReviewConfig: false,
            privileges: [],
            canViewRules: false,
            canViewRuleConfigs: false,
            canViewTypologyList: false,
            canEditTypology: false,
            canReviewTypology: false
        });

        mockGetRulesWithConfigs.mockResolvedValue({
            data: {
                rules: [{ _key: '1', name: 'Rule 1' }],
            },
            status: 200,
            statusText: 'ok',
            headers: {},
            config: {} as any
        });

        render(<CreateEditTopologyPage />);

        await waitFor(() => expect(mockGetRulesWithConfigs).toHaveBeenCalledTimes(1));
        expect(screen.getAllByText('Rules').length).toBeDefined();
        expect(screen.getByText('Recently removed')).toBeInTheDocument();

    });

    it('handles onDrop for rule correctly ', async () => {
        usePrivileges.mockReturnValue({
            canCreateTypology: true,
            canViewRuleWithConfigs: true,
            canCreateRuleConfig: false,
            canEditRule: false,
            canReviewRule: false,
            canEditConfig: false,
            canReviewConfig: false,
            privileges: [],
            canViewRules: false,
            canViewRuleConfigs: false,
            canViewTypologyList: false,
            canEditTypology: false,
            canReviewTypology: false
        });

        mockGetRulesWithConfigs.mockResolvedValue({
            data: {
                rules: [{ _key: '1', name: 'Rule 1' }, { _key: 2, name: 'Rule 2' }],
            },
            status: 200,
            statusText: 'ok',
            headers: {},
            config: {} as any
        });

        render(<CreateEditTopologyPage />);

        await waitFor(() => expect(mockGetRulesWithConfigs).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getAllByTestId('rule-drag-item').length).toBe(2));
        const ruleNode = screen.getAllByTestId('rule-drag-item')[0];
        expect(screen.getAllByTestId('rule-drag-item').length).toBe(2);
        const flow = document.querySelector('.react-flow') as Element;
        const dataTransfer = {
            setData: jest.fn(),
            getData: jest.fn().mockImplementation((arg) => {
                if (arg === 'type') {
                    return 'rule'
                }
                return JSON.stringify({ _key: '1', name: 'Rule 1' })
            }),
        };

        const preventDefault = jest.fn();
        fireEvent.dragStart(ruleNode, { dataTransfer });
        fireEvent.drop(flow, {
            dataTransfer,
            preventDefault,
        });
        expect(dataTransfer.setData).toHaveBeenCalledWith('application/reactflow', 'node');
        expect(dataTransfer.setData).toHaveBeenCalledWith('type', 'rule');
        expect(dataTransfer.setData).toHaveBeenCalledWith('data', JSON.stringify({ _key: '1', name: 'Rule 1' }));
        //rule removed from the list
        await waitFor(() => expect(screen.getAllByTestId('rule-drag-item').length).toBe(1));

    });

    it('handles delete rule correctly', async () => {
        usePrivileges.mockReturnValue({
            canCreateTypology: true,
            canViewRuleWithConfigs: true,
            canCreateRuleConfig: false,
            canEditRule: false,
            canReviewRule: false,
            canEditConfig: false,
            canReviewConfig: false,
            privileges: [],
            canViewRules: false,
            canViewRuleConfigs: false,
            canViewTypologyList: false,
            canEditTypology: false,
            canReviewTypology: false
        });

        mockGetRulesWithConfigs.mockResolvedValue({
            data: {
                rules: [{ _key: '3', name: 'Rule 1' }, { _key: '4', name: 'Rule 2' }],
            },
            status: 200,
            statusText: 'ok',
            headers: {},
            config: {} as any
        });

        render(<CreateEditTopologyPage />);

        await waitFor(() => expect(mockGetRulesWithConfigs).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getAllByTestId('rule-drag-item').length).toBe(2));
        const ruleNode = screen.getAllByTestId('rule-drag-item')[0];
        const flow = document.querySelector('.react-flow') as Element;
        const dataTransfer = {
            setData: jest.fn(),
            getData: jest.fn().mockImplementation((arg) => {
                if (arg === 'type') {
                    return 'rule'
                }
                return JSON.stringify({ _key: '3', name: 'Rule 1' })
            }),
        };

        const preventDefault = jest.fn();
        //before rule added canvas for react flow rules are 2
        expect(screen.getAllByTestId('rule-drag-item').length).toBe(2);
        fireEvent.dragStart(ruleNode, { dataTransfer });
        fireEvent.drop(flow, {
            dataTransfer,
            preventDefault,
        });
        //after rule added to canvas rules become 1
        await waitFor(() => expect(screen.getAllByTestId('rule-drag-item').length).toBe(1));

        await waitFor(() => expect(screen.getAllByTestId('node')[0]).toBeInTheDocument());
        fireEvent.click(screen.getAllByTestId('remove-node')[0]);
        //rule delete from canvas rules become 2 again
        await waitFor(() => expect(screen.getAllByTestId('rule-drag-item').length).toBe(2));
    });

    it('handles onDrop for config correctly ', async () => {
        usePrivileges.mockReturnValue({
            canCreateTypology: true,
            canViewRuleWithConfigs: true,
            canCreateRuleConfig: false,
            canEditRule: false,
            canReviewRule: false,
            canEditConfig: false,
            canReviewConfig: false,
            privileges: [],
            canViewRules: false,
            canViewRuleConfigs: false,
            canViewTypologyList: false,
            canEditTypology: false,
            canReviewTypology: false
        });

        mockGetRulesWithConfigs.mockResolvedValue({
            data: {
                rules: [
                    {
                        _key: '2',
                        name: 'Rule 1',
                        ruleConfigs: [
                            { _key: '3', cfg: '003', ruleId: '2' },
                            { _key: '4', cfg: '004', ruleId: '2' }
                        ]
                    },
                    { _key: 2, name: 'Rule 2' }
                ],
            },
            status: 200,
            statusText: 'ok',
            headers: {},
            config: {} as any
        });

        render(<CreateEditTopologyPage />);

        await waitFor(() => expect(mockGetRulesWithConfigs).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getAllByTestId('rule-drag-item').length).toBe(2));
        const ruleNode = screen.getAllByTestId('rule-drag-item')[0];
        fireEvent.click(ruleNode);
        //shows configurations on click rule in list
        await waitFor(() => expect(screen.getAllByTestId('rule-config').length).toBe(2));
        const flow = document.querySelector('.react-flow') as Element;
        const dataTransfer = {
            setData: jest.fn(),
            getData: jest.fn().mockImplementation((arg) => {
                if (arg === 'type') {
                    return 'config'
                }
                return JSON.stringify({ _key: '3', cfg: '003', ruleId: '2' },)
            }),
        };

        const preventDefault = jest.fn();
        fireEvent.dragStart(screen.getAllByTestId('rule-config')[0], { dataTransfer });
        fireEvent.drop(flow, {
            dataTransfer,
            preventDefault,
        });
        expect(dataTransfer.setData).toHaveBeenCalledWith('type', 'config');
        // //configuration removed from the list after dropped on canvas
        await waitFor(() => expect(screen.getAllByTestId('rule-config').length).toBe(1));
        //rule removed from list of rules 
        await waitFor(() => expect(screen.getAllByTestId('rule-drag-item').length).toBe(1));

    });

    it('handles delete config node correctly ', async () => {
        usePrivileges.mockReturnValue({
            canCreateTypology: true,
            canViewRuleWithConfigs: true,
            canCreateRuleConfig: false,
            canEditRule: false,
            canReviewRule: false,
            canEditConfig: false,
            canReviewConfig: false,
            privileges: [],
            canViewRules: false,
            canViewRuleConfigs: false,
            canViewTypologyList: false,
            canEditTypology: false,
            canReviewTypology: false
        });

        mockGetRulesWithConfigs.mockResolvedValue({
            data: {
                rules: [
                    {
                        _key: '2',
                        name: 'Rule 1',
                        ruleConfigs: [
                            { _key: '3', cfg: '003', ruleId: '2' },
                            { _key: '4', cfg: '004', ruleId: '2' }
                        ]
                    },
                    { _key: 2, name: 'Rule 2' }
                ],
            },
            status: 200,
            statusText: 'ok',
            headers: {},
            config: {} as any
        });

        render(<CreateEditTopologyPage />);

        await waitFor(() => expect(mockGetRulesWithConfigs).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getAllByTestId('rule-drag-item').length).toBe(2));
        const ruleNode = screen.getAllByTestId('rule-drag-item')[0];
        fireEvent.click(ruleNode);
        //shows configurations on click rule in list
        await waitFor(() => expect(screen.getAllByTestId('rule-config').length).toBe(2));
        const flow = document.querySelector('.react-flow') as Element;
        const dataTransfer = {
            setData: jest.fn(),
            getData: jest.fn().mockImplementation((arg) => {
                if (arg === 'type') {
                    return 'config'
                }
                return JSON.stringify({ _key: '3', cfg: '003', ruleId: '2' },)
            }),
        };

        const preventDefault = jest.fn();
        fireEvent.dragStart(screen.getAllByTestId('rule-config')[0], { dataTransfer });
        fireEvent.drop(flow, {
            dataTransfer,
            preventDefault,
        });
        expect(dataTransfer.setData).toHaveBeenCalledWith('type', 'config');
        // //configuration removed from the list after dropped on canvas
        await waitFor(() => expect(screen.getAllByTestId('rule-config').length).toBe(1));
        //rule removed from list of rules 
        await waitFor(() => expect(screen.getAllByTestId('rule-drag-item').length).toBe(1));
        await waitFor(() => expect(screen.getAllByTestId('node').length).toBe(3));
        fireEvent.click(screen.getAllByTestId('remove-node')[1]);
        // using index 1 because we added a rule with its configuration and configuration will be index 1 

        fireEvent.click(screen.getAllByTestId('show-recently-removed')[0]); //show removed items list
    
        // config added to deleted list
        await waitFor(() => expect(screen.getAllByTestId('rule-config-deleted').length).toBe(1));


    });

    it('handles delete rule  node and removes all configurations associated ', async () => {
        usePrivileges.mockReturnValue({
            canCreateTypology: true,
            canViewRuleWithConfigs: true,
            canCreateRuleConfig: false,
            canEditRule: false,
            canReviewRule: false,
            canEditConfig: false,
            canReviewConfig: false,
            privileges: [],
            canViewRules: false,
            canViewRuleConfigs: false,
            canViewTypologyList: false,
            canEditTypology: false,
            canReviewTypology: false
        });

        mockGetRulesWithConfigs.mockResolvedValue({
            data: {
                rules: [
                    {
                        _key: '2',
                        name: 'Rule 1',
                        ruleConfigs: [
                            { _key: '3', cfg: '003', ruleId: '2' },
                            { _key: '4', cfg: '004', ruleId: '2' }
                        ]
                    },
                    { _key: 2, name: 'Rule 2' }
                ],
            },
            status: 200,
            statusText: 'ok',
            headers: {},
            config: {} as any
        });

        render(<CreateEditTopologyPage />);

        await waitFor(() => expect(mockGetRulesWithConfigs).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getAllByTestId('rule-drag-item').length).toBe(2));
        const ruleNode = screen.getAllByTestId('rule-drag-item')[0];
        fireEvent.click(ruleNode);
        //shows configurations on click rule in list
        await waitFor(() => expect(screen.getAllByTestId('rule-config').length).toBe(2));
        const flow = document.querySelector('.react-flow') as Element;
        const dataTransfer = {
            setData: jest.fn(),
            getData: jest.fn().mockImplementation((arg) => {
                if (arg === 'type') {
                    return 'config'
                }
                return JSON.stringify({ _key: '3', cfg: '003', ruleId: '2' },)
            }),
        };

        const preventDefault = jest.fn();
        fireEvent.dragStart(screen.getAllByTestId('rule-config')[0], { dataTransfer });
        fireEvent.drop(flow, {
            dataTransfer,
            preventDefault,
        });
        expect(dataTransfer.setData).toHaveBeenCalledWith('type', 'config');
        // //configuration removed from the list after dropped on canvas
        // await waitFor(() => expect(screen.getAllByTestId('rule-config').length).toBe(1));
        //rule removed from list of rules 
        await waitFor(() => expect(screen.getAllByTestId('rule-drag-item').length).toBe(1));

        fireEvent.click(screen.getAllByTestId('remove-node')[0]);
        // using index 0 because we added a rule with its configuration. SO rule its at index 0

        fireEvent.click(screen.getAllByTestId('show-recently-removed')[0]); //show removed items list
    
        // config and rule added to deleted list
        await waitFor(() => expect(screen.getAllByTestId('rule-config-deleted').length).toBe(2));

    });
});
