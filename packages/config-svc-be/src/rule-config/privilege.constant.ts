import { PrivilegeType } from '../privilege/privilege.service';

export enum RuleConfigPrivilege {
  CREATE_RULE_CONFIG = 'SECURITY_CREATE_RULE_CONFIG',
  UPDATE_RULE_CONFIG = 'SECURITY_UPDATE_RULE_CONFIG',
  GET_RULE_CONFIGS = 'SECURITY_GET_RULE_CONFIGS',
  GET_RULE_CONFIG = 'SECURITY_GET_RULE_CONFIG',
  DELETE_RULE_CONFIG = 'SECURITY_DELETE_RULE_CONFIG',
  DISABLE_RULE_CONFIG = 'SECURITY_DISABLE_RULE_CONFIG',
}

export const RuleConfigPrivilegesDefinition: PrivilegeType[] = [
  {
    privId: RuleConfigPrivilege.CREATE_RULE_CONFIG,
    labelName: 'Rule Config Create',
    description: 'Allows creating a rule config',
  },
  {
    privId: RuleConfigPrivilege.UPDATE_RULE_CONFIG,
    labelName: 'Rule Config Update',
    description: 'Allows updating a rule config',
  },
  {
    privId: RuleConfigPrivilege.GET_RULE_CONFIGS,
    labelName: 'Rule Configs Get',
    description: 'Allows returning all the rule configs',
  },
  {
    privId: RuleConfigPrivilege.GET_RULE_CONFIG,
    labelName: 'Rule Config Get',
    description: 'Allows returning a specific rule config',
  },
  {
    privId: RuleConfigPrivilege.DELETE_RULE_CONFIG,
    labelName: 'Rule Config Delete',
    description: 'Allows deleting a specific rule config',
  },
  {
    privId: RuleConfigPrivilege.DISABLE_RULE_CONFIG,
    labelName: 'Rule Config Disable',
    description: 'Allows disabling a specific rule config',
  },
];
