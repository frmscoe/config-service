import { SchemaOptions } from 'arangojs/collection';
import { StateEnum } from '../../rule/schema/rule.schema';

export const TYPOLOGY_COLLECTION = 'typology';

export const typologySchema: { schema: SchemaOptions; computedValues: any } = {
  schema: {
    rule: {
      level: 'moderate', // Ensures moderate level validation according to ArangoDB documentation
      properties: {
        _key: { type: 'string' },
        name: { type: 'string' },
        cfg: { type: 'string' },
        desc: { type: 'string' },
        state: {
          type: 'string',
          enum: Object.values(StateEnum),
          default: StateEnum['01_DRAFT'],
        },
        typologyCategoryUUID: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Array of typology category identifiers that the typology belongs to.',
        },
        rules_rule_configs: {
          type: 'array',
          description:
            'An array of objects linking this typology to specific rules and their configurations. Each object contains a ruleId and an array of associated ruleConfigIds, establishing a direct connection between the typology and its applicable rules and settings.',
          items: {
            type: 'object',
            properties: {
              ruleId: { type: 'string' },
              ruleConfigId: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        updatedBy: { type: 'string' },
        approverId: { type: 'string' },
        ownerId: { type: 'string' },
        referenceId: {
          type: ['null', 'number'],
          default: null,
          description:
            'The identifier for the existing imported typologies. The Typology processor ID in the source system.',
        },
        originatedId: { type: 'string', default: null },
        edited: { type: 'boolean', default: false }, // Newly added field to track if the document has been edited
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
