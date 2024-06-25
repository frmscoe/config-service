import { SchemaOptions } from 'arangojs/collection';
import { StateEnum } from '../../rule/schema/rule.schema';

export const NETWORK_MAP_COLLECTION = 'network_map';

export const networkMapSchema: { schema: SchemaOptions; computedValues: any } =
  {
    schema: {
      rule: {
        level: 'moderate',
        properties: {
          _key: { type: 'string' },
          active: { type: 'boolean' },
          cfg: { type: 'string' },
          state: {
            type: 'string',
            enum: Object.values(StateEnum),
            default: StateEnum['01_DRAFT'],
          },
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                eventId: { type: 'string' },
                typologies: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      cfg: { type: 'string' },
                      active: { type: 'boolean' },
                      rulesWithConfigs: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            rule: {
                              type: 'object',
                              properties: {
                                _id: { type: 'string' },
                                _key: { type: 'string' },
                                name: { type: 'string' },
                                cfg: { type: 'string' },
                              },
                            },
                            ruleConfigs: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  _id: { type: 'string' },
                                  _key: { type: 'string' },
                                  cfg: { type: 'string' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          updatedBy: { type: 'string' },
          approverId: { type: 'string' },
          ownerId: { type: 'string' },
          originatedId: { type: ['null', 'string'], default: null },
          edited: { type: 'boolean', default: false },
          referenceId: { type: ['null', 'number'], default: null },
          source: { type: 'string' },
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
