import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Rules, RulesAttachedProps } from '../Rules';
import { IRule } from '~/domain/Rule/RuleDetailPage/service';

// Mock data
const mockRules: IRule[] = [
    {
        name: 'Rule 1',
        ruleConfigs: [{
            cfg: '001',
            _key: '',
            _id: '',
            _rev: '',
            state: '',
            desc: '',
            ruleId: '',
            config: { parameters: [], exitConditions: [], bands: [], cases: [] },
            ownerId: '',
            createdAt: '',
            updatedAt: ''
        }],
        _key: '',
        _id: '',
        _rev: '',
        cfg: '',
        state: '',
        dataType: '',
        desc: '',
        ownerId: '',
        createdAt: '',
        updatedAt: ''
    },
    {
        name: 'Rule 2', ruleConfigs: [{
            cfg: '002',
            _key: '',
            _id: '',
            _rev: '',
            state: '',
            desc: '',
            ruleId: '',
            config: { parameters: [], exitConditions: [], bands: [], cases: [] },
            ownerId: '',
            createdAt: '',
            updatedAt: ''
        }, {
            cfg: '003',
            _key: '',
            _id: '',
            _rev: '',
            state: '',
            desc: '',
            ruleId: '',
            config: { parameters: [], exitConditions: [], bands: [], cases: [] },
            ownerId: '',
            createdAt: '',
            updatedAt: ''
        }],
        _key: '',
        _id: '',
        _rev: '',
        cfg: '',
        state: '',
        dataType: '',
        desc: '',
        ownerId: '',
        createdAt: '',
        updatedAt: ''
    },
    {
        name: 'Rule 2', 
        ruleConfigs: [],
        _key: '',
        _id: '',
        _rev: '',
        cfg: '',
        state: '',
        dataType: '',
        desc: '',
        ownerId: '',
        createdAt: '',
        updatedAt: ''
    },
];

const defaultProps: RulesAttachedProps = {
    rules: [],
    ruleOptions: [],
    setRuleOptions:jest.fn(),
    selectedRule: null,
    setSelectedRuleIndex: jest.fn(),
    attachedRules: [],
    ruleDragIndex: null,
    setRuleDragIndex: jest.fn(),
    recentlyRemoveRules: []
}

describe('Rules Component', () => {
    it('renders without crashing', () => {
        render(<Rules {...defaultProps} rules={mockRules} />);
        expect(screen.getByText('Rules')).toBeInTheDocument();
    });

    it('renders the rules and allows searching', () => {
        render(<Rules {...defaultProps}  rules={mockRules} />);
        const searchInput = screen.getByTestId('search-rules-input');
        fireEvent.change(searchInput, { target: { value: 'Rule 1' } });
        expect(screen.getByDisplayValue('Rule 1')).toBeInTheDocument();
    });

    it('shows message when no rule is selected', () => {
        render(<Rules {...defaultProps}  rules={mockRules} />);
        expect(screen.getByText('Please set a rule to show configurations')).toBeInTheDocument();
    });

    it('toggles recently removed section', () => {
        render(<Rules {...defaultProps}  rules={mockRules} />);
        const recentlyRemovedToggle = screen.getByTestId('show-recently-removed');
        fireEvent.click(recentlyRemovedToggle);
        expect(screen.getByTestId('removed-items-input')).toBeInTheDocument();
    });

    it('Trigger drag logic for rule', async() => {
       const component =  render(
        <Rules
         {...defaultProps}
          selectedRule={'1'}
          attachedRules={[]}
          ruleDragIndex={null}
          recentlyRemoveRules={[]}
          ruleOptions={[{
              name: 'rule-001',
               _key: '1',
              _id: '1',
              _rev: '',
              cfg: '',
              state: '',
              dataType: '',
              desc: '',
              ownerId: '',
              createdAt: '',
              updatedAt: '',
              ruleConfigs: [{
                  _key: '1',
                  _id: '',
                  _rev: '',
                  cfg: '001',
                  state: '',
                  desc: '',
                  ruleId: '',
                  ownerId: '',
                  createdAt: '',
                  updatedAt: ''
              }]
          }]}
        />
      );

        const event = {
            dataTransfer: {
                setData: jest.fn(),
            }
        }
        await waitFor(() => {
            component.getAllByTestId('rule-drag-item');
        });
        const element = component.getAllByTestId('rule-drag-item')[0];
        fireEvent.dragStart(element, {...event});
        expect(event.dataTransfer.setData).toHaveBeenCalled();
      });

      it('Trigger drag logic for config', () => {
        render(
          <Rules
           {...defaultProps}
            selectedRule={'1'}
            attachedRules={[]}
            ruleDragIndex={null}
            recentlyRemoveRules={[]}
            rules={[{
                name: 'rule-001',
                 _key: '1',
                _id: '1',
                _rev: '',
                cfg: '',
                state: '',
                dataType: '',
                desc: '',
                ownerId: '',
                createdAt: '',
                updatedAt: '',
                ruleConfigs: [{
                    _key: '1',
                    _id: '',
                    _rev: '',
                    cfg: '001',
                    state: '',
                    desc: '',
                    ruleId: '',
                    ownerId: '',
                    createdAt: '',
                    updatedAt: ''
                }]
            }]}
          />
        );

        const event = {
            dataTransfer: {
                setData: jest.fn(),
            }
        }
        const configElement = screen.getByTestId('rule-config',);
        fireEvent.dragStart(configElement, {...event});
        expect(event.dataTransfer.setData).toHaveBeenCalled();
      });
});
