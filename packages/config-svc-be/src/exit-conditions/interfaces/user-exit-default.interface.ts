// <!-- SPDX-License-Identifier: Apache-2.0 -->
export interface UserExitDefault {
  _key?: string; // ArangoDB document key (can be ownerId or a UUID)
  ownerId: string; // The ID of the user (from user-mapping, e.g., req.user.username)
  defaultExitConditionId: string; // The 'id' (the `id` field from ExitCondition, e.g., ".x00") of the ExitCondition chosen as default
  createdAt?: Date; // Timestamp when the default was initially set
  updatedAt?: Date; // Timestamp when the default was last updated
}