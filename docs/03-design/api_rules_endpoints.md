# Current Rule APIs

## Current Rule APIs

This documentation provides an explanation of the existing rule endpoints.

<details>
  <summary>GET - Retrieve Rule Configurations `/rule-config` </summary>

- Request Parameters

  - search (string - optional): General search term to filter results.
  - skip (string - optional): Number of records to skip for pagination.
  - limit (string - optional): Maximum number of records to return.
  - sortField (string - optional): Field name to sort by.
  - sortOrder ('ASC' | 'DESC' | 'NONE'): Order of sorting, can be ASC for ascending, DESC for descending, or NONE for no sorting.
  - searchColumn (string - optional): Specific column to apply the search value on.
  - searchOperator (string - optional): Operator used for search (e.g., contains, equals, startWith, etc.).
  - searchValue (optional): Value to search for in the specified column.

- Response

  - Example response

    ```json
    {
      "ruleConfigs": [
        {
          "ruleConfigId": "514cc0de-ddfe-4ca1-8f69-8342e66cbb41",
          "id": "Rule 3",
          "desc": "This is rule 3",
          "cfg": "1.0.0",
          "state": 0,
          "createdAt": "2024-01-11T11:36:20.193Z",
          "updatedAt": "2024-01-11T11:36:20.193Z",
          "config": {
            "parameters": {},
            "exitConditions": [],
            "bands": [
              {
                "id": 4,
                "subRuleRef": ".01",
                "outcome": true,
                "upperLimit": -7776000000,
                "lowerLimit": -99999999999,
                "reason": "90 days ago"
              },
              {
                "id": 5,
                "subRuleRef": ".02",
                "outcome": true,
                "upperLimit": -5184000000,
                "lowerLimit": -7776000000,
                "reason": "60 days ago"
              },
              {
                "id": 6,
                "subRuleRef": ".03",
                "outcome": true,
                "upperLimit": -2592000000,
                "lowerLimit": -5184000000,
                "reason": "30 days ago"
              },
              {
                "id": 7,
                "subRuleRef": ".04",
                "outcome": true,
                "upperLimit": 0,
                "lowerLimit": -2592000000,
                "reason": "now"
              }
            ]
          },
          "rule": {
            "ruleId": "8ce42521-c586-4ed9-ae50-e0155c15cf1f",
            "id": "Rule 3",
            "cfg": "",
            "desc": "This is rule 3",
            "state": 0,
            "dataType": "time",
            "createdAt": "2024-01-11T11:36:20.181Z",
            "updatedAt": "2024-01-11T11:36:20.181Z"
          },
          "__bands__": [
            {
              "id": 4,
              "subRuleRef": ".01",
              "outcome": true,
              "upperLimit": -7776000000,
              "lowerLimit": -99999999999,
              "reason": "90 days ago"
            },
            {
              "id": 5,
              "subRuleRef": ".02",
              "outcome": true,
              "upperLimit": -5184000000,
              "lowerLimit": -7776000000,
              "reason": "60 days ago"
            },
            {
              "id": 6,
              "subRuleRef": ".03",
              "outcome": true,
              "upperLimit": -2592000000,
              "lowerLimit": -5184000000,
              "reason": "30 days ago"
            },
            {
              "id": 7,
              "subRuleRef": ".04",
              "outcome": true,
              "upperLimit": 0,
              "lowerLimit": -2592000000,
              "reason": "now"
            }
          ],
          "__has_bands__": true,
          "dataType": "time",
          "rule_id": "8ce42521-c586-4ed9-ae50-e0155c15cf1f",
          "configState": 0
        },
        {
          "ruleConfigId": "5df52503-01da-42a8-b48f-7719b618f014",
          "id": "5",
          "desc": "Rule 005",
          "cfg": "1.0.0",
          "state": 0,
          "createdAt": "2024-01-11T12:06:42.812Z",
          "updatedAt": "2024-01-11T12:06:42.812Z",
          "config": {
            "parameters": {},
            "exitConditions": [
              {
                "reason": "dasfasf",
                "outcome": false,
                "subRuleRef": ".x01"
              }
            ],
            "bands": []
          },
          "rule": {
            "ruleId": "8c7e9cf0-79d0-442e-a9ae-fb141a4784c1",
            "id": "5",
            "cfg": "",
            "desc": "Rule 005",
            "state": 0,
            "dataType": "currency",
            "createdAt": "2024-01-11T12:03:17.945Z",
            "updatedAt": "2024-01-11T12:03:17.945Z"
          },
          "__bands__": [],
          "__has_bands__": true,
          "dataType": "currency",
          "rule_id": "8c7e9cf0-79d0-442e-a9ae-fb141a4784c1",
          "configState": 0
        }
      ],
      "count": 2
    }
    ```

  - Explanation of keys:

    Status Code: 200 OK

    ```json
    {
      "ruleConfigs": [
        {
          "ruleConfigId": "unique identifier for the rule configuration",
          "id": "human-readable identifier or name for the rule",
          "desc": "description of the rule",
          "cfg": "version or configuration identifier",
          "state": "state code (numeric)",
          "createdAt": "creation timestamp in ISO 8601 format",
          "updatedAt": "last update timestamp in ISO 8601 format",
          "config": {
            "parameters": "object containing configuration parameters",
            "exitConditions": "array of conditions for exiting the rule evaluation",
            "bands": "array of band objects (for types other than 'text')",
            "cases": "array of case objects (specific to 'text' or 'calendar-date-time' data types)"
          },
          "rule": {
            "ruleId": "unique identifier for the rule",
            "id": "human-readable identifier or name for the rule",
            "cfg": "version or configuration identifier",
            "desc": "description of the rule",
            "state": "state code (numeric)",
            "dataType": "type of data the rule applies to (e.g., 'currency', 'time', 'text')",
            "createdAt": "creation timestamp in ISO 8601 format",
            "updatedAt": "last update timestamp in ISO 8601 format"
          },
          "__bands__": "array of bands, if applicable",
          "__has_bands__": "boolean indicating if bands are present",
          "__cases__": "array of cases, if applicable",
          "__has_cases__": "boolean indicating if cases are present",
          "dataType": "type of data the rule applies to",
          "rule_id": "unique identifier for the rule",
          "configState": "state code of the configuration (numeric)"
        }
      ],
      "count": "total number of rule configurations returned"
    }
    ```

      </details>

