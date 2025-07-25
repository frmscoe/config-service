// SPDX-License-Identifier: Apache-2.0

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

export interface RuleConfigEntry {
  ruleId: string;
  ruleConfigId: string[];
}

export interface ITypologyInEvent {
  _key: string;
  name: string;
  cfg: string;
  desc: string;
  state: StateEnum;
  createdAt: string;
  updatedAt: string;
  typologyCategoryUUID: string[];
  rules_rule_configs: RuleConfigEntry[];
  updatedBy?: string;
  ownerId: string;
  approverId?: string;
  referenceId?: number | null;
  originatedId?: string | null;
  edited?: boolean;
}

export interface IEventInNetworkMap {
  eventId: string;
  typologies: ITypologyInEvent[];
}

export interface INetworkMap {
  _key?: string;
  _id: string;
  active: boolean;
  cfg: string;
  state: StateEnum;
  events: IEventInNetworkMap[];
  createdAt: string;
  updatedAt: string;
  modifiedBy?: string;
  ownerId: string;
  approvedBy?: string;
  originatedId?: string;
  referenceId?: number;
  edited?: boolean;
  source?: string;
}
