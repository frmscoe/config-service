import { PrivilegeType } from '../privilege/privilege.service';

export enum NetworkMapPrivilege {
  CREATE_NETWORK_MAP = 'SECURITY_CREATE_NETWORK_MAP',
  UPDATE_NETWORK_MAP = 'SECURITY_UPDATE_NETWORK_MAP',
  GET_NETWORK_MAP = 'SECURITY_GET_NETWORK_MAP',
  APPROVE_NETWORK_MAP = 'SECURITY_APPROVE_NETWORK_MAP',
  IMPORT_NETWORK_MAP = 'SECURITY_IMPORT_NETWORK_MAP',
  EXPORT_NETWORK_MAP = 'SECURITY_EXPORT_NETWORK_MAP',
  DISABLE_NETWORK_MAP = 'SECURITY_DISABLE_NETWORK_MAP',
  DELETE_NETWORK_MAP = 'SECURITY_DELETE_NETWORK_MAP',
}

export const NetworkMapPrivilegesDefinition: PrivilegeType[] = [
  {
    privId: NetworkMapPrivilege.CREATE_NETWORK_MAP,
    labelName: 'Network Map Create',
    description: 'Allows creating a network map',
  },
  {
    privId: NetworkMapPrivilege.UPDATE_NETWORK_MAP,
    labelName: 'Network Map Update',
    description: 'Allows updating a network map',
  },
  {
    privId: NetworkMapPrivilege.GET_NETWORK_MAP,
    labelName: 'Network Map Get',
    description: 'Allows returning a specific network map',
  },
  {
    privId: NetworkMapPrivilege.APPROVE_NETWORK_MAP,
    labelName: 'Network Map Approve',
    description: 'Allows approving a network map',
  },
  {
    privId: NetworkMapPrivilege.IMPORT_NETWORK_MAP,
    labelName: 'Network Map Import',
    description: 'Allows importing network maps',
  },
  {
    privId: NetworkMapPrivilege.EXPORT_NETWORK_MAP,
    labelName: 'Network Map Export',
    description: 'Allows exporting network maps',
  },
  {
    privId: NetworkMapPrivilege.DISABLE_NETWORK_MAP,
    labelName: 'Network Map Disable',
    description: 'Allows disabling a specific network map',
  },
  {
    privId: NetworkMapPrivilege.DELETE_NETWORK_MAP,
    labelName: 'Network Map Delete',
    description: 'Allows deleting a specific network map',
  },
];
