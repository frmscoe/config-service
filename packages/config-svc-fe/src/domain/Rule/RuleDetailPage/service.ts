// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client"
import { IRuleConfig } from "../RuleConfig/RuleConfigList/types";

export interface IRule {
    _key: string;
    _id: string;
    _rev: string;
    cfg: string;
    state: string;
    dataType: string;
    desc: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    ruleConfigs: IRuleConfig[]
}



export const getRules = ({
  page = 1,
  limit = process.env.NEXT_PUBLIC_SECURITY_FETCH_LIMIT,
  desc,
  name,
  cfg,
  state,
  ownerId,
}: {
  page?: number;
  limit?: number;
  desc?: string;
  name?: string;
  cfg?: string;
  state?: string;
  ownerId?: string;
}) => {
  return Api.get('/rule', {
    params: {
      page,
      limit,
      desc,
      name,
      cfg,
      state,
      ownerId,
    },
  });
};





