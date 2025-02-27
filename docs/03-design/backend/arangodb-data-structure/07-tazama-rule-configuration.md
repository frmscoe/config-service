# Tazama Rule Configuration

## Importing Tazama Rule Configuration

This document demonstrates the sample data of the Tazama Rule Configuration Collection imported from the Configuration Service Rule and Configuration Service Rule Config Collections.

### Configuration Service Rule Collection

This is configuration Service Rule sample data.

```json
{
  "_id": "rules/sample-uuid-3",
  "_key": "sample-uuid-3",
  "_rev": "1234567",
  "cfg": "1.0.0", // We need to explore how to manage x.y.z versioning. Manual in FE?. Do we need default in schema?
  "name": "rule-001", // e.g. "rule-001"
  "desc": "A simple description of the rule",
  "state": "01_DRAFT", // We will implement a state machine
  "dataType": "currency", // Enum
  "createdAt": "2024-01-11T12:00:45.261Z",
  "updatedAt": "2024-01-11T12:00:45.261Z",
  "updatedBy": "admin@example.com",
  "approverId": "admin@example.com",
  "ownerId": "user@example.com",
  "originatedId": null,
  "edited": false,
  "source": "user_created"
}
```

### Configuration Service Rule Config Collection

This is Configuration Service Rule Config sample data.

```json
// Banded Rule Config
{
  "_id": "rule_config/sample-uuid-4",
  "_key": "sample-uuid-4",
  "_rev": "1234567",
  "desc": "Outgoing transfer similarity - amounts",
  "cfg": "1.0.0",
  "state": "01_DRAFT",
  "createdAt": "2024-03-24T10:00:00.000Z",
  "updatedAt": "2024-03-24T12:00:00.000Z",
  "config": {
    "parameters": [
      {
        "ParameterName": "max_query_limit",
        "ParameterValue": 0.1,
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
  },
  "updatedBy": "admin@example.com",
  "approverId": "admin@example.com",
  "ownerId": "user@example.com",
  "ruleId": "rules/sample-uuid-3",
  "originatedId": null,
  "edited": false
}
```

### Tazama Rule Configuration

This is Tazama Rule Configuration sample data created from Configuration Service Rule and Configuration Service Rule Config data.

```json
{
  "_key": "rule-001@1.0.0@1.0.0",
  "id": "rule-001@1.0.0",
  "cfg": "1.0.0",
  "desc": "Outgoing transfer similarity - amounts",
  "config": {
    "parameters": {
      "max_query_limit": 3,
      "tolerance": 0.1
    },
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
  }
}
```