<details>
  <summary>GET - Retrieve a Specific Rule Configuration `/rule-config/:id`</summary>

- URL Path Parameters

  - id: The unique identifier of the rule configuration to retrieve.

- Response

  - Example response

    ```json
    {
      "ruleConfigId": "514cc0de-ddfe-4ca1-8f69-8342e66cbb41",
      "id": "Rule 3",
      "desc": "This is rule 3",
      "cfg": "1.0.0",
      "state": 0,
      "createdAt": "2024-01-11T11:36:20.193Z",
      "updatedAt": "2024-01-11T11:36:20.193Z",
      "config": {
        "parameters": {},
        "exitConditions": [],
        "bands": [
          {
            "id": 4,
            "subRuleRef": ".01",
            "outcome": true,
            "upperLimit": -7776000000,
            "lowerLimit": -99999999999,
            "reason": "90 days ago"
          },
          {
            "id": 5,
            "subRuleRef": ".02",
            "outcome": true,
            "upperLimit": -5184000000,
            "lowerLimit": -7776000000,
            "reason": "60 days ago"
          },
          {
            "id": 6,
            "subRuleRef": ".03",
            "outcome": true,
            "upperLimit": -2592000000,
            "lowerLimit": -5184000000,
            "reason": "30 days ago"
          },
          {
            "id": 7,
            "subRuleRef": ".04",
            "outcome": true,
            "upperLimit": 0,
            "lowerLimit": -2592000000,
            "reason": "now"
          }
        ]
      },
      "__bands__": [
        {
          "id": 4,
          "subRuleRef": ".01",
          "outcome": true,
          "upperLimit": -7776000000,
          "lowerLimit": -99999999999,
          "reason": "90 days ago"
        },
        {
          "id": 5,
          "subRuleRef": ".02",
          "outcome": true,
          "upperLimit": -5184000000,
          "lowerLimit": -7776000000,
          "reason": "60 days ago"
        },
        {
          "id": 6,
          "subRuleRef": ".03",
          "outcome": true,
          "upperLimit": -2592000000,
          "lowerLimit": -5184000000,
          "reason": "30 days ago"
        },
        {
          "id": 7,
          "subRuleRef": ".04",
          "outcome": true,
          "upperLimit": 0,
          "lowerLimit": -2592000000,
          "reason": "now"
        }
      ],
      "__has_bands__": true,
      "dataType": "time",
      "rule_id": "8ce42521-c586-4ed9-ae50-e0155c15cf1f",
      "configState": 0
    }
    ```

  - Explanation of keys:

    Status Code: 200 OK

    ```json
    {
      "ruleConfigId": "unique identifier for the rule configuration",
      "id": "human-readable identifier or name for the rule",
      "desc": "description of the rule",
      "cfg": "version or configuration identifier",
      "state": "state code (numeric)",
      "createdAt": "creation timestamp in ISO 8601 format",
      "updatedAt": "last update timestamp in ISO 8601 format",
      "config": {
        "parameters": "object containing configuration parameters",
        "exitConditions": "array of conditions for exiting the rule evaluation",
        "bands": "array of band objects (for types other than 'text')",
        "cases": "array of case objects (specific to 'text' or 'calendar-date-time' data types)"
      },
      "rule": {
        "ruleId": "unique identifier for the rule",
        "id": "human-readable identifier or name for the rule",
        "cfg": "version or configuration identifier",
        "desc": "description of the rule",
        "state": "state code (numeric)",
        "dataType": "type of data the rule applies to (e.g., 'currency', 'time', 'text')",
        "createdAt": "creation timestamp in ISO 8601 format",
        "updatedAt": "last update timestamp in ISO 8601 format"
      },
      "__bands__": "array of bands, if applicable",
      "__has_bands__": "boolean indicating if bands are present",
      "__cases__": "array of cases, if applicable",
      "__has_cases__": "boolean indicating if cases are present",
      "dataType": "type of data the rule applies to",
      "rule_id": "unique identifier for the rule",
      "configState": "state code of the configuration (numeric)"
    }
    ```

