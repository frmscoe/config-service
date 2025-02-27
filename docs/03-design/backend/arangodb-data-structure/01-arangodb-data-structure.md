# Configuration Service Database Structure

## Configuration Service Database Structure in ArangoDB

This documentation refers to the design and organization of databases within ArangoDB specifically for a configuration service.

We need to note that in ArangoDB all documents contain special attributes at the top level that start with an underscore, known as **system attributes**:

```json
// Example system attributes data of users collection
{
  "_id": "users/3456789",
  "_key": "3456789",
  "_rev": "14253647",
  ...
}
```

- The **document key** is stored as a string in the `_key` attribute. We will be using UUIDs to populate this field.
- The **document identifier** is stored as a string in the `_id` attribute.
- The **document revision** is stored as a string in the `_rev` attribute.
- ❗You can specify a value for the `_key` attribute when creating a document.
- ❗The `_id` attribute is automatically set based on the collection and `_key`.
- ❗The `_id` and `_key` values are immutable once the document has been created.
- ❗The `_rev` value is maintained by ArangoDB automatically.

### Typology Category Collection

The [Typology Category Collection](./02-typology-category-collection.md) within this ArangoDB structure is designed to store and manage different category of typologies.

### Typology Collection

The [Typology Collection](./03-typology-collection.md) within this ArangoDB structure is designed to store and manage different typologies.

### Rule Collection

The [Rule Collection](./05-rule-collection.md) within this ArangoDB structure is designed to store and manage different rules.

### Rule Config Collection

The [Rule Config Collection](./06-rule-config-collection.md) within this ArangoDB structure is designed to store and manage different rule configs.
