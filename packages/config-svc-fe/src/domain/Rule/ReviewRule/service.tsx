// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client"


// export const getRule = (id: string) => {
//     return Api.get(`/rule/${id}`);
// }

export const getFullRuleConfig = (ruleName: string) => {
  return Api.get(`/rule/rule-and-its-configs/${ruleName}`);
};