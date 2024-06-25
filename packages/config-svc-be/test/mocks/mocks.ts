import { faker } from '@faker-js/faker';
import { DataTypeEnum } from '../../src/rule/schema/rule.schema';
import { Typology } from '../../src/typology/entities/typology.entity';
import { CreateRuleDto } from '../../src/rule/dto/create-rule.dto';
import { CreateRuleConfigDto } from '../../src/rule-config/dto/create-rule-config.dto';

export const createRuleDto: CreateRuleDto = {
  name: faker.string.sample(),
  cfg: '1.0.0',
  dataType: DataTypeEnum['CURRENCY'],
  desc: faker.string.sample(),
};

export const createRuleConfigDto: CreateRuleConfigDto = {
  ruleId: faker.string.uuid(),
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
        reason: 'Incoming transaction is unsuccessful',
      },
    ],
    cases: [
      {
        subRuleRef: '.00',
        reason:
          'The transaction type is not defined in this rule configuration',
        value: 'UNDEFINED',
      },
      {
        subRuleRef: '.01',
        value: 'WITHDRAWAL',
        reason: 'The transaction is identified as a cash withdrawal',
      },
    ],
    bands: [],
  },
};

export const typology: Typology = {
  _key: faker.string.uuid(),
  name: faker.string.sample(),
  desc: faker.string.sample(),
  cfg: '1.0.0',
  rules_rule_configs: [],
  ownerId: faker.internet.email(),
  state: '01_DRAFT',
  typologyCategoryUUID: [faker.string.uuid()],
};
