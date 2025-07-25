// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { SchemaOptions } from 'arangojs/collection';

export const USER_EMAIL_MAPPING_COLLECTION = 'userEmailMappings';

export const userEmailMappingSchema: { schema: SchemaOptions; computedValues: any } = {
  schema: { // This outer 'schema' property holds the ArangoDB collection schema configuration
    rule: { // This 'rule' property contains the core JSON Schema validation rules
      level: 'moderate', // Consistent with your existing schemas (placed inside 'rule')
      properties: {
        _key: { type: 'string' }, // Added for consistency with your other schemas
        clientId: {
          type: 'string',
          description: 'Unique client identifier for the user from JWT',
        },
        email: {
          type: 'string',
          format: 'email', // Ensures it's a valid email format
          description: 'User\'s email address',
        },
        privileges: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'List of privileges assigned to the user',
        },
        createdAt: {
          type: 'string',
          format: 'date-time', // For ISO string dates
          description: 'Timestamp when the mapping was created',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Timestamp when the mapping was last updated',
        },
      },
      required: ['clientId', 'email', 'privileges'],
      additionalProperties: false, // Added for consistency with your other schemas
    },
    // No 'message' property here, as it's not present in your provided working schemas.
  },
  // Added computedValues to match the structure of your other schemas
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