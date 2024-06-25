import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { RulesAttached, RulesConfigurationsAttached } from '../Rules-Attached';
import { AttachedRules } from '..';

describe('RulesAttached component', () => {
  const rulesAttached: AttachedRules[] = [
    {
        _key: '1', name: 'Rule 1', attachedConfigs: [],
        _id: '',
        _rev: '',
        cfg: '',
        state: '',
        dataType: '',
        desc: '',
        ownerId: '',
        createdAt: '',
        updatedAt: '',
        ruleConfigs: []
    },
    {
        _key: '2', name: 'Rule 2', attachedConfigs: [{
            _key: 'config1', cfg: 'config1',
            _id: '',
            _rev: '',
            state: '',
            desc: '',
            ruleId: '',
            ownerId: '',
            createdAt: '',
            updatedAt: ''
        }],
        _id: '',
        _rev: '',
        cfg: '',
        state: '',
        dataType: '',
        desc: '',
        ownerId: '',
        createdAt: '',
        updatedAt: '',
        ruleConfigs: []
    },
  ];

  test('Search rules attached', () => {
    render(<RulesAttached rulesAttached={rulesAttached} />);

    const searchInput = screen.getByTestId('rules-attached-search');
    fireEvent.change(searchInput, { target: { value: 'Rule 1' } });

    expect(screen.getByText('Rule 1')).toBeInTheDocument();
    expect(screen.queryByText('Rule 2')).not.toBeInTheDocument();
  });

  test('Show no rules attached', () => {
    render(<RulesAttached rulesAttached={[]} />);

    expect(screen.getByText('No rules attached')).toBeInTheDocument();
  });
});

describe('RulesConfigurationsAttached component', () => {
  const rulesAttached: AttachedRules[] = [
    {
        _key: '1', name: 'Rule 1', attachedConfigs: [{
            _key: 'config1', cfg: '002',
            _id: '',
            _rev: '',
            state: '',
            desc: '',
            ruleId: '',
            ownerId: '',
            createdAt: '',
            updatedAt: ''
        }],
        _id: '',
        _rev: '',
        cfg: '',
        state: '',
        dataType: '',
        desc: '',
        ownerId: '',
        createdAt: '',
        updatedAt: '',
        ruleConfigs: []
    },
    {
        _key: '2', name: 'Rule 2',
         attachedConfigs: [{
            _key: 'config2', cfg: '001',
            _id: '',
            _rev: '',
            state: '',
            desc: '',
            ruleId: '',
            ownerId: '',
            createdAt: '',
            updatedAt: ''
        }],
        _id: '',
        _rev: '',
        cfg: '',
        state: '',
        dataType: '',
        desc: '',
        ownerId: '',
        createdAt: '',
        updatedAt: '',
        ruleConfigs: []
    },
  ];

  test('Search rule configurations attached', () => {
    render(<RulesConfigurationsAttached rulesAttached={rulesAttached} />);

    const searchInput = screen.getByTestId('search-configuration-input');
    fireEvent.change(searchInput, { target: { value: '001' } });

    expect(screen.getAllByTestId('attached-config').length).toBe(1);
    
  });

  test('Show no rule configurations attached', () => {
    render(<RulesConfigurationsAttached rulesAttached={[]} />);

    expect(screen.getByText('No Rule Configurations')).toBeInTheDocument();
  });
});
