# Typology Category Collection

## Typology Category Collection

The Typology Category Collection within this ArangoDB structure is designed to store and manage different category of typologies.

```json
{
  "_id": "typology_categories/sample-uuid-7",
  "_key": "sample-uuid-7",
  "_rev": "14253647",
  "name": "Fraud",
  "createdAt": "2023-12-08 15:30:00.000",
  "updatedAt": "2023-12-08 15:30:00.000",
  "updatedBy": "admin@example.com",
  "approverId": "admin@example.com",
  "ownerId": "user@example.com",
  "referenceId": "1"
}
```

### Typology Category Document Fields Explanation

This section outlines the key attributes of a document within the Typology Category Collection.

- **\_key()**: A unique UUID for identifying each typology category distinctly.
- **name(string)**: Describes the category, e.g., "Fraud", indicating the nature of the typology.
- **createdAt(string)**: Timestamp indicating when the typology was initially created, with timezone information.
- **updatedAt(string)**: Timestamp indicating when the typology was last updated, with timezone information.
- **updatedBy(string)**: The identifier for the user who last updated the category, Obtained from parsing a JWT token.
- **approverId(string)**: The identifier for the user who approved the category, Obtained from parsing a JWT token.
- **ownerId(string)**: The identifier for the owner of the category. Obtained from parsing a JWT token.
- **referenceId(string)**: The identifier for the existing imported categories.

### Typology Category Collection schema

```json
{
  "typologyCategory": {
    "level": "moderate", // Info about level -> https://docs.arangodb.com/3.11/concepts/data-structure/documents/schema-validation/#levels
    "properties": {
      "_key": { "type": "string" }, // The _key is always a string, even if sequential or numeric in nature
      "name": { "type": "string", "minLength": 1 }, // The name is a non-empty string
      "createdAt": { "type": "string", "format": "date-time" }, // Date-time format for createdAt
      "updatedAt": { "type": "string", "format": "date-time" }, // Date-time format for updatedAt
      "updatedBy": { "type": "string" },
      "approverId": { "type": "string" }, // User identifiers are strings; could be UUIDs or numeric strings
      "ownerId": { "type": "string" },
      "referenceId": { "type": "string" }
    },
    "required": ["_key", "name", "ownerId"],
    "computedValues": [
      {
        "name": "createdAt",
        "expression": "RETURN DATE_ISO8601(DATE_NOW())",
        "overwrite": false,
        "computeOn": ["insert"]
      },
      {
        "name": "updatedAt",
        "expression": "RETURN DATE_ISO8601(DATE_NOW())",
        "overwrite": true,
        "computeOn": ["insert", "update"]
      }
    ],
    "additionalProperties": false // Prevents documents from having fields not specified in the schema
  }
}
```
