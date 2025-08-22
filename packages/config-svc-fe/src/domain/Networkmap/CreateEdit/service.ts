// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client"
import { ITypology } from "~/domain/Typology/List/service" 


export interface IRule {
  _key: string;
  _id: string; // e.g., "rule/db1e7c49-dd1b-435b-b690-ac9e8197ea36"
  _rev: string;
  cfg: string;
  desc: string;
  name: string;
  dataType: string;
  ownerId: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}


export interface IRuleConfig {
  _key: string;
  _id: string; // e.g., "rule_config/c7efa16c-dc6d-4c37-a9d9-bc6babe82b5c"
  _rev: string;
  cfg: string;
  desc: string;
  ruleId: string; // e.g., "rule/db1e7c49-dd1b-435b-b690-ac9e8197ea36"
  config: {
    parameters: Array<{ ParameterName: string; ParameterType: string; ParameterValue: string; }>;
    exitConditions: Array<{ subRuleRef: string; reason: string; }>;
    bands: Array<{ upperLimit?: number; lowerLimit?: number; subRuleRef: string; reason: string; }>;
    cases: any[]; // Adjust if you know the structure
  };
  ownerId: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  originatedID: string;
}

export interface GroupedTypology extends ITypology {
  versions: ITypology[]
} 

export const createNetworkMap = (data: any) => {
    return Api.post('/network-map', {...data})
}

export const getTypologies = (page: number) => {
  return Api.get(`/typology?page=${page}&limit=9999 `)
}

export const getTypology = (id: string) => {
  return Api.get(`/typology/${id}`);
}


export const groupTypologies = (typologies: ITypology[]) => {
  const grouped: {[k: string]: GroupedTypology} = {};

  typologies.forEach((typology) => {
    if(grouped[typology.name]) {
      grouped[typology.name] = {
        ...grouped[typology.name],
        versions: [...(grouped[typology.name]?.versions || []), typology]
      }
    } else {
      grouped[typology.name] = {
        ...typology,
        versions: [typology]
      }
    }
  });

  return Object.values(grouped);
}


// MODIFIED: Explicitly encode the ID
export const getRuleById = (id: string) => {
  return Api.get(`/rule/${encodeURIComponent(id)}`);
}

// MODIFIED: Explicitly encode the ID
export const getRuleConfigById = (id: string) => {
  return Api.get(`/rule-config/${encodeURIComponent(id)}`);
}




