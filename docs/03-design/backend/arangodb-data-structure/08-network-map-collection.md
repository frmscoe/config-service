<!-- SPDX-License-Identifier: Apache-2.0 -->
# Network Map Collection

## Network Map Collection

The Network Map Collection within this ArangoDB structure is designed to control the routing of a transaction for evaluation, containing nested control information for transactions, typologies, and rules.

Sample Network Map

```json
{
  "_id": "network_map/sample-uuid-11",
  "_key": "sample-uuid-11",
  "_rev": "1234567",
  "active": true,
  "cfg": "1.0.0",
  "state": "01_DRAFT",
  "events": [
    {
      "eventId": "event/sample-uuid-22", // This is the _id of the event document from the events collection. The event collection will store static information about the event
      "typologies": [
        {
          "id": "Typology Processor 1@1.0.0", // we might remove that
          "name": "Typology Processor 1",
          "cfg": "1.0.0",
          "active": true,
          "rulesWithConfigs": [
            {
              "rule": {
                "_id": "rule/sample-uuid-3",
                "_key": "sample-uuid-3",
                "name": "Rule 3",
                "cfg": "1.0.0"
              },
              "ruleConfigs": [
                {
                  "_id": "rule_config/sample-uuid-4",
                  "_key": "sample-uuid-4",
                  "cfg": "1.0.0"
                },
                {
                  "_id": "rule_config/sample-uuid-5",
                  "_key": "sample-uuid-5",
                  "cfg": "1.0.0"
                }
              ]
            }
          ]
        },
        {
          "id": "Typology Processor 2@2.0.0", // we might remove that
          "name": "Typology Processor 2",
          "cfg": "2.0.0",
          "active": false,
          "rulesWithConfigs": [
            {
              "rule": {
                "_id": "rule/sample-uuid-4",
                "_key": "sample-uuid-4",
                "name": "Rule 4",
                "cfg": "1.0.0"
              },
              "ruleConfigs": [
                {
                  "_id": "rule_config/sample-uuid-6",
                  "_key": "sample-uuid-6",
                  "cfg": "1.0.0"
                },
                {
                  "_id": "rule_config/sample-uuid-7",
                  "_key": "sample-uuid-7",
                  "cfg": "1.0.0"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "002@1.0.0",
      "cfg": "1.0.0",
      "txTp": "pacs.003.004.13",
      "typologies": [
        {
          "id": "Typology Processor 3@1.0.0", // we might remove that
          "name": "Typology Processor 3",
          "cfg": "1.0.0",
          "active": true,
          "rulesWithConfigs": [
            {
              "rule": {
                "_id": "rule/sample-uuid-4",
                "_key": "sample-uuid-4",
                "name": "Rule 4",
                "cfg": "1.0.0"
              },
              "ruleConfigs": [
                {
                  "_id": "rule_config/sample-uuid-6",
                  "_key": "sample-uuid-6",
                  "cfg": "1.0.0"
                },
                {
                  "_id": "rule_config/sample-uuid-7",
                  "_key": "sample-uuid-7",
                  "cfg": "1.0.0"
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "createdAt": "2024-06-17T11:52:38.261Z",
  "updatedAt": "2024-06-17T11:52:38.261Z",
  "updatedBy": "admin@example.com",
  "approverId": "admin@example.com",
  "ownerId": "user@example.com",
  "originatedId": null,
  "edited": false,
  "referenceId": 1,
  "source": "user_created"
}
```

### Network Map Document Fields Explanation

This section outlines the key attributes of a document within the Network Map Collection.

