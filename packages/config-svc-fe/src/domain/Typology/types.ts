// <!-- SPDX-License-Identifier: Apache-2.0 -->
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

export interface ITypology {
  _key?: string;
  _id: string;
  cfg: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  desc: string;
  state: StateEnum;
  typologyCategoryUUID?: string[];
  rules_rule_configs?: Array<{ ruleId: string; ruleConfigId: string[] }>;
  updatedBy?: string;
  approverId?: string;
  referenceId?: number | null;
  originatedId?: string | null;
  edited?: boolean;
}