</details>

<details>
  <summary>POST - Create a Rule Configuration `/rule-config`</summary>

- Request Parameters

  ```json
  {
    "cfg": "string (Required) - Version or configuration identifier",
    "desc": "string (Optional) - Description of the rule",
    "dataType": "string (Optional) - Type of data the rule applies to",
    "config": {
      "bands": [
        {
          "subRuleRef": "string (Required) - Reference to a sub-rule or condition within the band",
          "outcome": "boolean (Required) - Indicates the outcome of the band",
          "upperLimit": "number | null (Optional) - Upper limit value for the band's criteria",
          "lowerLimit": "number | null (Optional) - Lower limit value for the band's criteria",
          "reason": "string (Required) - Description or reason for the band"
        }
      ],
      "cases": [
        {
          "subRuleRef": "string (Required) - Reference to a sub-rule or condition within the case",
          "outcome": "boolean (Required) - Indicates the outcome of the case",
          "value": "string (Required) - Value associated with the case",
          "reason": "string (Required) - Description or reason for the case"
        }
      ],
      "parameters": {
        "evaluationIntervalTime": "number (Optional) - Defines the evaluation interval time in minutes",
        "maxQueryLimit": "number (Optional) - Maximum number of items a single query can retrieve",
        "maxQueryRange": "number (Optional) - Maximum date range that can be queried at once, in days",
        "maxQueryRangeUpstream": "number (Optional) - Maximum upstream query range in days",
        "maxQueryRangeDownstream": "number (Optional) - Maximum downstream query range in days",
        "commission": "number (Optional) - Commission rate as a percentage or fixed amount",
        "minimumNumberOfTransactions": "number (Optional) - Minimum number of transactions required for a rule",
        "tolerance": "number (Optional) - Threshold for acceptable deviation or error in rule calculations"
      },
      "exitConditions": [
        {
          "subRuleRef": "string (Required) - Reference to a sub-rule or condition for exiting",
          "outcome": "boolean (Required) - Indicates the outcome for exiting",
          "reason": "string (Required) - Reason for the exit condition"
        }
      ]
    }
  }
  ```

  - Example Request

  ```json
  {
    "id": "cun-Rule001",
    "cfg": "1.0.0",
    "desc": "Example rule configuration",
    "state": 1,
    "dataType": "currency",
    "config": {
      "bands": [
        {
          "subRuleRef": ".01",
          "outcome": true,
          "upperLimit": 100,
          "lowerLimit": 0,
          "reason": "Example band"
        }
      ],
      "parameters": {
        "evaluationIntervalTime": 30
      },
      "exitConditions": [
        {
          "subRuleRef": ".exit",
          "outcome": false,
          "reason": "Example exit condition"
        }
      ]
    }
  }
  ```

