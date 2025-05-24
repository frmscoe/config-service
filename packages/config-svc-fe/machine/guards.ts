// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { PRIVILEGES } from '../src/constants/privileges';

type ArtefactType = 'RULE' | 'RULE_CONFIG' | 'TYPOLOGY' | 'NETWORK_MAP';
type StateCode = string;
type Event = string;

type TransitionMatrix = {
  [artefact in ArtefactType]?: {
    [fromState: string]: {
      [event: string]: string[]; // required privileges
    };
  };
};

const artefactTransition = (
  approve: string,
  reject: string,
  withdraw: string,
  abandon: string,
  archive: string,
  deploy: string,
  retire: string,
  edit: string,
  review: string
): { [key: string]: { [event: string]: string[] } } => ({
  '01_DRAFT': {
    SUBMIT_REVIEW: [edit],
    ABANDON: [abandon],
    EDIT: [edit],
    REVIEW: [review],
  },
  '10_PENDING_REVIEW': {
    APPROVE: [approve],
    REJECT: [reject],
    WITHDRAW: [withdraw],
    REVIEW: [review],
  },
  '11_REJECTED': {
    EDIT: [edit],
    ABANDON: [abandon],
    REVIEW: [review],
  },
  '12_WITHDRAWN': {
    EDIT: [edit],
    ARCHIVE: [archive],
    ABANDON: [abandon],
    REVIEW: [review],
  },
  '20_APPROVED': {
    DEPLOY: [deploy],
    WITHDRAW: [withdraw],
    REVIEW: [review],
  },
  '30_DEPLOYED': {
    RETIRE: [retire],
    REVIEW: [review],
  },
  '32_RETIRED': {
    ARCHIVE: [archive],
    REVIEW: [review],
  },
});

const transitionPermissions: TransitionMatrix = {
  RULE: artefactTransition(
    PRIVILEGES.SECURITY_APPROVE_RULE,
    PRIVILEGES.SECURITY_REJECT_RULE,
    PRIVILEGES.SECURITY_WITHDRAW_RULE,
    PRIVILEGES.SECURITY_ABANDON_RULE,
    PRIVILEGES.SECURITY_ARCHIVE_RULE,
    PRIVILEGES.SECURITY_DEPLOY_RULE,
    PRIVILEGES.SECURITY_RETIRE_RULE,
    PRIVILEGES.SECURITY_UPDATE_RULE,
    PRIVILEGES.SECURITY_GET_RULE
  ),

  RULE_CONFIG: artefactTransition(
    PRIVILEGES.SECURITY_APPROVE_RULE_CONFIG,
    PRIVILEGES.SECURITY_REJECT_RULE_CONFIG,
    PRIVILEGES.SECURITY_WITHDRAW_RULE_CONFIG,
    PRIVILEGES.SECURITY_ABANDON_RULE_CONFIG,
    PRIVILEGES.SECURITY_ARCHIVE_RULE_CONFIG,
    PRIVILEGES.SECURITY_DEPLOY_RULE_CONFIG,
    PRIVILEGES.SECURITY_RETIRE_RULE_CONFIG,
    PRIVILEGES.SECURITY_UPDATE_RULE_CONFIG,
    PRIVILEGES.SECURITY_GET_RULE_CONFIG
  ),

  TYPOLOGY: artefactTransition(
    PRIVILEGES.SECURITY_APPROVE_TYPOLOGY,
    PRIVILEGES.SECURITY_REJECT_TYPOLOGY,
    PRIVILEGES.SECURITY_WITHDRAW_TYPOLOGY,
    PRIVILEGES.SECURITY_ABANDON_TYPOLOGY,
    PRIVILEGES.SECURITY_ARCHIVE_TYPOLOGY,
    PRIVILEGES.SECURITY_DEPLOY_TYPOLOGY,
    PRIVILEGES.SECURITY_RETIRE_TYPOLOGY,
    PRIVILEGES.SECURITY_UPDATE_TYPOLOGY,
    PRIVILEGES.SECURITY_GET_TYPOLOGY
  ),

  NETWORK_MAP: artefactTransition(
    PRIVILEGES.SECURITY_APPROVE_NETWORK_MAP,
    PRIVILEGES.SECURITY_REJECT_NETWORK_MAP,
    PRIVILEGES.SECURITY_WITHDRAW_NETWORK_MAP,
    PRIVILEGES.SECURITY_ABANDON_NETWORK_MAP,
    PRIVILEGES.SECURITY_ARCHIVE_NETWORK_MAP,
    PRIVILEGES.SECURITY_DEPLOY_NETWORK_MAP,
    PRIVILEGES.SECURITY_RETIRE_NETWORK_MAP,
    PRIVILEGES.SECURITY_UPDATE_NETWORK_MAP,
    PRIVILEGES.SECURITY_GET_NETWORK_MAP
  ),
};

export const canTransition = (
  userPrivileges: string[],
  artefactType: ArtefactType,
  currentState: StateCode,
  event: Event
): boolean => {
  const required = transitionPermissions[artefactType]?.[currentState]?.[event] || [];
  return required.some(priv => userPrivileges.includes(priv));
};
