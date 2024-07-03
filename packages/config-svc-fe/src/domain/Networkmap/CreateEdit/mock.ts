export const mockData = [
    {
    "_id": "typology/5a3d7cbf-02e8-458b-b66c-a2ccb1f1fcb7",
    "_key": "5a3d7cbf-02e8-458b-b66c-a2ccb1f1fcb7",
    "_rev": "_h9G87jy---",
    "cfg": "0.1.0",
    "createdAt": "2024-06-07T10:27:10.009Z",
    "desc": "aada",
    "name": "Typology 1",
    "ownerId": "test@gmail.com",
    "rules_rule_configs": [
        {
            "ruleId": "rule/32b24092-ede5-4892-9780-19c08b2badbe",
            "ruleConfigId": [
                "rule_config/4c07cfe2-4a87-4bfc-a056-c69170c2668a"
            ]
        },
        {
            "ruleId": "rule/5e88f0bd-65d1-48f4-b697-de0501c84d4a",
            "ruleConfigId": [
                "rule_config/78f59326-5fa2-44ab-a23a-aeb0945413bf"
            ]
        }
    ],
    "state": "01_DRAFT",
    "typologyCategoryUUID": [],
    "updatedAt": "2024-06-07T10:27:10.009Z",
    "ruleWithConfigs": [
        {
            "rule": {
                "_id": "rule/32b24092-ede5-4892-9780-19c08b2badbe",
                "_key": "32b24092-ede5-4892-9780-19c08b2badbe",
                "name": "rule-001",
                "cfg": "1.0.0"
            },
            "ruleConfigs": [
                {
                    "_id": "rule_config/4c07cfe2-4a87-4bfc-a056-c69170c2668a",
                    "_key": "4c07cfe2-4a87-4bfc-a056-c69170c2668a",
                    "cfg": "2.1.1",
                    "ruleId": "32b24092-ede5-4892-9780-19c08b2badbe",
                    "config": {
                        "exitConditions": [
                            {
                                "reason": "Unsuccessful transaction",
                                "subRuleRef": ".x00",
                                "outcome": true
                            },
                            {
                                "reason": "Insufficient transaction history. At least 50 historical transactions are required",
                                "subRuleRef": ".x01",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions shows an increase",
                                "subRuleRef": ".x03",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "bands": [],
                        "cases": [],
                        "parameters": [
                            {
                                "ParameterType": "number",
                                "ParameterName": "aa"
                            }
                        ]
                    }
                }
            ]
        },
        {
            "rule": {
                "_id": "rule/5e88f0bd-65d1-48f4-b697-de0501c84d4a",
                "_key": "5e88f0bd-65d1-48f4-b697-de0501c84d4a",
                "name": "rule-002",
                "cfg": "1.0.0"
            },
            "ruleConfigs": [
                {
                    "_id": "rule_config/78f59326-5fa2-44ab-a23a-aeb0945413bf",
                    "_key": "78f59326-5fa2-44ab-a23a-aeb0945413bf",
                    "cfg": "2.1.1",
                    "ruleId": "5e88f0bd-65d1-48f4-b697-de0501c84d4a",
                    "config": {
                        "exitConditions": [
                            {
                                "reason": "Unsuccessful transaction",
                                "subRuleRef": ".x00",
                                "outcome": true
                            },
                            {
                                "reason": "Insufficient transaction history. At least 50 historical transactions are required",
                                "subRuleRef": ".x01",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions shows an increase",
                                "subRuleRef": ".x03",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "bands": [
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "cases": [
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "parameters": [
                            {
                                "ParameterType": "number",
                                "ParameterName": "1"
                            }
                        ]
                    }
                }
            ]
        }
    ]
},
{
    "_id": "typology/5a3d7cbf-02e8-458b-b66c-a2ccb1f1f999",
    "_key": "5a3d7cbf-02e8-458b-b66c-a2ccb1f1f999",
    "_rev": "_h9G87jy---",
    "cfg": "0.1.0",
    "createdAt": "2024-06-07T10:27:10.009Z",
    "desc": "aada",
    "name": "Typology 1",
    "ownerId": "test@gmail.com",
    "rules_rule_configs": [
        {
            "ruleId": "rule/32b24092-ede5-4892-9780-19c08b2111",
            "ruleConfigId": [
                "rule_config/4c07cfe2-4a87-4bfc-a056-c69170c26611a"
            ]
        },
        {
            "ruleId": "rule/5e88f0bd-65d1-48f4-b697-de0501c84d4a",
            "ruleConfigId": [
                "rule_config/78f59326-5fa2-44ab-a23a-aeb0945413bf"
            ]
        }
    ],
    "state": "01_DRAFT",
    "typologyCategoryUUID": [],
    "updatedAt": "2024-06-07T10:27:10.009Z",
    "ruleWithConfigs": [
        {
            "rule": {
                "_id": "rule/32b24092-ede5-4892-9780-19c08b2b559",
                "_key": "32b24092-ede5-4892-9780-19c08b2b559",
                "name": "rule-001",
                "cfg": "1.0.0"
            },
            "ruleConfigs": [
                {
                    "_id": "rule_config/4c07cfe2-4a87-4bfc-a056-c69170c2668a",
                    "_key": "4c07cfe2-4a87-4bfc-a056-c69170c2668a",
                    "cfg": "2.1.1",
                    "ruleId": "32b24092-ede5-4892-9780-19c08b2b559",
                    "config": {
                        "exitConditions": [
                            {
                                "reason": "Unsuccessful transaction",
                                "subRuleRef": ".x00",
                                "outcome": true
                            },
                            {
                                "reason": "Insufficient transaction history. At least 50 historical transactions are required",
                                "subRuleRef": ".x01",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions shows an increase",
                                "subRuleRef": ".x03",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "bands": [],
                        "cases": [],
                        "parameters": [
                            {
                                "ParameterType": "number",
                                "ParameterName": "aa"
                            }
                        ]
                    }
                }
            ]
        },
        {
            "rule": {
                "_id": "rule/5e88f0bd-65d1-48f4-b697-de0501c84d4a",
                "_key": "5e88f0bd-65d1-48f4-b697-de0501c84d4a",
                "name": "rule-002",
                "cfg": "1.0.0"
            },
            "ruleConfigs": [
                {
                    "_id": "rule_config/78f59326-5fa2-44ab-a23a-aeb0945413bf",
                    "_key": "78f59326-5fa2-44ab-a23a-aeb0945413bf",
                    "cfg": "2.1.1",
                    "ruleId": "5e88f0bd-65d1-48f4-b697-de0501c84d4a",
                    "config": {
                        "exitConditions": [
                            {
                                "reason": "Unsuccessful transaction",
                                "subRuleRef": ".x00",
                                "outcome": true
                            },
                            {
                                "reason": "Insufficient transaction history. At least 50 historical transactions are required",
                                "subRuleRef": ".x01",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions shows an increase",
                                "subRuleRef": ".x03",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "bands": [
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "cases": [
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "parameters": [
                            {
                                "ParameterType": "number",
                                "ParameterName": "1"
                            }
                        ]
                    }
                }
            ]
        }
    ]
},
{
    "_id": "typology/5a3d7cbf-02e8-458b-b66c-1032",
    "_key": "5a3d7cbf-02e8-458b-b66c-1032",
    "_rev": "_h9G87jy---",
    "cfg": "1.1.3",
    "createdAt": "2024-06-07T10:27:10.009Z",
    "desc": "aada",
    "name": "Typology 2",
    "ownerId": "test@gmail.com",
    "rules_rule_configs": [
        {
            "ruleId": "rule/32b24092-ede5-4892-9780-19c08b2badbe",
            "ruleConfigId": [
                "rule_config/4c07cfe2-4a87-4bfc-a056-c69170c2668a"
            ]
        },
        {
            "ruleId": "rule/5e88f0bd-65d1-48f4-b697-de0501c84d4a",
            "ruleConfigId": [
                "rule_config/78f59326-5fa2-44ab-a23a-aeb0945413bf"
            ]
        }
    ],
    "state": "01_DRAFT",
    "typologyCategoryUUID": [],
    "updatedAt": "2024-06-07T10:27:10.009Z",
    "ruleWithConfigs": [
        {
            "rule": {
                "_id": "rule/32b24092-ede5-4892-9780-19c08b2badbe",
                "_key": "32b24092-ede5-4892-9780-19c08b2badbe",
                "name": "rule-001",
                "cfg": "1.0.0"
            },
            "ruleConfigs": [
                {
                    "_id": "rule_config/4c07cfe2-4a87-4bfc-a056-c69170c2668a",
                    "_key": "4c07cfe2-4a87-4bfc-a056-c69170c2668a",
                    "cfg": "2.1.1",
                    "ruleId": "32b24092-ede5-4892-9780-19c08b2badbe",
                    "config": {
                        "exitConditions": [
                            {
                                "reason": "Unsuccessful transaction",
                                "subRuleRef": ".x00",
                                "outcome": true
                            },
                            {
                                "reason": "Insufficient transaction history. At least 50 historical transactions are required",
                                "subRuleRef": ".x01",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions shows an increase",
                                "subRuleRef": ".x03",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "bands": [],
                        "cases": [],
                        "parameters": [
                            {
                                "ParameterType": "number",
                                "ParameterName": "aa"
                            }
                        ]
                    }
                }
            ]
        },
        {
            "rule": {
                "_id": "rule/5e88f0bd-65d1-48f4-b697-de0501c84d4a",
                "_key": "5e88f0bd-65d1-48f4-b697-de0501c84d4a",
                "name": "rule-002",
                "cfg": "1.0.0"
            },
            "ruleConfigs": [
                {
                    "_id": "rule_config/78f59326-5fa2-44ab-a23a-aeb0945413bf",
                    "_key": "78f59326-5fa2-44ab-a23a-aeb0945413bf",
                    "cfg": "2.1.1",
                    "ruleId": "5e88f0bd-65d1-48f4-b697-de0501c84d4a",
                    "config": {
                        "exitConditions": [
                            {
                                "reason": "Unsuccessful transaction",
                                "subRuleRef": ".x00",
                                "outcome": true
                            },
                            {
                                "reason": "Insufficient transaction history. At least 50 historical transactions are required",
                                "subRuleRef": ".x01",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions shows an increase",
                                "subRuleRef": ".x03",
                                "outcome": true
                            },
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "bands": [
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "cases": [
                            {
                                "reason": "No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average",
                                "subRuleRef": ".x04",
                                "outcome": true
                            }
                        ],
                        "parameters": [
                            {
                                "ParameterType": "number",
                                "ParameterName": "1"
                            }
                        ]
                    }
                }
            ]
        }
    ]
},
]