import { PrivilegeType } from '../privilege/privilege.service';

export enum TypologyPrivilege {
  CREATE_TYPOLOGY = 'SECURITY_CREATE_TYPOLOGY',
  UPDATE_TYPOLOGY = 'SECURITY_UPDATE_TYPOLOGY',
  GET_TYPOLOGIES = 'SECURITY_GET_TYPOLOGIES',
  GET_TYPOLOGY = 'SECURITY_GET_TYPOLOGY',
  DELETE_TYPOLOGY = 'SECURITY_DELETE_TYPOLOGY',
  DISABLE_TYPOLOGY = 'SECURITY_DISABLE_TYPOLOGY',
}

export const TypologyPrivilegesDefinition: PrivilegeType[] = [
  {
    privId: TypologyPrivilege.CREATE_TYPOLOGY,
    labelName: 'Typology Create',
    description: 'Allows creating a typology',
  },
  {
    privId: TypologyPrivilege.UPDATE_TYPOLOGY,
    labelName: 'Typology Update',
    description: 'Allows updating a typology',
  },
  {
    privId: TypologyPrivilege.GET_TYPOLOGIES,
    labelName: 'Typologies Get',
    description: 'Allows returning all the typologies',
  },
  {
    privId: TypologyPrivilege.GET_TYPOLOGY,
    labelName: 'Typology Get',
    description: 'Allows returning a specific typology',
  },
  {
    privId: TypologyPrivilege.DELETE_TYPOLOGY,
    labelName: 'Typology Delete',
    description: 'Allows deleting a specific typology',
  },
  {
    privId: TypologyPrivilege.DISABLE_TYPOLOGY,
    labelName: 'Typology Disable',
    description: 'Allows disabling a specific typology',
  },
];
