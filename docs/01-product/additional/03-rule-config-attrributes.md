# Rule Configuration Attributes

A rule configuration is a config object, that

- may contain a number of parameters
- may contain a number of exit conditions
- will contains either result bands or alternatively will contain result cases

## Rule configuration metadata

The rule configuration “header” contains metadata that describes the rule. The metadata includes the following attributes:

- ```id``` identifies the specific rule processor and its version that will use the configuration. It is recommended that the rule processor “name” is drawn from the source-code repository where the rule processor code resides, and the version should match the semantical version of the source code as defined in the source code repository.
- ```cfg``` is the unique version of the rule configuration. Multiple different versions of a rule configuration can co-exist simultaneously in the platform
- ```desc``` offers a readable description of the rule

The combination of the ```id``` and ```cfg``` strings forms a unique identifier for every rule configuration and is sometimes compiled into a database key, though this is not essential: the database enforces the uniqueness of any configuration to make sure that a specific version of a configuration can never be over-written.

Example of the rule configuration metadata:

```json
{
  "id": "rule-001@1.0.0",
  "cfg": "1.0.0",
  "desc": "Derived account age - creditor",
  ...
  }
```

## Table structure for storing the information  

In addition to these parameters required in the file itself, the following are required in the database

| Name                  | Type         | Description                                                                 |
| --------------------- | ------------ | --------------------------------------------------------------------------- |
| ruleConfigUUID        | string       | system-generated UUIDv4 identifier                                          |
| ruleUUID              | Int          | the specific rule processor and its version that will use the configuration |
|                       |              | i.e. ```rule-001@1.0.0``` or ```ruleUUID```                                 |
| ruleConfigID          | Int          | is this needed given UUID?                                                  |
| ruleConfigVersion     | varChar(255) | x.y.z versioning. (also called ```cfg```)                                   |
| ruleConfigDescription | varChar(255) | A simple description of the rule configuration.                             |
| state                 | int          | The current state will default to 00 (new)                                  |
| createdAt             | DateTime     | the date and time the configuration was first created, or imported          |
| UpdatedAt             | DateTime     | the date and time the configuration was last updated                        |
| config                | String       | the configuration information                                               |
| ownerID               | int          | the ID of the person that created the rule                                  |
| approverID            | int          | the ID of the person that approved the rule                                 |

## New configurations not yet saved  

1. The configuration is issued a system-generated UUIDv4 identifier
2. A newly created configuration that is "in progress", but not yet submitted to a specific step in the workflow (e.g. saved as draft), must have a status of `00 - NEW`
3. A status date for the `00 - NEW` status is set to the ISO8601 timestamp for the time at which the create new configuration process was invoked
4. A configuration with a status of `00 - NEW` must be linked to the user that created it via their platform user profile