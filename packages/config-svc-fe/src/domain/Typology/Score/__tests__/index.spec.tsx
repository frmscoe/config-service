import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ScorePage from '../index';
import { ReactFlowProvider } from 'reactflow';
import '../../../../../setup';
import * as service from '../service';
import { getRandomNumber } from '~/utils/getRandomNumberHelper';
import { ITypology } from '../service';

class ResizeObserver {
    constructor() { }
    observe() { }
    unobserve() { }
    disconnect() { }
}

// Assign the mock to the global window object
global.ResizeObserver = ResizeObserver;


// Mock the `usePrivileges` hook
const usePrivileges = jest.spyOn(require('~/hooks/usePrivileges'), 'default');


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
    const useRouter = jest.fn().mockReturnValue({ pathname: '', push: jest.fn() });
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
const data: ITypology = {
    "name": "False promotions, phishing, or social engineering scams, such as fraudsters impersonating providers and advising customers they have won a prize in a promotion and to send money to the fraudster's number to claim the prize.",
    "_key": "028@1.0.0",
    "cfg": "1.0.0",
    "_id": getRandomNumber(10000).toString(),
    "ruleWithConfigs": [{
        "rule": {
            "_key": getRandomNumber(10000).toString(),
            "name": "rule-001",
            "_id": getRandomNumber(10000).toString(),
        },
        "ruleConfigs": [{
            "_key": getRandomNumber(10000).toString(),
            "_id": getRandomNumber(10000).toString(),
            "config": {
                parameters: [],
                "bands": [
                    {
                        "reason": "Band Reason 1",
                        "subRuleRef": "0.1",
                        "upperLimit": 11864406779,
                    },
                    {
                        "lowerLimit": 99999999999,
                        "reason": "adad",
                        "subRuleRef": "0.2",
                    }
                ],
                "cases": [
                    {
                        "reason": "Band Reason 2",
                        "subRuleRef": "0.1",
                        "value": 1
                    },
                    {
                        "reason": "Reason 2",
                        "subRuleRef": "0.2",
                        "value": 2
                    }
                ],
                "exitConditions": [
                    {
                        "outcome": true,
                        "reason": "Insufficient transaction history. At least 50 historical transactions are required",
                        "subRuleRef": ".x01",
                    },
                    {
                        "outcome": true,
                        "reason": "Insufficient transaction history. At least 50 historical transactions are required",
                        "subRuleRef": ".x02",
                    },
                    {
                        "outcome": true,
                        "reason": "Insufficient transaction history. At least 50 historical transactions are required",
                        "subRuleRef": ".x03",
                    },
                    {
                        "outcome": true,
                        "reason": "No variance in transaction history and the volume of recent incoming transactions shows an increase",
                        "subRuleRef": ".x04",
                    },
                    {
                        "outcome": true,
                        "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                        "subRuleRef": ".x05",
                    }
                ],
            }
        }],
    }],
    _rev: '',
    createdAt: '',
    desc: '',
    ownerId: '',
    rules_rule_configs: [],
    state: '',
    typologyCategoryUUID: [],
    updatedAt: ''
}

export const config = {
    "bands": [
        {
            "reason": "Band Reason 1",
            "subRuleRef": "0.1",
            "upperLimit": 11864406779,
        },
        {
            "lowerLimit": 99999999999,
            "reason": "adad",
            "subRuleRef": "0.2",
        }
    ],
    "cases": [
        {
            "reason": "Band Reason 2",
            "subRuleRef": "0.1",
            "value": 1
        },
        {
            "reason": "Reason 2",
            "subRuleRef": "0.2",
            "value": 2
        }
    ],
    "exitConditions": [
        {
            "outcome": true,
            "reason": "Insufficient transaction history. At least 50 historical transactions are required",
            "subRuleRef": ".x01",

        },
        {
            "outcome": true,
            "reason": "Insufficient transaction history. At least 50 historical transactions are required",
            "subRuleRef": ".x02",
        },
        {
            "outcome": true,
            "reason": "Insufficient transaction history. At least 50 historical transactions are required",
            "subRuleRef": ".x03",
        },
        {
            "outcome": true,
            "reason": "No variance in transaction history and the volume of recent incoming transactions shows an increase",
            "subRuleRef": ".x04",
        },
        {
            "outcome": true,
            "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
            "subRuleRef": ".x05",
        }
    ],
}

