// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client";

export const postRuleConfig = (data: any) => {
  return Api.post('/rule-config', data);
};

export const getRuleAndConfigs = async (ruleName: string) => {
  const res = await Api.get(`/rule/rule-and-its-configs/${ruleName}`);
  return res.data; 
};
