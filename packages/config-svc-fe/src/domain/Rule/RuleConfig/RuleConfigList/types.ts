export interface ExitCondition {
    subRuleRef: string;
    outcome: boolean;
    reason: string;
}

export interface Band {
    subRuleRef: string;
    upperLimit: number;
    outcome: boolean;
    reason: string;
}

export interface Case {
    subRuleRef: string;
    value: string;
    outcome: boolean;
    reason: string;
}

export interface Parameters {
    maxQueryLimit: number;
    tolerance: number;
}

export interface Config {
    parameters: Parameters;
    exitConditions: ExitCondition[];
    bands: Band[];
    case: Case[];
}

export interface IRuleConfig {
    _key: string;
    _id: string;
    _rev: string;
    cfg: string;
    state: string;
    desc: string;
    ruleId: string;
    config: Config;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}