- **\_key(string)**: A unique UUID for identifying each network map distinctly.
- **active(boolean)**: A boolean indicating whether the network map is active or not.
- **cfg(string)**: A x.y.z versioning for the network map, useful for managing updates or changes to the network map logic.
- **state(string)**: An enum indicating the state of the network map.
- **events(array)**: An array of objects, each containing the transaction type, typologies, and rules associated with the transaction.
- **eventId(string)**: This field holds the `_id` of a event document from the events collection.
- **typologies(array)**: An array of objects, each containing the typology processor, rules, and rule configurations associated with the typology processor.
- **name(string)**: The name of the typology processor.
- **id(string)**: The Typology Processor name (e.g. “001”) and version (e.g. “1.0.0”) separated by an “@”, i.e. “001@1.0.0”.
- **cfg(string)**: The version of the configuration that would drive the behaviour of the Typology Processor for the transaction.
- **active(boolean)**: A boolean indicating whether the typology processor is active or not.
- **rulesWithConfigs(array)**: An array of objects, each containing the rule and rule configurations associated with the typology processor.
- **rule(object)**: An object containing the rule associated with the typology processor.
- **\_id(string)**: The `_id` of a rule document from the rules collection.
- **\_key(string)**: The `_key` of a rule document from the rules collection.
- **name(string)**: The name of the rule.
- **cfg(string)**: The version of the configuration that would drive the behaviour of the Rule Processor for the transaction.
- **ruleConfigs(array)**: An array of objects, each containing the rule configuration associated with the rule.
- **\_id(string)**: The `_id` of a rule config document from the rule configurations collection.
- **\_key(string)**: The `_key` of a rule config document from the rule configurations collection.
- **cfg(string)**: The version of the configuration that would drive the behaviour of the Rule Processor for the transaction.
- **createdAt(string)**: Timestamp indicating when the network map was initially created, with timezone information.
- **updatedAt(string)**: Timestamp indicating when the network map was last updated, with timezone information.
- **updatedBy(string)**: The identifier for the user who last updated the network map, Obtained from parsing a JWT token.
- **approverId(string)**: The identifier for the user who approved the network map, Obtained from parsing a JWT token.
- **ownerId(string)**: The identifier for the owner of the network map. Obtained from parsing a JWT token.
- **originatedId(string)**: The identifier for the network map that this network map (UUID of the network map) originated from. This is useful for tracking the lineage of a network map.
- **edited(boolean)**: A boolean indicating whether the network map has been edited or not.
- **referenceId(number)**: The identifier for the existing imported network maps. The Network Map processor ID in the source system.
- **source()**: The source of the network map, which could be from user_created or user_imported.

### Network Map Collection schema

```json
{
  "schema": {
    "rule": {
      "level": "moderate",
      "properties": {
        "_id": { "type": "string" },
        "_key": { "type": "string" },
        "_rev": { "type": "string" },
        "active": { "type": "boolean" },
        "cfg": { "type": "string" },
        "state": { "type": "string" },
        "events": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "eventId": { "type": "string" },
              "typologies": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "id": { "type": "string" },
                    "name": { "type": "string" },
                    "cfg": { "type": "string" },
                    "active": { "type": "boolean" },
                    "rulesWithConfigs": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "rule": {
                            "type": "object",
                            "properties": {
                              "_id": { "type": "string" },
                              "_key": { "type": "string" },
                              "name": { "type": "string" },
                              "cfg": { "type": "string" }
                            }
                          },
                          "ruleConfigs": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "_id": { "type": "string" },
                                "_key": { "type": "string" },
                                "cfg": { "type": "string" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "createdAt": { "type": "string", "format": "date-time" },
        "updatedAt": { "type": "string", "format": "date-time" },
        "updatedBy": { "type": "string" },
        "approverId": { "type": "string" },
        "ownerId": { "type": "string" },
        "originatedId": { "type": "string", "default": null },
        "edited": { "type": "boolean", "default": false },
        "referenceId": { "type": "number", "default": null },
        "source": { "type": "string" }
      },
      "additionalProperties": false
    }
  },
  "computedValues": [
    {
      "name": "createdAt",
      "expression": "RETURN DATE_ISO8601(DATE_NOW())",
      "computeOn": ["insert"],
      "overwrite": false
    },
    {
      "name": "updatedAt",
      "expression": "RETURN DATE_ISO8601(DATE_NOW())",
      "computeOn": ["insert", "update"],
      "overwrite": true
    }
  ]
}
```

## Importing Tazama Network Map

The Tazama Network Map is imported from the Configuration Service Network Map, Typology Processor, and Rule Processor Collections.

### Example of imported Network Map

```json
{
  "active": true,
  "cfg": "1.0.0",
  "messages": [
    {
      "id": "004@1.0.0", // The Transaction Aggregation and Decisioning Processor name (e.g. “001”) and version (e.g. “1.0.0”) separated by an “@”, i.e. “001@1.0.0”
      "cfg": "1.0.0", // The version of the configuration that would drive the behaviour of the Transaction Aggregation and Decisioning Processor for the transaction.
      "txTp": "pacs.002.001.12", // the ISO 20022 message definition ID for the message that will be evaluated in the channels and using the typologies and rules defined in the Network Map under that transaction object.
      "typologies": [
        {
          "id": "typology_processor@1.0.0", // The Typology Processor name (e.g. “001”) and version (e.g. “1.0.0”) separated by an “@”, i.e. “001@1.0.0”
          "cfg": "1.0.0", // The version of the configuration that would drive the behaviour of the Typology Processor for the transaction
          "rules": [
            {
              "id": "006@1.0.0", // The Rule Processor name (e.g. “006”) and version (e.g. “1.0.0”) separated by an “@”, i.e. “006@1.0.0”
              "cfg": "1.0.0" // The version of the configuration that would drive the behaviour of the Rule Processor for the transaction
            },
            {
              "id": "078@1.0.0",
              "cfg": "1.0.0"
            }
          ]
        }
      ]
    }
  ]
}
```
