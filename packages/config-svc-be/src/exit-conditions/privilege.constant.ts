// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { PrivilegeType } from '../privilege/privilege.service'; // Corrected relative path

export enum ExitConditionPrivileges {
  GET_EXIT_CONDITIONS = 'EXIT_COND_GET_ALL',
  GET_EXIT_CONDITION_BY_ID = 'EXIT_COND_GET_BY_ID',
  GET_USER_DEFAULT_EXIT_CONDITION = 'EXIT_COND_GET_USER_DEFAULT',
  CREATE_USER_EXIT_CONDITION = 'EXIT_COND_CREATE_USER',
  SET_USER_DEFAULT_EXIT_CONDITION = 'EXIT_COND_SET_USER_DEFAULT',
  DELETE_USER_EXIT_CONDITION = 'EXIT_COND_DELETE_USER',
}

export const ExitConditionPrivilegesDefinition: PrivilegeType[] = [
  {
    privId: ExitConditionPrivileges.GET_EXIT_CONDITIONS,
    labelName: 'Exit Conditions: Get All',
    description: 'Allows retrieving all system and user-defined exit conditions.',
  },
  {
    privId: ExitConditionPrivileges.GET_EXIT_CONDITION_BY_ID,
    labelName: 'Exit Conditions: Get by ID',
    description: 'Allows retrieving a specific exit condition by its ID.',
  },
  {
    privId: ExitConditionPrivileges.GET_USER_DEFAULT_EXIT_CONDITION,
    labelName: 'Exit Conditions: Get User Default',
    description: 'Allows retrieving the current user\'s default exit condition.',
  },
  {
    privId: ExitConditionPrivileges.CREATE_USER_EXIT_CONDITION,
    labelName: 'Exit Conditions: Create User Defined',
    description: 'Allows creating new user-defined exit conditions.',
  },
  {
    privId: ExitConditionPrivileges.SET_USER_DEFAULT_EXIT_CONDITION,
    labelName: 'Exit Conditions: Set User Default',
    description: 'Allows setting an exit condition as the current user\'s default.',
  },
  {
    privId: ExitConditionPrivileges.DELETE_USER_EXIT_CONDITION,
    labelName: 'Exit Conditions: Delete User Defined',
    description: 'Allows soft-deleting user-defined exit conditions.',
  },
];