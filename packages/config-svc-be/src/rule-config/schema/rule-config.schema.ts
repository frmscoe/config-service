import { StateEnum } from '../../rule/schema/rule.schema';
import { SchemaOptions } from 'arangojs/collection';

export const RULE_CONFIG_COLLECTION = 'rule_config';
export const ruleConfigSchema: { schema: SchemaOptions; computedValues: any } =
  {
    schema: {
      rule: {
        level: 'moderate',
        properties: {
          _key: { type: 'string' },
          desc: { type: 'string', maxLength: 255 },
          cfg: { type: 'string' },
          state: {
            type: 'string',
            enum: Object.values(StateEnum),
            default: StateEnum['01_DRAFT'],
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          updatedBy: { type: 'string' },
          approverId: { type: 'string' },
          ownerId: { type: 'string' },
          ruleId: { type: 'string' },
          originatedID: { type: 'string', default: null },
          edited: { type: 'boolean', default: false },
          config: {
            type: ['object', 'null'],
            properties: {
              parameters: {
                type: ['array', 'null'],
                items: {
                  type: ['object', 'null'],
                  properties: {
                    ParameterName: { type: 'string' },
                    ParameterValue: { type: ['string', 'number'] },
                    ParameterType: { type: 'string' },
                  },
                },
              },
              exitConditions: {
                type: ['array', 'null'],
                items: {
                  type: ['object', 'null'],
                  properties: {
                    subRuleRef: { type: 'string' },
                    reason: { type: 'string' },
                  },
                },
              },
              bands: {
                type: ['array', 'null'],
                items: {
                  type: ['object', 'null'],
                  properties: {
                    subRuleRef: { type: 'string' },
                    upperLimit: { type: ['number', 'string', 'null'] },
                    lowerLimit: { type: ['number', 'string', 'null'] },
                    reason: { type: 'string' },
                  },
                },
              },
              cases: {
                type: ['array', 'null'],
                items: {
                  type: ['object', 'null'],
                  properties: {
                    subRuleRef: { type: 'string' },
                    value: { type: ['string', 'number'] },
                    reason: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        additionalProperties: false,
      },
    },
    computedValues: [
      {
        name: 'createdAt',
        expression: 'RETURN DATE_ISO8601(DATE_NOW())',
        computeOn: ['insert'],
        overwrite: false,
      },
      {
        name: 'updatedAt',
        expression: 'RETURN DATE_ISO8601(DATE_NOW())',
        computeOn: ['insert', 'update'],
        overwrite: true,
      },
    ],
  };
