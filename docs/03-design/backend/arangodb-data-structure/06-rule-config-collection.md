<!-- SPDX-License-Identifier: Apache-2.0 -->
# Rule Config Collection

## Rule Config Collection

The Rule Config Collection within this ArangoDB structure is designed to store and manage different rule configs.

```json
// Banded Rule Config
{
  "_id": "rule_config/sample-uuid-4",
  "_key": "sample-uuid-4",
  "_rev": "1234567",
  "desc": "Outgoing transfer similarity - amounts",
  "cfg": "1.0.0", // We need to explore how to manage x.y.z versioning. Manual in FE?. Do we need default in schema?
  "state": "01_DRAFT", // We will implement a state machine.
  "createdAt": "2024-03-24T10:00:00.000Z",
  "updatedAt": "2024-03-24T12:00:00.000Z",
  "config": {
    "parameters": [
      {
        "ParameterName": "max_query_limit",
        "ParameterValue": 0.1,
        "ParameterType": "number"
      },
      {
        "ParameterName": "tolerance",
        "ParameterValue": 30,
        "ParameterType": "number"
      }
    ],
    "exitConditions": [
      {
        "subRuleRef": ".x00",
        "reason": "Incoming transaction is unsuccessful"
      }
    ],
    "bands": [
      {
        "subRuleRef": ".01",
        "upperLimit": 2,
        "reason": "No similar amounts detected in the most recent transactions from the debtor"
      }
    ]
  }, // This can be structured as per config object to cover all possible types?
  "updatedBy": "admin@example.com",
  "approverId": "admin@example.com",
  "ownerId": "user@example.com",
  "ruleId": "rule/sample-uuid-3",
  "originatedId": null,
  "edited": false
}
```

```json
// Cased Rule Config
{
  "_id": "rule_config/sample-uuid-5",
  "_key": "sample-uuid-5",
  "_rev": "1234567",
  "desc": "Transaction type identification",
  "cfg": "1.0.0", // We need to explore how to manage x.y.z versioning. Manual in FE?. Do we need default in schema?
  "state": "01_DRAFT", // We will implement a state machine.
  "createdAt": "2024-03-25T08:30:00.000Z",
  "updatedAt": "2024-03-25T09:00:00.000Z",
  "config": {
    "parameters": [
      {
        "ParameterName": "max_query_limit",
        "ParameterValue": 0.1,
        "ParameterType": "number"
      }
    ],
    "exitConditions": [],
    "cases": [
      {
        "subRuleRef": ".00",
        "reason": "The transaction type is not defined in this rule configuration",
        "value": "UNDEFINED"
      },
      {
        "subRuleRef": ".01",
        "value": "WITHDRAWAL",
        "reason": "The transaction is identified as a cash withdrawal"
      }
    ]
  }, // This can be structured as per config object to cover all possible types?
  "updatedBy": "admin@example.com",
  "approverId": "admin@example.com",
  "ownerId": "user@example.com",
  "ruleId": "rule/sample-uuid-3",
  "originatedId": null,
  "edited": false
}
```

### Rule Config Document Fields Explanation

This section outlines the key attributes of a document within the Rule Config Collection.

- **\_key(string)**: A unique UUID for identifying each rule config distinctly.
- **desc(string)**: A textual description of the rule configuration.
- **cfg(string)**: A x.y.z versioning for the rule config, useful for managing updates or changes to the rule config logic.
- **state(string)**: A string (or potentially an enum) indicating the state of the rule config.
- **createdAt(string)**: Timestamp indicating when the rule config was initially created, with timezone information.
- **updatedAt(string)**: Timestamp indicating when the rule config was last updated, with timezone information.
- **config**: A JSON object that can either contain parameters and exitConditions along with either bands or cases to define the rule logic.
  - **parameters**: Defines operational parameters for the rule, like thresholds or time frames.
    - **ParameterName(string)**: The name of the parameter.
    - **ParameterValue(number or string)**: The value of the parameter.
    - **ParameterType(string)**: The type of the parameter, like "number" or "string".
  - **exitConditions**: Specifies conditions under which the rule exits without a definitive outcome.
  - **bands**: Defines banded results for the rule, specifying outcome bands based on numerical thresholds.
  - **cases**: Defines explicit case results for the rule, specifying outcomes based on matching explicit values.
- **updatedBy(string)**: The identifier for the user who last updated the rule config, Obtained from parsing a JWT token.
- **approverId(string)**: The identifier for the user who approved the rule config, Obtained from parsing a JWT token.
- **ownerId(string)**: The identifier for the owner of the rule config. Obtained from parsing a JWT token.
- **ruleId(string)**: This field holds the `_id` of a rule document from the rules collection.
- **originatedId(string)**: The identifier for the rule that this rule (UUID of the rule) originated from. This is useful for tracking the lineage of a rule.
- **edited(boolean)**: A boolean indicating whether the rule has been edited or not.

### Rule Config Collection schema

```json
{
  schema: {
    rule: {
      level: 'moderate',
      properties: {
        _key: { type: 'string' },
        desc: { type: 'string', maxLength: 255 },
        cfg: { type: 'string' },
        state: {
          type: 'string',
          enum: Object.values(StateEnum),
          default: StateEnum['01_DRAFT'],
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        updatedBy: { type: 'string' },
        approverId: { type: 'string' },
        ownerId: { type: 'string' },
        ruleId: { type: 'string' },
        originatedID: { type: 'string', default: null },
        edited: { type: 'boolean', default: false },
        config: {
          type: ['object', 'null'],
          properties: {
            parameters: {
              type: ['array', 'null'],
              items: {
                type: ['object', 'null'],
                properties: {
                  ParameterName: { type: 'string' },
                  ParameterValue: { type: ['string', 'number'] },
                  ParameterType: { type: 'string' },
                },
              },
            },
            exitConditions: {
              type: ['array', 'null'],
              items: {
                type: ['object', 'null'],
                properties: {
                  subRuleRef: { type: 'string' },
                  reason: { type: 'string' },
                },
              },
            },
            bands: {
              type: ['array', 'null'],
              items: {
                type: ['object', 'null'],
                properties: {
                  subRuleRef: { type: 'string' },
                  upperLimit: { type: ['number', 'string', 'null'] },
                  lowerLimit: { type: ['number', 'string', 'null'] },
                  reason: { type: 'string' },
                },
              },
            },
            cases: {
              type: ['array', 'null'],
              items: {
                type: ['object', 'null'],
                properties: {
                  subRuleRef: { type: 'string' },
                  value: { type: ['string', 'number'] },
                  reason: { type: 'string' },
                },
              },
            },
          },
        },
      },
      additionalProperties: false,
    },
  },
  computedValues: [
    {
      name: 'createdAt',
      expression: 'RETURN DATE_ISO8601(DATE_NOW())',
      computeOn: ['insert'],
      overwrite: false,
    },
    {
      name: 'updatedAt',
      expression: 'RETURN DATE_ISO8601(DATE_NOW())',
      computeOn: ['insert', 'update'],
      overwrite: true,
    },
  ],
}
```

### Handling Bands and Cases in Front End

On the front end, we need to provide a selection mechanism (like a dropdown or radio buttons) that allows the user to choose between "Band" and "Case". Based on this selection, dynamically render the input fields relevant to either bands or cases.

Band Selection: If the user selects "Band", display fields like subRuleRef, upperLimit, lowerLimit and reason.
Case Selection: If "Case" is selected, display fields like subRuleRef, value and reason.

