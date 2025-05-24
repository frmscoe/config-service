export interface IParameter {
  ParameterName: string;
  ParameterType: string;
  ParameterValue: any;
}

export interface IBand {
  subRuleRef: string;
  lowerLimit: number;
  upperLimit: number;
  reason: string;
}

export interface ICase {
  subRuleRef: string;
  value: string;
  reason: string;
}

export interface IExitCondition {
  subRuleRef: string;
  reason: string;
}

export interface IRuleConfig {
  cfg: string;
  desc: string;
  ruleId: string;
  config: {
    parameters: IParameter[];
    bands: IBand[];
    cases: ICase[];
    exitConditions: IExitCondition[];
  };
  ownerId: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFullRule {
  _key: string;
  _id: string;
  _rev: string;
  cfg: string;
  desc: string;
  name: string;
  dataType: string;
  ownerId: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  ruleConfigs: IRuleConfig[]; // properly typed now
}