- Response

  - Example Response

    Status Code: 201 Created

    ```json
    {
      "cfg": "1.0.0",
      "config": {
        "parameters": {
          "evaluationIntervalTime": 30
        },
        "exitConditions": [
          {
            "subRuleRef": ".exit",
            "outcome": false,
            "reason": "Example exit condition"
          }
        ]
      },
      "rule": {
        "ruleId": "460b28b1-11ab-4710-8fea-e09807a19e0f",
        "id": "cun-Rule001",
        "cfg": "",
        "desc": "Example rule configuration",
        "state": 1,
        "dataType": "currency",
        "createdAt": "2024-03-22T11:45:58.996Z",
        "updatedAt": "2024-03-22T11:45:58.996Z"
      },
      "ruleConfigId": "27d5a6fa-ae73-44ec-bb19-186d3c9e5821",
      "id": "",
      "desc": "",
      "state": 0,
      "createdAt": "2024-03-22T11:45:59.077Z",
      "updatedAt": "2024-03-22T11:45:59.077Z"
    }
    ```

  - Explanation of keys:

    ```json
    {
      "ruleConfigId": "unique identifier of the rule configuration",
      "id": "human-readable identifier or name for the rule",
      "desc": "description of the rule",
      "cfg": "version or configuration identifier",
      "state": "numeric state code",
      "config": {
        "bands": [
          {
            "subRuleRef": "Reference to a sub-rule or condition within the band. This is a required string value that helps identify the specific condition or sub-rule that a band is related to.",
            "outcome": "Indicates the outcome of the band. This is a required boolean value specifying whether the conditions within the band lead to a positive or negative outcome.",
            "upperLimit": "Upper limit value for the band's criteria. This optional number or null value defines the upper threshold for the band's applicability.",
            "lowerLimit": "Lower limit value for the band's criteria. This optional number or null value sets the lower threshold for when the band's conditions are considered.",
            "reason": "Description or reason for the band. This is a required string value providing context or explanation for the band's purpose or criteria."
          }
        ],
        "cases": [
          {
            "subRuleRef": "Reference to a sub-rule or condition within the case. Similar to bands, this is a required string value identifying the condition or sub-rule related to a case.",
            "outcome": "Indicates the outcome of the case. This required boolean value denotes whether the case leads to a positive or negative outcome.",
            "value": "Value associated with the case. This is a required string value that could represent a specific threshold, identifier, or key aspect relevant to the case.",
            "reason": "Description or reason for the case. This required string provides details or justification for the case's criteria or presence."
          }
        ],
        "parameters": {
          "evaluationIntervalTime": "Defines the evaluation interval time in minutes. This optional number specifies how frequently the rule configuration should be evaluated or checked.",
          "maxQueryLimit": "Maximum number of items a single query can retrieve. This optional number helps limit the scope or size of a query under this rule configuration.",
          "maxQueryRange": "Maximum date range that can be queried at once, in days. This optional number sets limits on how broad a date-based query can be in terms of time span.",
          "maxQueryRangeUpstream": "Maximum upstream query range in days. This optional number specifies how far back in time an upstream query can go.",
          "maxQueryRangeDownstream": "Maximum downstream query range in days. This optional number indicates how far into the future a downstream query can extend.",
          "commission": "Commission rate as a percentage or fixed amount. This optional number could represent a fee, rate, or financial parameter associated with the rule configuration.",
          "minimumNumberOfTransactions": "Minimum number of transactions required for a rule. This optional number sets a threshold for the minimal activity level before the rule applies.",
          "tolerance": "Threshold for acceptable deviation or error in rule calculations. This optional number allows for a margin of error or variance in the rule's application or outcomes."
        },
        "exitConditions": [
          {
            "subRuleRef": "Reference to a sub-rule or condition for exiting. This required string identifies the condition under which an exit or termination of the rule's application occurs.",
            "outcome": "Indicates the outcome for exiting. This required boolean specifies whether the exit condition leads to a termination or another form of conclusion for the rule.",
            "reason": "Reason for the exit condition. This required string provides an explanation or rationale behind the specified exit condition."
          }
        ]
      }
    }
    ```

</details>

<details>
  <summary>PATCH - Update Rule Configuration `/rule-config/:id`</summary>

