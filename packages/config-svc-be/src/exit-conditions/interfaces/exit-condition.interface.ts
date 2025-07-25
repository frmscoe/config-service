// <!-- SPDX-License-Identifier: Apache-2.0 -->
export interface ExitCondition {
  id: string;
  reason: string;
  description: string;
  label: string;
  ownerId?: string | null; // Nullable for system defaults
  createdAt: string; // Ensure this is 'string' for ISO date
  updatedAt: string; // Ensure this is 'string' for ISO date
  deletedAt?: string | null; // Nullable for soft delete
  _key?: string; // ArangoDB internal key, often set to 'id'
  createdBy?: string; // ADDED THIS LINE
  updatedBy?: string; // ADDED THIS LINE
}