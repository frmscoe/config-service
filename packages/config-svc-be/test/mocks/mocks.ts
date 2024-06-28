import { faker } from '@faker-js/faker';
import { DataTypeEnum } from '../../src/rule/schema/rule.schema';
import { Typology } from '../../src/typology/entities/typology.entity';
import { CreateRuleDto } from '../../src/rule/dto/create-rule.dto';
import { CreateRuleConfigDto } from '../../src/rule-config/dto/create-rule-config.dto';
import { CreateNetworkMapDto } from '../../src/network-map/dto/create-network-map.dto';

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

export const createNetworkMapDto: CreateNetworkMapDto = {
  active: true,
  cfg: '1.0.0',
  events: [
    {
      eventId: `event/${faker.string.uuid()}`,
      typologies: [
        {
          id: 'Typology Processor 1@1.0.0',
          name: 'Typology Processor 1',
          cfg: '1.0.0',
          active: true,
          rulesWithConfigs: [
            {
              rule: {
                _id: 'rule/rule-test-id-1',
                _key: 'rule-test-id-1',
                name: 'rule-name-1',
                cfg: '1.0.0',
              },
              ruleConfigs: [
                {
                  _id: 'rule-config/rule-config-test-id-1',
                  _key: 'rule-config-test-id-1',
                  cfg: '1.0.0',
                },
                {
                  _id: 'rule-config/rule-config-test-id-2',
                  _key: 'rule-config-test-id-2',
                  cfg: '2.0.0',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  source: 'user_created',
};