describe('ScorePage', () => {
    beforeEach(() => {
        usePrivileges.mockClear();
        usePrivileges.mockReset();
    })

    it('renders without crashing', async () => {
        usePrivileges.mockReturnValue({
            canReviewTypology: true
        });

        const mock = jest.spyOn(service, 'getTypology').mockResolvedValueOnce({ data } as any);
        render(
            <ReactFlowProvider>
                <ScorePage />
            </ReactFlowProvider>
        );
        expect(await screen.findByText(data.ruleWithConfigs[0].rule.name)).toBeInTheDocument();
        mock.mockReset();
    });

    it('renders error page', async () => {
        usePrivileges.mockReturnValue({
            canReviewTypology: true
        });
        const mock = jest.spyOn(service, 'getTypology').mockRejectedValueOnce(new Error('Server Error') as any);
        render(
            <ReactFlowProvider>
                <ScorePage />
            </ReactFlowProvider>
        );
        expect( await screen.findByText(/Server Error/)).toBeInTheDocument();
        mock.mockReset();
    });

    it('renders access denied page', async () => {
        usePrivileges.mockReturnValue({
            canReviewTypology: false
        });
        const mock = jest.spyOn(service, 'getTypology').mockResolvedValue({data} as any);
        render(
            <ReactFlowProvider>
                <ScorePage />
            </ReactFlowProvider>
        );
        expect( await screen.findByText(/Sorry, you are not authorized to access this page./)).toBeInTheDocument();
        mock.mockReset();
    });


    it('handles node drop with valid type', async () => {
        usePrivileges.mockReturnValue({
            canReviewTypology: true
        });
        const mock = jest.spyOn(service, 'getTypology').mockResolvedValue({ data } as any);

        render(
            <ReactFlowProvider>
                <ScorePage />
            </ReactFlowProvider>
        );

        // Wait for rules to load
        await screen.findByTestId('rules-content');

        //click on node
        const node = screen.getByTestId('rule-item-0');

        fireEvent.click(node);
        // Simulate dragging and dropping a node
        const outcome = screen.getAllByTestId('outcome-drag-item')[0];
        const dropArea = document.querySelector('.react-flow') as Element; // Assuming you have a test ID on the drop area

        fireEvent.dragStart(outcome, { dataTransfer: { setData: jest.fn() } });
        fireEvent.drop(dropArea, {
            dataTransfer: {
                getData: (type: string) => {
                    if (type === 'type') return 'outcome';
                    if (type === 'data') return JSON.stringify({ ...config.exitConditions[0], ruleId: data.ruleWithConfigs[0].rule._key});
                },
            },
        });

        // Verify outcome was added
        expect(await screen.findByTestId('score-node')).toBeInTheDocument();

        //verify outcome doesnot appear on list of outcomes
        expect((await screen.findAllByTestId('outcome-drag-item')).length).toBe(9);

        //open information panel
        const informationPanel = await screen.findByText('Typology Information');
        fireEvent.click(informationPanel);

        // verify that outcomes attached number is 1
        expect(screen.getByTestId('outcome-count').innerHTML).toBe('1');
        expect(screen.getByTestId('outcomes-by-rules').innerHTML).toBe('1/1');
        expect(screen.getByTestId('outcome-score').innerHTML).toBe('0');

        //open attached outcomes panel
        const outcomesAttached = await screen.findByText('Outcomes Attached');
        fireEvent.click(outcomesAttached);
        //updates attached outcomes
        expect(screen.getAllByTestId(/attached-outcome/).length).toBeGreaterThan(0);

        //open attached rules panel
        const rulesAttached = await screen.findByText('Rules Attached');
        fireEvent.click(rulesAttached);
        expect(screen.getAllByTestId(/rule-attached/).length).toBeGreaterThan(0);
        mock.mockReset();
    });

    it('handles update score', async () => {
        usePrivileges.mockReturnValue({
            canReviewTypology: true
        });
        const mock = jest.spyOn(service, 'getTypology').mockResolvedValue({ data } as any);
        render(
            <ReactFlowProvider>
                <ScorePage />
            </ReactFlowProvider>
        );

        // Wait for rules to load
        await screen.findByTestId('rules-content');

        //click on node
        const node = screen.getByTestId('rule-item-0');

        fireEvent.click(node);

        // Wait for rules to outcomes
        expect((await screen.findAllByTestId('outcome-drag-item')).length).toBe(9);
        // Simulate dragging and dropping a node
        const outcome = screen.getAllByTestId('outcome-drag-item')[0];
        const dropArea = document.querySelector('.react-flow') as Element; // Assuming you have a test ID on the drop area

        fireEvent.dragStart(outcome, { dataTransfer: { setData: jest.fn() } });
        fireEvent.drop(dropArea, {
            dataTransfer: {
                getData: (type: string) => {
                    if (type === 'type') return 'outcome';
                    if (type === 'data') return JSON.stringify({ ...config.exitConditions[0], ruleId: data.ruleWithConfigs[0].rule._key});
                },
            },
        });

        const scoreNode = await screen.findAllByTestId('score-input');
        fireEvent.change(scoreNode[0], { target: { value: 20 } });
        // //open information panel
        const informationPanel = await screen.findByText('Typology Information');
        fireEvent.click(informationPanel);
        expect(screen.getByTestId('outcome-score').innerHTML).toBe('20');
        mock.mockReset();
    });

    it('handles update score maximum', async () => {
        usePrivileges.mockReturnValue({
            canReviewTypology: true
        });
        const mock = jest.spyOn(service, 'getTypology').mockResolvedValue({ data } as any);

        render(
            <ReactFlowProvider>
                <ScorePage />
            </ReactFlowProvider>
        );

        // Wait for rules to load
        await screen.findByTestId('rules-content');

        //click on node
        const node = screen.getByTestId('rule-item-0');

        fireEvent.click(node);

        // Wait for rules to outcomes
        expect((await screen.findAllByTestId('outcome-drag-item')).length).toBe(9);
        // Simulate dragging and dropping a node
        const outcome = screen.getAllByTestId('outcome-drag-item')[0];
        const dropArea = document.querySelector('.react-flow') as Element; // Assuming you have a test ID on the drop area

        fireEvent.dragStart(outcome, { dataTransfer: { setData: jest.fn() } });
        fireEvent.drop(dropArea, {
            dataTransfer: {
                getData: (type: string) => {
                    if (type === 'type') return 'outcome';
                    if (type === 'data') return JSON.stringify({ ...config.exitConditions[0], ruleId: data.ruleWithConfigs[0].rule._key} );
                },
            },
        });

        const scoreNode = await screen.findAllByTestId('score-input');
        fireEvent.change(scoreNode[0], { target: { value: 20 } });
        // //open information panel
        const informationPanel = await screen.findByText('Typology Information');
        fireEvent.click(informationPanel);
        expect(screen.getByTestId('outcome-score').innerHTML).toBe('20');

        //add outcome with bigger score should update to maximum score
        const outcome1 = screen.getAllByTestId('outcome-drag-item')[1];
        fireEvent.dragStart(outcome1, { dataTransfer: { setData: jest.fn() } });
        fireEvent.drop(dropArea, {
            dataTransfer: {
                getData: (type: string) => {
                    if (type === 'type') return 'outcome';
                    if (type === 'data') return JSON.stringify({ ...config.exitConditions[1], ruleId: data.ruleWithConfigs[0].rule._key });
                },
            },
        });
        const scoreNode1 = await screen.findAllByTestId('score-input');
        fireEvent.change(scoreNode1[1], { target: { value: 40 } });
        expect(screen.getByTestId('outcome-score').innerHTML).toBe('40');
        mock.mockReset();
    });

    it('displays error modal when dropping without outcomes', async () => {
        usePrivileges.mockReturnValue({
            canReviewTypology: true
        });
        const mock = jest.spyOn(service, 'getTypology').mockResolvedValue({ data } as any);

        render(
            <ReactFlowProvider>
                <ScorePage />
            </ReactFlowProvider>
        );

        // Wait for rules to load
        await screen.findByTestId('rules-content');

        //click on node
        const node = screen.getByTestId('rule-item-0');

        fireEvent.click(node);

        // Wait for rules to outcomes
        expect((await screen.findAllByTestId('outcome-drag-item')).length).toBe(9);
        // Simulate dragging and dropping a node
        const outcome = screen.getAllByTestId('outcome-drag-item')[0];
        const dropArea = document.querySelector('.react-flow') as Element; // Assuming you have a test ID on the drop area

        fireEvent.dragStart(outcome, { dataTransfer: { setData: jest.fn() } });
        fireEvent.drop(dropArea, {
            dataTransfer: {
                getData: (type: string) => {
                    if (type === 'type') return 'operator';
                    if (type === 'data') return JSON.stringify({ ...config.exitConditions[0], ruleId: data.ruleWithConfigs[0].rule._key} );
                },
            },
        });
        // Verify error modal was shown
        expect(await screen.findByText(/No outcomes/)).toBeInTheDocument();
        mock.mockReset();
    });

    it('calls handleDelete correctly', async () => {
        usePrivileges.mockReturnValue({
            canReviewTypology: true
        });
        const mock = jest.spyOn(service, 'getTypology').mockResolvedValue({ data } as any);

        render(
            <ReactFlowProvider>
                <ScorePage />
            </ReactFlowProvider>
        );

        // Wait for rules to load
        await screen.findByTestId('rules-content');

        //click on node
        const node = screen.getByTestId('rule-item-0');

        fireEvent.click(node);

        // Wait for rules to outcomes
        expect((await screen.findAllByTestId('outcome-drag-item')).length).toBe(9);
        // Simulate dragging and dropping a node
        const outcome = screen.getAllByTestId('outcome-drag-item')[0];
        const dropArea = document.querySelector('.react-flow') as Element; // Assuming you have a test ID on the drop area

        fireEvent.dragStart(outcome, { dataTransfer: { setData: jest.fn() } });
        fireEvent.drop(dropArea, {
            dataTransfer: {
                getData: (type: string) => {
                    if (type === 'type') return 'outcome';
                    if (type === 'data') return JSON.stringify({ ...config.exitConditions[0], ruleId: data.ruleWithConfigs[0].rule._key });
                },
            },
        });

        const scoreNode = await screen.findAllByTestId('score-input');
        fireEvent.change(scoreNode[0], { target: { value: 20 } });
        // //open information panel
        const informationPanel = await screen.findByText('Typology Information');
        fireEvent.click(informationPanel);
        expect(screen.getByTestId('outcome-score').innerHTML).toBe('20')
        const outcome1 = screen.getAllByTestId('outcome-drag-item')[1];
        fireEvent.dragStart(outcome1, { dataTransfer: { setData: jest.fn() } });
        fireEvent.drop(dropArea, {
            dataTransfer: {
                getData: (type: string) => {
                    if (type === 'type') return 'outcome';
                    if (type === 'data') return JSON.stringify({ ...config.exitConditions[1], ruleId: data.ruleWithConfigs[0].rule._key });
                },
            },
        });

        const scoreNode1 = await screen.findAllByTestId('score-input');
        fireEvent.change(scoreNode1[1], { target: { value: 40 } });
        expect(screen.getByTestId('outcome-score').innerHTML).toBe('40');
        //updates count in typology information
        expect(screen.getByTestId('outcome-count').innerHTML).toBe('2');
        expect(screen.getByTestId('outcomes-by-rules').innerHTML).toBe('1/1');

        //Delete Outcome
        const removeIcon = screen.getAllByTestId('remove-node');
        fireEvent.click(removeIcon[1]);
        //since we remove node in position 1 and has a score of 40. The new score will be for node at 0
        // which 20
        expect(screen.getByTestId('outcome-score').innerHTML).toBe('20');

        //Test resets count in information section
        expect(screen.getByTestId('outcome-count').innerHTML).toBe('1');
        expect(screen.getByTestId('outcomes-by-rules').innerHTML).toBe('1/1');

        mock.mockReset();
    });

   
});
