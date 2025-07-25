// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client";

// Fetch rule and its configurations in one call
export const getFullRuleConfig = (ruleName: string) => {
  return Api.get(`/rule/rule-and-its-configs/${ruleName}`);
};

// Transition rule state (e.g., DRAFT -> PENDING_REVIEW)
export const updateRuleState = (ruleId: string, newState: string) => {
  return Api.patch(`/rule/${encodeURIComponent(ruleId)}/transition`, {
    state: newState,
  });
};



