# Config Service Privileges

## Privileges for Config Service

To ensure that users have the appropriate level of access, there are specific privileges defined for the Config Service. These privileges are designed to align with common security practices and provide a clear separation of duties.

### Rule Privileges

- SECURITY_CREATE_RULE
  - Label: Rule Create
  - Description: Allows creating a rule.
- SECURITY_UPDATE_RULE
  - Label: Rule Update
  - Description: Allows updating a rule.
- SECURITY_GET_RULES
  - Label: Rules Get
  - Description: Allows returning all rules.
- SECURITY_GET_RULE
  - Label: Rule Get
  - Description: Allows returning a specific rule.
- SECURITY_GET_RULE_RULE_CONFIG
  - Label: Rule Rule Config Get
  - Description: Allows returning rule with the rule config.
- SECURITY_DELETE_RULE
  - Label: Rule Delete
  - Description: Allows deleting a rule.
- SECURITY_DISABLE_RULE
  - Label: Rule Disable
  - Description: Disables a rule.

### Rule Config Privileges

- SECURITY_CREATE_RULE_CONFIG
  - Label: Rule Config Create
  - Description: Allows creating a rule config.
- SECURITY_UPDATE_RULE_CONFIG
  - Label: Rule Config Update
  - Description: Allows updating a rule config.
- SECURITY_GET_RULE_CONFIGS
  - Label: Rule Configs Get
  - Description: Allows returning all rule configs.
- SECURITY_GET_RULE_CONFIG
  - Label: Rule Config Get
  - Description: Allows returning a specific rule config.
- SECURITY_DELETE_RULE_CONFIG
  - Label: Rule Config Delete
  - Description: Allows deleting a rule config.
- SECURITY_DISABLE_RULE_CONFIG
  - Label: Rule Config Disable
  - Description: Disables a rule config.

### Typology Privileges (Typology privileges are not yet implemented)

- SECURITY_CREATE_TYPOLOGY
  - Label: Typology Create
  - Description: Allows creating a typology.
- SECURITY_UPDATE_TYPOLOGY
  - Label: Typology Update
  - Description: Allows updating a typology.
- SECURITY_GET_TYPOLOGIES
  - Label: Typologies Get
  - Description: Allows returning all typologies.
- SECURITY_GET_TYPOLOGY
  - Label: Typology Get
  - Description: Allows returning a specific typology.
- SECURITY_DELETE_TYPOLOGY
  - Label: Typology Delete
  - Description: Allows deleting a typology.
- SECURITY_DISABLE_TYPOLOGY
  - Label: Typology Disable
  - Description: Disables a typology.

### Typology Rule Config Privileges (Typology Rule Config privileges are not yet implemented)

- SECURITY_CREATE_TYPOLOGY_RULE_CONFIG
  - Label: Typology Rule Config Create
  - Description: Allows creating a typology rule config.
- SECURITY_UPDATE_TYPOLOGY_RULE_CONFIG
  - Label: Typology Rule Config Update
  - Description: Allows updating a typology rule config.
- SECURITY_GET_TYPOLOGY_RULE_CONFIGS
  - Label: Typology Rule Configs Get
  - Description: Allows returning all typology rule configs.
- SECURITY_GET_TYPOLOGY_RULE_CONFIG
  - Label: Typology Rule Config Get
  - Description: Allows returning a specific typology rule config.
- SECURITY_DELETE_TYPOLOGY_RULE_CONFIG
  - Label: Typology Rule Config Delete
  - Description: Allows deleting a typology rule config.
