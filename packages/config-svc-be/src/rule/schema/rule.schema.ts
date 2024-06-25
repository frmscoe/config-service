import { SchemaOptions } from 'arangojs/collection';

export const RULE_COLLECTION = 'rule';
export enum StateEnum {
  '01_DRAFT' = '01_DRAFT',
  '10_PENDING_REVIEW' = '10_PENDING_REVIEW',
  '11_REJECTED' = '11_REJECTED',
  '12_WITHDRAWN' = '12_WITHDRAWN',
  '20_APPROVED' = '20_APPROVED',
  '30_DEPLOYED' = '30_DEPLOYED',
  '32_RETIRED' = '32_RETIRED',
  '90_ABANDONED' = '90_ABANDONED',
  '91_ARCHIVED' = '91_ARCHIVED',
  '92_DISABLED' = '92_DISABLED',
  '93_MARKED_FOR_DELETION' = '93_MARKED_FOR_DELETION',
}

export enum DataTypeEnum {
  'CURRENCY' = 'CURRENCY',
  'NUMERIC' = 'NUMERIC',
  'TIME' = 'TIME',
  'CALENDAR_DATE_TIME' = 'CALENDER_DATE_TIME',
  'TEXT' = 'TEXT',
}

export enum SourceEnum {
  'USER_CREATED' = 'USER_CREATED',
  'USER_IMPORTED' = 'USER_IMPORTED',
  'CALIBRATION_SERVICE' = 'CALIBRATION_SERVICE',
}

export const ruleSchema: { schema: SchemaOptions; computedValues: any } = {
  schema: {
    rule: {
      level: 'moderate',
      properties: {
        _key: { type: 'string' },
        cfg: { type: 'string' },
        name: { type: 'string' },
        desc: { type: 'string' },
        dataType: {
          type: 'string',
          enum: Object.values(DataTypeEnum),
        },
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
        originatedID: { type: 'string', default: null },
        edited: { type: 'boolean', default: false },
        source: {
          type: 'string',
          enum: Object.values(SourceEnum),
        },
      },
      required: ['name', 'cfg', 'state', 'desc', 'ownerId'],
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
