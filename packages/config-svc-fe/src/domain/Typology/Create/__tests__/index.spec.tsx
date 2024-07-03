import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateEditTopologyPage from '../index';
import * as configService from '~/domain/Rule/RuleConfig/RuleConfigList/service';
import '../../../../../setup';
import * as service from '~/domain/Typology/Score/service';
import * as createService from '../service';
import { useParams } from 'next/navigation';
import { Router } from 'next/router';


let routeChangeComplete: () => void;
Router.events.on = jest.fn((event, callback) => {
    routeChangeComplete = callback;
});

const mockData = {
    "_id": "typology/5a3d7cbf-02e8-458b-b66c-a2ccb1f1fcb7",
    "_key": "5a3d7cbf-02e8-458b-b66c-a2ccb1f1fcb7",
    "_rev": "_h9G87jy---",
    "cfg": "0.1.0",
    "createdAt": "2024-06-07T10:27:10.009Z",
    "desc": "aada",
    "name": "Typology 1",
    "ownerId": "test@gmail.com",
    "rules_rule_configs": [
        {
            "ruleId": "rule/32b24092-ede5-4892-9780-19c08b2badbe",
            "ruleConfigId": [
                "rule_config/4c07cfe2-4a87-4bfc-a056-c69170c2668a"
            ]
        },
        {
            "ruleId": "rule/5e88f0bd-65d1-48f4-b697-de0501c84d4a",
            "ruleConfigId": [
                "rule_config/78f59326-5fa2-44ab-a23a-aeb0945413bf"
            ]
        }
    ],
    "state": "01_DRAFT",
    "typologyCategoryUUID": [],
    "updatedAt": "2024-06-07T10:27:10.009Z",
    "ruleWithConfigs": [
        {
            "rule": {
                "_id": "rule/32b24092-ede5-4892-9780-19c08b2badbe",
                "_key": "32b24092-ede5-4892-9780-19c08b2badbe",
                "name": "rule-001",
                "cfg": "1.0.0"
            },
            "ruleConfigs": [
                {
                    "_id": "rule_config/4c07cfe2-4a87-4bfc-a056-c69170c2668a",
                    "_key": "4c07cfe2-4a87-4bfc-a056-c69170c2668a",
                    "cfg": "2.1.1",
                    "ruleId": "32b24092-ede5-4892-9780-19c08b2badbe",
                    "config": {
                        "exitConditions": [
                            {
                                "reason": "Unsuccessful transaction",
                                "subRuleRef": ".x00",
                                "outcome": true
                            },
                            {
                                "reason": "Insufficient transaction history. At least 50 historical transactions are required",
                                "subRuleRef": ".x01",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions shows an increase",
                                "subRuleRef": ".x03",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "bands": [],
                        "cases": [],
                        "parameters": [
                            {
                                "ParameterType": "number",
                                "ParameterName": "aa"
                            }
                        ]
                    }
                }
            ]
        },
        {
            "rule": {
                "_id": "rule/5e88f0bd-65d1-48f4-b697-de0501c84d4a",
                "_key": "5e88f0bd-65d1-48f4-b697-de0501c84d4a",
                "name": "rule-002",
                "cfg": "1.0.0"
            },
            "ruleConfigs": [
                {
                    "_id": "rule_config/78f59326-5fa2-44ab-a23a-aeb0945413bf",
                    "_key": "78f59326-5fa2-44ab-a23a-aeb0945413bf",
                    "cfg": "2.1.1",
                    "ruleId": "5e88f0bd-65d1-48f4-b697-de0501c84d4a",
                    "config": {
                        "exitConditions": [
                            {
                                "reason": "Unsuccessful transaction",
                                "subRuleRef": ".x00",
                                "outcome": true
                            },
                            {
                                "reason": "Insufficient transaction history. At least 50 historical transactions are required",
                                "subRuleRef": ".x01",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions shows an increase",
                                "subRuleRef": ".x03",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "bands": [
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "cases": [
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "parameters": [
                            {
                                "ParameterType": "number",
                                "ParameterName": "1"
                            }
                        ]
                    }
                }
            ]
        }
    ]
}
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
jest.mock('next/navigation');
jest.mock('next/router', () => ({
    useRouter() {
      return ({
        route: '/',
        pathname: '',
        query: '',
        asPath: '',
        push: jest.fn(),
        events: {
          on: jest.fn(),
          off: jest.fn()
        },
        beforePopState: jest.fn(() => null),
        prefetch: jest.fn(() => null)
      });
    },
    Router: {
        events: {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
        }
    }

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

    it('renders access denied page if user lacks privileges', async () => {
        (useParams as jest.Mock).mockReturnValue({ id: undefined });
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
        const spy = jest.spyOn(service, 'getTypology').mockResolvedValueOnce({ data: null } as any);
        const result = render(<CreateEditTopologyPage />);
        expect(screen.queryByText('Rules')).not.toBeInTheDocument();
        expect(result.queryByText('Recently removed')).not.toBeInTheDocument();
        spy.mockClear();

    });

    it('renders access denied page if user lacks privileges and is edit mode', async () => {
        (useParams as jest.Mock).mockReturnValue({ id: '1234' });
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
        const spy = jest.spyOn(service, 'getTypology').mockResolvedValueOnce({
            data: {}
        } as any);
        const result = render(<CreateEditTopologyPage />);
        expect(useParams).toHaveReturnedWith({ id: '1234' });
        expect(screen.queryByText('Rules')).not.toBeInTheDocument();
        expect(result.queryByText('Recently removed')).not.toBeInTheDocument();
        (useParams as jest.Mock).mockClear();
        (useParams as jest.Mock).mockReset();
        spy.mockClear();
        spy.mockReset();
    });

    it('triggers set edit data when in edit mode', async () => {
        (useParams as jest.Mock).mockReturnValue({ id: '1234' });
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
            canEditTypology: true,
            canReviewTypology: false,
        });
        const spy = jest.spyOn(service, 'getTypology').mockResolvedValueOnce({ data: mockData } as any);
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
        expect(useParams).toHaveReturnedWith({ id: '1234' });
        await waitFor(() => expect(screen.getAllByText('Rules').length).toBeDefined());
        //expect rules to be added to react flow
        expect(screen.getAllByTestId('node').length).toBe(5); //5 rule and all bands, cases and exit conditions
        spy.mockClear();

    });


    it('triggers calls router push on update success', async () => {
        const push = jest.fn();
        (useParams as jest.Mock).mockReturnValue({ id: 'update-id' });
        const useRouter = jest.spyOn(require("next/router"), "useRouter");
        useRouter.mockImplementation(() => ({
            route: '/',
            pathname: '',
            query: '',
            asPath: '',
            push,
            events: {
              on: jest.fn(),
              off: jest.fn()
            },
            beforePopState: jest.fn(() => null),
            prefetch: jest.fn(() => null)
        }));

        usePrivileges.mockReturnValue({
            canCreateTypology: true,
            canViewRuleWithConfigs: true,
            canCreateRuleConfig: false,
            canEditRule: false,
            canReviewRule: false,
            canEditConfig: false,
            canReviewConfig: false,
            privileges: [],
            canViewRules: true,
            canViewRuleConfigs: false,
            canViewTypologyList: true,
            canEditTypology: true,
            canReviewTypology: true,
        });
        const spy = jest.spyOn(service, 'getTypology').mockResolvedValueOnce({ data: mockData } as any);
        const update = jest.spyOn(createService, 'updateTypology').mockResolvedValueOnce({ data: mockData } as any);

        mockGetRulesWithConfigs.mockResolvedValue({
            data: {
                rules: [{...mockData, _key: '12234'}],
            },
            status: 200,
            statusText: 'ok',
            headers: {},
            config: {} as any
        });
        render(<CreateEditTopologyPage />);
        expect(useParams).toHaveReturnedWith({ id: 'update-id' });
        await waitFor(() => expect(screen.getAllByText('Rules').length).toBeDefined());
        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);
        await waitFor(() => expect(push).toHaveBeenCalled());
        update.mockClear();
        spy.mockClear();
    });

    it('handles navigate away before save and call confirm ', async () => {
        (useParams as jest.Mock).mockReturnValue({ id: undefined });
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
        //simulate navigate away
        const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
        routeChangeComplete();
        expect(confirmSpy).toHaveBeenCalled();

    });

    it('fetches rules with configurations on mount if user has privileges', async () => {
        (useParams as jest.Mock).mockReturnValue({ id: undefined });

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
        (useParams as jest.Mock).mockReturnValue({ id: undefined });
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
        (useParams as jest.Mock).mockReturnValue({ id: undefined });
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
        (useParams as jest.Mock).mockReturnValue({ id: undefined });

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
        (useParams as jest.Mock).mockReturnValue({ id: undefined });

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
        (useParams as jest.Mock).mockReturnValue({ id: undefined });

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
