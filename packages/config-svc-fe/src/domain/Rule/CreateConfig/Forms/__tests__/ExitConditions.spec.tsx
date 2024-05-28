import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ExitConditions from '../ExitConditions';
import '../../../../../../setup';

import { DEFAULT_EXIT_CONDITIONS } from '~/constants';


// import '../../../../../../setup';

// Mocking useCommonTranslations hook
jest.mock('~/hooks', () => ({
  useCommonTranslations: () => ({
    t: jest.fn((key) => key),
  }),
}));

describe('ExitConditions component', () => {
  test('renders correctly', () => {
    const conditions = [
      { subRefRule: 'rule1', reason: 'Reason 1' },
      { subRefRule: 'rule2', reason: 'Reason 2' },
    ];
    const { getByText } = render(
      <ExitConditions conditions={conditions} setConditions={jest.fn()} />
    );

    // Check if the "Restore" button is rendered
    expect(getByText('createRuleConfigPage.exitConditionsForm.restore')).toBeInTheDocument();

    // Check if each condition is rendered
    conditions.forEach((condition) => {
      expect(getByText(condition.subRefRule)).toBeInTheDocument();
      expect(getByText(condition.reason)).toBeInTheDocument();
    });

    // Check if each "Delete" button is rendered
    conditions.forEach((condition) => {
      const deleteButton = screen.getAllByTestId('minus-icon')[0];
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton);
    });
  });


  test('calls setConditions with DEFAULT_EXIT_CONDITIONS on Restore button click', () => {
    const setConditionsMock = jest.fn();
    const { getByText } = render(
      <ExitConditions conditions={[/* Any existing conditions */]} setConditions={setConditionsMock} />
    );

    fireEvent.click(getByText('createRuleConfigPage.exitConditionsForm.restore'));

    expect(setConditionsMock).toHaveBeenCalledWith(DEFAULT_EXIT_CONDITIONS);
  });

  test('call setCondition on click delete icon', () => {
    const conditions = [
      { subRefRule: 'rule1', reason: 'Reason 1' },
      { subRefRule: 'rule2', reason: 'Reason 2' },
    ];
    const setCondition = jest.fn();
    render(
      <ExitConditions conditions={conditions} setConditions={setCondition} />
    );
    const deleteButton = screen.getAllByTestId('minus-icon')[0];
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);
    expect(setCondition).toHaveBeenCalled();
   
  });
});
