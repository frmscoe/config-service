# Rule Attributes

This section will grow as we build out the service, but for now

## Table structure for storing the information  

In addition to these parameters required in the file itself, the following are required in the database

| Name            | Type         | Description                                                        |
| --------------- | ------------ | ------------------------------------------------------------------ |
| ruleUUID        | string       | system-generated UUIDv4 identifier                                 |
| ruleID          | Int          | the rule processor ID                                              |
| ruleVersion     | varChar(255) | x.y.z versioning                                                   |
| ruleDescription | varChar(255) | A simple description of the rule                                   |
| state           | int          | The current state will default to 00 (new)                         |
| dataType        | varChar(255) | used to determine auto selection of case or bands etc.             |
| createdAt       | DateTime     | the date and time the configuration was first created, or imported |
| UpdatedAt       | DateTime     | the date and time the configuration was last updated               |
| ownerID         | int          | the ID of the person that created the rule                         |
| approverID      | int          | the ID of the person that approved the rule                        |
|                 |              |                                                                    |