- Request Parameters

  - URL Path Parameters

    - id: The unique identifier of the rule configuration to be updated.

  - Request Body (Partial updates allowed)

    ```json
    {
      "ruleConfigId": "string (Required) - Unique identifier of the rule configuration being updated.",
      "id": "string (Required) - Human-readable identifier or name for the rule.",
      "cfg": "string (Required) - Version or configuration identifier.",
      "desc": "string (Optional) - Description of the rule.",
      "state": "number (Optional) - Numeric state code.",
      "dataType": "string (Optional) - Type of data the rule applies to.",
      "rule_id": "string (Optional) - Unique identifier of the rule this configuration belongs to.",
      "versionUpdateType": "string (Optional) - Specifies whether the version update is 'minor' or 'major'.",
      "config": {
        "bands": [
          {
            "id": "number (Optional) - Unique identifier for the band, required if updating an existing band.",
            "subRuleRef": "string (Required) - Reference to a sub-rule or condition within the band.",
            "outcome": "boolean (Required) - Indicates the outcome of the band.",
            "upperLimit": "number | null (Optional) - Upper limit value for the band's criteria.",
            "lowerLimit": "number | null (Optional) - Lower limit value for the band's criteria.",
            "reason": "string (Required) - Description or reason for the band."
          }
        ],
        "cases": [
          {
            "id": "number (Optional) - Unique identifier for the case, required if updating an existing case.",
            "subRuleRef": "string (Required) - Reference to a sub-rule or condition within the case.",
            "outcome": "boolean (Required) - Indicates the outcome of the case.",
            "value": "string (Required) - Value associated with the case.",
            "reason": "string (Required) - Description or reason for the case."
          }
        ],
        "parameters": {
          // Similar to request parameters provided earlier
        },
        "exitConditions": [
          {
            "subRuleRef": "string (Required) - Reference to a sub-rule or condition for exiting.",
            "outcome": "boolean (Required) - Indicates the outcome for exiting.",
            "reason": "string (Required) - Reason for the exit condition."
          }
        ]
      }
    }
    ```

  - Example Request

    ```json
    {
      "ruleConfigId": "ba82b22e-22ba-404a-b494-c80065738d80",
      "id": "cun-22-march 2",
      "cfg": "1.1.1",
      "desc": "cun-22-march-description 2",
      "state": 0,
      "dataType": "numeric",
      "config": {
        "parameters": {
          "evaluationIntervalTime": 30,
          "maxQueryLimit": 100,
          "maxQueryRange": 365,
          "maxQueryRangeUpstream": 30,
          "maxQueryRangeDownstream": 60,
          "commission": 5,
          "minimumNumberOfTransactions": 10,
          "tolerance": 2
        },
        "exitConditions": [
          {
            "subRuleRef": ".exit",
            "outcome": false,
            "reason": "Example exit condition"
          }
        ],
        "bands": [
          {
            "subRuleRef": ".01",
            "outcome": true,
            "upperLimit": 1000,
            "lowerLimit": 500,
            "reason": "Example band for testing"
          }
        ]
      },
      "rule_id": "14ca3970-8b75-4ce2-bceb-4779f9a8ef23"
    }
    ```

  - Explanation of request parameter

    ```json
    {
      "ruleConfigId": "string (Required) - Unique identifier of the rule configuration being updated.",
      "id": "string (Required) - Human-readable identifier or name for the rule.",
      "cfg": "string (Required) - Version or configuration identifier.",
      "desc": "string (Optional) - Description of the rule.",
      "state": "number (Optional) - Numeric state code.",
      "dataType": "string (Optional) - Type of data the rule applies to.",
      "rule_id": "string (Optional) - Unique identifier of the rule this configuration belongs to.",
      "versionUpdateType": "string (Optional) - Specifies whether the version update is 'minor' or 'major'.",
      "config": {
        "bands": [
          {
            "subRuleRef": "string (Required) - Reference to a sub-rule or condition within the band.",
            "outcome": "boolean (Required) - Indicates the outcome of the band.",
            "upperLimit": "number | null (Optional) - Upper limit value for the band's criteria.",
            "lowerLimit": "number | null (Optional) - Lower limit value for the band's criteria.",
            "reason": "string (Required) - Description or reason for the band."
          }
        ],
        "cases": [
          {
            "subRuleRef": "string (Required) - Reference to a sub-rule or condition within the case.",
            "outcome": "boolean (Required) - Indicates the outcome of the case.",
            "value": "string (Required) - Value associated with the case.",
            "reason": "string (Required) - Description or reason for the case."
          }
        ],
        "parameters": {
          // Similar to request parameters provided earlier
        },
        "exitConditions": [
          {
            "subRuleRef": "string (Required) - Reference to a sub-rule or condition for exiting.",
            "outcome": "boolean (Required) - Indicates the outcome for exiting.",
            "reason": "string (Required) - Reason for the exit condition."
          }
        ]
      }
    }
    ```

- Response

  - Example Response

    Status Code: 200 OK

    ```json
    {
      "message": "Rule configuration updated successfully",
      "updatedRuleConfig": {
        // The updated rule configuration object
      }
    }
    ```

</details>

