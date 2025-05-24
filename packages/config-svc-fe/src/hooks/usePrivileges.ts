// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { useMemo } from 'react';
import { useAuth } from '~/context/auth';

const usePrivileges = () => {
  const { profile: user } = useAuth();
  const privileges = user?.privileges || [];

  // RULE Privileges
  const canCreateRule = privileges.includes('SECURITY_CREATE_RULE');
  const canUpdateRule = privileges.includes('SECURITY_UPDATE_RULE');
  const canDeleteRule = privileges.includes('SECURITY_DELETE_RULE');
  const canDisableRule = privileges.includes('SECURITY_DISABLE_RULE');
  const canViewRule = privileges.includes('SECURITY_GET_RULE');
  const canViewRules = privileges.includes('SECURITY_GET_RULES');
  const canApproveRule = privileges.includes('SECURITY_APPROVE_RULE');
  const canRejectRule = privileges.includes('SECURITY_REJECT_RULE');
  const canWithdrawRule = privileges.includes('SECURITY_WITHDRAW_RULE');
  const canDeployRule = privileges.includes('SECURITY_DEPLOY_RULE');
  const canRetireRule = privileges.includes('SECURITY_RETIRE_RULE');
  const canArchiveRule = privileges.includes('SECURITY_ARCHIVE_RULE');
  const canAbandonRule = privileges.includes('SECURITY_ABANDON_RULE');
  // Import Rule Function
  const canImportRule = useMemo(() => { // switch to IMPORT_RULE when all privileges are implemented
      return user?.privileges?.includes('SECURITY_CREATE_RULE_CONFIG') && user?.privileges?.includes('SECURITY_CREATE_RULE');
  }, [user]);

  // RULE CONFIG Privileges
  const canCreateRuleConfig = privileges.includes('SECURITY_CREATE_RULE_CONFIG');
  const canUpdateRuleConfig = privileges.includes('SECURITY_UPDATE_RULE_CONFIG');
  const canDeleteRuleConfig = privileges.includes('SECURITY_DELETE_RULE_CONFIG');
  const canDisableRuleConfig = privileges.includes('SECURITY_DISABLE_RULE_CONFIG');
  const canViewRuleConfig = privileges.includes('SECURITY_GET_RULE_CONFIG');
  const canViewRuleConfigs = privileges.includes('SECURITY_GET_RULE_CONFIGS');
  const canViewRuleWithConfigs = privileges.includes('SECURITY_GET_RULE_RULE_CONFIG');
  const canApproveRuleConfig = privileges.includes('SECURITY_APPROVE_RULE_CONFIG');
  const canRejectRuleConfig = privileges.includes('SECURITY_REJECT_RULE_CONFIG');
  const canWithdrawRuleConfig = privileges.includes('SECURITY_WITHDRAW_RULE_CONFIG');
  const canDeployRuleConfig = privileges.includes('SECURITY_DEPLOY_RULE_CONFIG');
  const canRetireRuleConfig = privileges.includes('SECURITY_RETIRE_RULE_CONFIG');
  const canArchiveRuleConfig = privileges.includes('SECURITY_ARCHIVE_RULE_CONFIG');
  const canAbandonRuleConfig = privileges.includes('SECURITY_ABANDON_RULE_CONFIG');

  // TYPOLOGY Privileges
  const canCreateTypology = privileges.includes('SECURITY_CREATE_TYPOLOGY');
  const canUpdateTypology = privileges.includes('SECURITY_UPDATE_TYPOLOGY');
  const canDeleteTypology = privileges.includes('SECURITY_DELETE_TYPOLOGY');
  const canDisableTypology = privileges.includes('SECURITY_DISABLE_TYPOLOGY');
  const canViewTypology = privileges.includes('SECURITY_GET_TYPOLOGY');
  const canViewTypologies = privileges.includes('SECURITY_GET_TYPOLOGIES');
  const canApproveTypology = privileges.includes('SECURITY_APPROVE_TYPOLOGY');
  const canRejectTypology = privileges.includes('SECURITY_REJECT_TYPOLOGY');
  const canWithdrawTypology = privileges.includes('SECURITY_WITHDRAW_TYPOLOGY');
  const canDeployTypology = privileges.includes('SECURITY_DEPLOY_TYPOLOGY');
  const canRetireTypology = privileges.includes('SECURITY_RETIRE_TYPOLOGY');
  const canArchiveTypology = privileges.includes('SECURITY_ARCHIVE_TYPOLOGY');
  const canAbandonTypology = privileges.includes('SECURITY_ABANDON_TYPOLOGY');
  const canViewTypologyRuleConfig = privileges.includes('SECURITY_GET_TYPOLOGY_RULE_CONFIG');
  const canViewTypologyRuleConfigs = privileges.includes('SECURITY_GET_TYPOLOGY_RULE_CONFIGS');

  // NETWORK MAP Privileges
  const canCreateNetworkMap = privileges.includes('SECURITY_CREATE_NETWORK_MAP');
  const canUpdateNetworkMap = privileges.includes('SECURITY_UPDATE_NETWORK_MAP');
  const canDeleteNetworkMap = privileges.includes('SECURITY_DELETE_NETWORK_MAP');
  const canDisableNetworkMap = privileges.includes('SECURITY_DISABLE_NETWORK_MAP');
  const canViewNetworkMap = privileges.includes('SECURITY_GET_NETWORK_MAP');
  const canApproveNetworkMap = privileges.includes('SECURITY_APPROVE_NETWORK_MAP');
  const canRejectNetworkMap = privileges.includes('SECURITY_REJECT_NETWORK_MAP');
  const canWithdrawNetworkMap = privileges.includes('SECURITY_WITHDRAW_NETWORK_MAP');
  const canDeployNetworkMap = privileges.includes('SECURITY_DEPLOY_NETWORK_MAP');
  const canRetireNetworkMap = privileges.includes('SECURITY_RETIRE_NETWORK_MAP');
  const canArchiveNetworkMap = privileges.includes('SECURITY_ARCHIVE_NETWORK_MAP');
  const canAbandonNetworkMap = privileges.includes('SECURITY_ABANDON_NETWORK_MAP');
  const canExportNetworkMap = privileges.includes('SECURITY_EXPORT_NETWORK_MAP');
  const canImportNetworkMap = privileges.includes('SECURITY_IMPORT_NETWORK_MAP');

  return {
    privileges,

    // RULE
    canCreateRule,
    canUpdateRule,
    canDeleteRule,
    canDisableRule,
    canViewRule,
    canViewRules,
    canApproveRule,
    canRejectRule,
    canWithdrawRule,
    canDeployRule,
    canRetireRule,
    canArchiveRule,
    canAbandonRule,
    // Import Rule Function
    canImportRule,

    // RULE CONFIG
    canCreateRuleConfig,
    canUpdateRuleConfig,
    canDeleteRuleConfig,
    canDisableRuleConfig,
    canViewRuleConfig,
    canViewRuleConfigs,
    canViewRuleWithConfigs,
    canApproveRuleConfig,
    canRejectRuleConfig,
    canWithdrawRuleConfig,
    canDeployRuleConfig,
    canRetireRuleConfig,
    canArchiveRuleConfig,
    canAbandonRuleConfig,

    // TYPOLOGY
    canCreateTypology,
    canUpdateTypology,
    canDeleteTypology,
    canDisableTypology,
    canViewTypology,
    canViewTypologies,
    canApproveTypology,
    canRejectTypology,
    canWithdrawTypology,
    canDeployTypology,
    canRetireTypology,
    canArchiveTypology,
    canAbandonTypology,
    canViewTypologyRuleConfig,
    canViewTypologyRuleConfigs,

    // NETWORK MAP
    canCreateNetworkMap,
    canUpdateNetworkMap,
    canDeleteNetworkMap,
    canDisableNetworkMap,
    canViewNetworkMap,
    canApproveNetworkMap,
    canRejectNetworkMap,
    canWithdrawNetworkMap,
    canDeployNetworkMap,
    canRetireNetworkMap,
    canArchiveNetworkMap,
    canAbandonNetworkMap,
    canExportNetworkMap,
    canImportNetworkMap,
  };
};

export default usePrivileges;
