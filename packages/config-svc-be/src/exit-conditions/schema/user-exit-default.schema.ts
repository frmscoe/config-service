// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { ArangoDbCollectionConfig } from 'src/arango-database/arango-database.service';

export const USER_EXIT_DEFAULTS_COLLECTION = 'userExitDefaults';

export interface UserExitDefault {
  _key?: string; // Added this line to include the ArangoDB document key
  ownerId: string;
  defaultExitConditionId: string;
  createdAt: string;
  updatedAt: string;
}

export const userExitDefaultSchema: ArangoDbCollectionConfig['schema'] = {
  // The actual schema rules must be nested under the 'rule' property
  rule: {
    type: 'object',
    properties: {
      _key: { type: 'string' }, // Also added to the schema properties
      ownerId: { type: 'string', minLength: 1, description: 'The unique ID of the user' },
      defaultExitConditionId: { type: 'string', minLength: 1, description: 'The ID of the exit condition chosen as default by the user' },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the default was set',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the default was last updated',
      },
    },
    required: ['ownerId', 'defaultExitConditionId'],
  },
  // Indexes are part of the collection configuration, outside the 'rule'
  indexes: [
    {
      type: 'persistent',
      fields: ['ownerId'],
      unique: true,
    },
  ],
};