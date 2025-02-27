# Rule Collection

## Rule Collection

The Rule Collection within this ArangoDB structure is designed to store and manage different rules.

```json
{
  "_id": "rule/sample-uuid-3",
  "_key": "sample-uuid-3",
  "_rev": "1234567",
  "cfg": "1.0.0", // We need to explore how to manage x.y.z versioning. Manual in FE?. Do we need default in schema?
  "name": "rule-001", // e.g. "rule-001". Max length 10 characters.
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

### Rule Document Fields Explanation

This section outlines the key attributes of a document within the Rule Collection.

- **\_key(string)**: A unique UUID for identifying each rule distinctly.
- **cfg(string)**: A x.y.z versioning for the rule, useful for managing updates or changes to the rule logic.
- **name(string)**: A name for the rule, providing a simple identifier for the rule. Max length 10 characters.
- **desc(string)**: A description of the rule, providing more detailed information about its purpose or criteria.
- **state(string)**: An enum indicating the state of the rule.
- **dataType(string)**: An enum indicating the dataType of the cases or bands. Enum values are Currency, Numeric, Time, Calendar Date Time and Text.
- **createdAt(string)**: Timestamp indicating when the rule was initially created, with timezone information.
- **updatedAt(string)**: Timestamp indicating when the rule was last updated, with timezone information.
- **updatedBy(string)**: The identifier for the user who last updated the rule, Obtained from parsing a JWT token.
- **approverId(string)**: The identifier for the user who approved the rule, Obtained from parsing a JWT token.
- **ownerId(string)**: The identifier for the owner of the rule. Obtained from parsing a JWT token.
- **originatedId(string)**: The identifier for the rule that this rule (UUID of the rule) originated from. This is useful for tracking the lineage of a rule.
- **edited(boolean)**: A boolean indicating whether the rule has been edited or not.
- **source()**: The source of the rule, which could be from user_created, user_imported or calibration_service

### Rule Collection schema

```json
{
  schema: {
    rule: {
      level: "moderate", // Info about level -> https://docs.arangodb.com/3.11/concepts/data-structure/documents/schema-validation/#levels
      properties: {
        _key: { type: "string" },
        cfg: { type: "string" },
        name: { type: 'string' },
        desc: { type: "string" },
        dataType: {
          type: "string",
          enum: Object.values(DataTypeEnum),
        },
        state: {
          type: "string",
          enum: Object.values(StateEnum),
          default: StateEnum["01_DRAFT"],
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        updatedBy: { type: "string" },
        approverId: { type: "string" },
        ownerId: { type: "string" },
        originatedId: { type: "string", default: null },
        edited: { type: "boolean", default: false },
        source: {
          type: "string",
          enum: Object.values(SourceEnum),
        },
      },
      required: ["name", "cfg", "dataType", "state", "desc", "ownerId"],
      additionalProperties: false,
    },
  },
  computedValues: [
    {
      name: "createdAt",
      expression: "RETURN DATE_ISO8601(DATE_NOW())",
      computeOn: ["insert"],
      overwrite: false,
    },
    {
      name: "updatedAt",
      expression: "RETURN DATE_ISO8601(DATE_NOW())",
      computeOn: ["insert", "update"],
      overwrite: true,
    },
  ],
}
```
