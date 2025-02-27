<!-- SPDX-License-Identifier: Apache-2.0 -->
# Typology Collection

## Typology Collection

The Typology Collection within this ArangoDB structure is designed to store and manage different typologies.
Typology can have no rules but it cannot be approved without rules that have been approved.
A rule can have no ruleConfigs but it cannot be approved without ruleConfigs that have been approved.

```json
{
  "_id": "typology/sample-uuid-1",
  "_key": "sample-uuid-1",
  "_rev": "1234567",
  "name": "Identity theft I",
  "cfg": "1.0.0", // Versioning for typology configuration version will be managed manually in the Front End
  "desc": "Identity theft I",
  "state": "01_DRAFT", // Implement a state machine.
  "typologyCategoryUUID": [
    "typology_categories/sample-uuid-7",
    "typology_categories/sample-uuid-10"
  ],
  "rules_rule_configs": [
    // array of rules and associated ruleConfigs
    {
      "ruleId": "rule/sample-uuid-3",
      "ruleConfigId": ["rule_config/sample-uuid-4", "rule_config/sample-uuid-5"]
    },
    {
      "ruleId": "rule/sample-uuid-5",
      "ruleConfigId": ["rule_config/sample-uuid-6"]
    }
  ],
  "createdAt": "2023-12-08T15:30:00.000Z",
  "updatedAt": "2024-01-11T13:06:32.000Z",
  "updatedBy": "admin@example.com",
  "approverId": "admin@example.com",
  "ownerId": "user@example.com",
  "referenceId": 1,
  "originatedId": null,
  "edited": false
}
```

### Typology Document Fields Explanation

This section outlines the key attributes of a document within the Typology Collection.

- **\_key(string)**: A unique UUID for identifying each typology distinctly.
- **name(string)**: The name of the typology, describing the type of activity being modeled.
- **cfg(string)**: A x.y.z versioning for the typology configuration, useful for managing updates or changes to the typology logic.
- **desc(string)**: A description of the typology, providing more detailed information about its purpose or criteria.
- **state(string)**: A string (an enum) indicating the state of the typology.
- **typologyCategoryUUID**: An array of typology category UUIDs that the typology belongs to.
- **rules_rule_configs**: An array of objects, each containing a ruleId and an array of ruleConfigIds. This array represents the rules and ruleConfigs associated with the typology.
- **ruleId**: This field holds the `_id` of a rule document from the rules collection.
- **ruleConfigId**: This field holds the `_id` of a rule config document from the rule configurations collection.
- **createdAt(string)**: Timestamp indicating when the typology was initially created, with timezone information.
- **updatedAt(string)**: Timestamp indicating when the typology was last updated, with timezone information.
- **updatedBy(string)**: The identifier for the user who last updated the typology, Obtained from parsing a JWT token.
- **approverId(string)**: The identifier for the user who approved the category, Obtained from parsing a JWT token.
- **ownerId(string)**: The identifier for the owner of the category. Obtained from parsing a JWT token.
- **referenceId(number)**: The identifier for the existing imported typologies. The Typology processor ID in the source system.
- **originatedId(string)**: The identifier for the typology that this typology (UUID of the typology) originated from. This is useful for tracking the lineage of a typology.
- **edited(boolean)**: A boolean flag indicating whether the typology has been edited or not.

### Typology Collection schema

```json
{
  schema: {
    rule: {
      level: 'moderate', // Ensures moderate level validation according to ArangoDB documentation
      properties: {
        _key: { type: 'string' },
        name: { type: 'string' },
        cfg: { type: 'string' },
        desc: { type: 'string' },
        state: {
          type: 'string',
          enum: Object.values(StateEnum),
          default: StateEnum['01_DRAFT'],
        },
        typologyCategoryUUID: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Array of typology category identifiers that the typology belongs to.',
        },
        rules_rule_configs: {
          type: 'array',
          description:
            'An array of objects linking this typology to specific rules and their configurations. Each object contains a ruleId and an array of associated ruleConfigIds, establishing a direct connection between the typology and its applicable rules and settings.',
          items: {
            type: 'object',
            properties: {
              ruleId: { type: 'string' },
              ruleConfigId: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        updatedBy: { type: 'string' },
        approverId: { type: 'string' },
        ownerId: { type: 'string' },
        referenceId: {
          type: 'number',
          default: null,
          description:
            'The identifier for the existing imported typologies. The Typology processor ID in the source system.',
        },
        originatedId: { type: 'string', default: null },
        edited: { type: 'boolean', default: false }, // Newly added field to track if the document has been edited
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
