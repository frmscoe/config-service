// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client"

export const getRuleConfig = (id: string) => {
    return Api.get(`/rule-config/${id}`);
}

export const getRule = (id: string) => {
    return Api.get(`/rule/${id}`);
}

export const postRuleConfig = (data: any) => {
  return Api.post('/rule-config', data);
};

export const getFullRuleConfig = (ruleName: string) => {
  return Api.get(`/rule/rule-and-its-configs/${ruleName}`);
};

export const updateRuleConfig = async (id: string, payload: Partial<IRuleConfig>) => {
  // return Api.patch(`/rule-config/${id}`, payload);
  return Api.patch(`/rule-config/${encodeURIComponent(id)}`, payload);
};
