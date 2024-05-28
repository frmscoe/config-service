import { faker } from '@faker-js/faker';
import { DataTypeEnum } from '../../src/rule/schema/rule.schema';

export const rule = {
  name: faker.string.sample(),
  cfg: '1.0.0',
  dataType: DataTypeEnum['CURRENCY'],
  desc: faker.string.sample(),
};

export const ruleConfig = {
  cfg: '1.0.0',
  desc: faker.string.sample(),
  config: {
    parameters: [
      {
        ParameterName: 'max_query_limit',
        ParameterValue: 0.1,
        ParameterType: 'number',
      },
    ],
    exitConditions: [
      {
        subRuleRef: '.x00',
        outcome: false,
        reason: 'Incoming transaction is unsuccessful',
      },
    ],
    cases: [
      {
        subRuleRef: '.00',
        outcome: false,
        reason:
          'The transaction type is not defined in this rule configuration',
        value: 'UNDEFINED',
      },
      {
        subRuleRef: '.01',
        value: 'WITHDRAWAL',
        outcome: true,
        reason: 'The transaction is identified as a cash withdrawal',
      },
    ],
    bands: [],
  },
};
