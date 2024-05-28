import { PrivilegeType } from '../privilege/privilege.service';

export enum RulePrivileges {
  CREATE_RULE = 'SECURITY_CREATE_RULE',
  UPDATE_RULE = 'SECURITY_UPDATE_RULE',
  GET_RULES = 'SECURITY_GET_RULES',
  GET_RULE = 'SECURITY_GET_RULE',
  GET_RULE_RULE_CONFIG = 'SECURITY_GET_RULE_RULE_CONFIG',
  DELETE_RULE = 'SECURITY_DELETE_RULE',
  DISABLE_RULE = 'SECURITY_DISABLE_RULE',
}
export const RulePrivilegesDefinition: PrivilegeType[] = [
  {
    privId: RulePrivileges.CREATE_RULE,
    labelName: 'Rule Create',
    description: 'Allows creating a rule',
  },
  {
    privId: RulePrivileges.UPDATE_RULE,
    labelName: 'Rule Update',
    description: 'Allows updating a rule',
  },
  {
    privId: RulePrivileges.GET_RULES,
    labelName: 'Rules Get',
    description: 'Allows returning all rules',
  },
  {
    privId: RulePrivileges.GET_RULE_RULE_CONFIG,
    labelName: 'Rule rule config Get',
    description: 'Allows returning rule with the rule configuration',
  },
  {
    privId: RulePrivileges.GET_RULE,
    labelName: 'Rule Get',
    description: 'Allows returning a rule',
  },
  {
    privId: RulePrivileges.DELETE_RULE,
    labelName: 'Rule Delete',
    description: 'allows deleting a rule',
  },
  {
    privId: RulePrivileges.DISABLE_RULE,
    labelName: 'Rule Disable',
    description: 'disables a rule',
  },
];
