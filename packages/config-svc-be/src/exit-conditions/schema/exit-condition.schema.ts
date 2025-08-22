// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { ArangoDbCollectionConfig } from 'src/arango-database/arango-database.service';

export const EXIT_CONDITIONS_COLLECTION = 'exitConditions';

export interface ExitCondition {
  id: string;
  reason: string;
  description: string;
  label: 'System Default' | 'User Created';
  isUserDefault: boolean;
  ownerId?: string; // Nullable/Optional for System Default conditions
  createdAt: string;
  updatedAt: string;
  createdBy: string; // Made required
  updatedBy: string; // Made required
  deletedAt?: string; // Optional for soft-delete
}

export const exitConditionSchema: ArangoDbCollectionConfig['schema'] = {
  // This 'rule' object is crucial!
  rule: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1, description: 'Unique identifier for the exit condition, e.g., .x00' },
      reason: { type: 'string', minLength: 1, description: 'Brief reason for the exit condition' },
      description: { type: 'string', minLength: 1, description: 'Detailed description of the exit condition' },
      label: {
        type: 'string',
        enum: ['System Default', 'User Created'],
        description: 'Indicates if the condition is system-provided or user-defined',
      },
      isUserDefault: {
        type: 'boolean',
        default: false, //Ensure default is false
        description: 'Indicates whether this is a default condition for the user',
      },
      ownerId: {
        type: 'string',
        nullable: true,
        description: 'The owner ID for user-created conditions, extracted from authentication context',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the condition was created',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the condition was last updated',
      },
      createdBy: {
        type: 'string',
        minLength: 1,
        description: 'ID of the user who created this condition',
      },
      updatedBy: {
        type: 'string',
        minLength: 1,
        description: 'ID of the user who last updated this condition',
      },
      deletedAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Timestamp when the condition was soft-deleted',
      },
    },
    required: ['id', 'reason', 'description', 'label', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'],
  },
  indexes: [
    {
      type: 'persistent',
      fields: ['id'],
      unique: true,
    },
  ],
};