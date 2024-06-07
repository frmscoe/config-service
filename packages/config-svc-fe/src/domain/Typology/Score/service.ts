import { Api } from "~/client";
import { getRandomNumber } from "~/utils/getRandomNumberHelper";

export const typologyData = {
    "typology_name": "False promotions, phishing, or social engineering scams, such as fraudsters impersonating providers and advising customers they have won a prize in a promotion and to send money to the fraudster's number to claim the prize.",
    "id": "028@1.0.0",
    "cfg": "1.0.0",
    "rules": [
        {
            "id": "003@1.1.0",
            "cfg": "1.1.0",
            "ref": ".01",
            "true": "100",
            "false": "0",
            name: 'rule-001',
        },
        {
            "id": "004@1.1.0",
            "cfg": "1.1.0",
            "ref": ".02",
            "true": "100",
            "false": "0",
            name: 'rule-002',
        },
        {
            "id": "005@1.1.0",
            "cfg": "1.1.0",
            "ref": ".03",
            "true": "100",
            "false": "0",
            name: 'rule-003'
        },
        {
            "id": "006@1.1.0",
            "cfg": "1.1.0",
            "ref": ".00",
            "true": "100",
            "false": "0",
            name: 'rule-004'
        },

        {
            "id": "084@1.0.0",
            "cfg": "1.0.0",
            "ref": ".00",
            "true": "100",
            "false": "0",
            name: 'rule-005'
        },
        {
            "id": "085@1.0.0",
            "cfg": "1.0.0",
            "ref": ".01",
            "true": "100",
            "false": "0",
            name: 'rule-006'
        }
    ],
    "expression": {
        "operator": "+",
        "terms": [
            {
                "id": "003@1.1.0",
                "cfg": "1.1.0"
            },
            {
                "id": "011@1.0.0",
                "cfg": "1.0.0"
            }
        ]
    }
}

export interface ITypology {
    _id: string
    _key: string
    _rev: string
    cfg: string
    createdAt: string
    desc: string
    name: string
    ownerId: string
    rules_rule_configs: RulesRuleConfig[]
    state: string
    typologyCategoryUUID: any[]
    updatedAt: string
    ruleWithConfigs: RuleWithConfig[]
  }
  
  export interface RulesRuleConfig {
    ruleId: string
    ruleConfigId: string[]
  }
  
  export interface RuleWithConfig {
    rule: Rule
    ruleConfigs: RuleConfig[]
  }
  
  export interface Rule {
    _id: string
    _key: string
    name: string
  }
  
  export interface RuleConfig {
    _id: string
    _key: string
    config: Config
  }
  
  export interface Config {
    exitConditions: ExitCondition[]
    bands: Band[]
    cases: Case[]
    parameters: Parameter[]
  }
  
  export interface ExitCondition {
    reason: string
    subRuleRef: string
    outcome: boolean
  }
  
  export interface Band {}
  
  export interface Case {}
  
  export interface Parameter {
    ParameterType: string
    ParameterName: string
  }
  
  
export const getTypology = (id?: string) => {
    return Api.get(`/typology/${id}`);
}

export const config = {
    "bands": [
        {
            "reason": "Band Reason 1",
            "subRuleRef": "0.1",
            "upperLimit": 11864406779,
        },
        {
            "lowerLimit": 99999999999,
            "reason": "adad",
            "subRuleRef": "0.2",
        }
    ],
    "cases": [
        {
            "reason": "Band Reason 2",
            "subRuleRef": "0.1",
            "value": 1
        },
        {
            "reason": "Reason 2",
            "subRuleRef": "0.2",
            "value": 2
        }
    ],
    "exitConditions": [
        {
            "outcome": true,
            "reason": "Insufficient transaction history. At least 50 historical transactions are required",
            "subRuleRef": ".x01",

        },
        {
            "outcome": true,
            "reason": "Insufficient transaction history. At least 50 historical transactions are required",
            "subRuleRef": ".x02",
        },
        {
            "outcome": true,
            "reason": "Insufficient transaction history. At least 50 historical transactions are required",
            "subRuleRef": ".x03",
        },
        {
            "outcome": true,
            "reason": "No variance in transaction history and the volume of recent incoming transactions shows an increase",
            "subRuleRef": ".x04",
        },
        {
            "outcome": true,
            "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
            "subRuleRef": ".x05",
        }
    ],
}