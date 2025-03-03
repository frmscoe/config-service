# Services required from the auth lib

As abstraction appears to be managed by Auth-Lib, we need additional functionality added to Auth-Lib for it to reduce the overhead of an installation, deployment or re-deployment.

As all services will have their own discrete roles and privileges, which are registered to the Tazama services on installation. A number of these functions have been defined and implemented in the Mojaloop, Security BC so the design proposed leverages this functionality. The following additional functions need to be added:

- **setServiceCredentials**: A functionality that allows a service to be given the necessary privileges to create and retrieve information regarding its security.
- **addPrivilege**: Add the necessary privilege that will be leveraged by this service
  - addPrivilege(privId: string, labelName: string, description: string): void;
- **addPrivilegesArray**: 
  - addPrivilegesArray(privsArray: { privId: string, labelName: string, description: string }[]): void;
- New **addRoles**: A functionilty that allows pre-established roles to be created on deployment. Currently roles are created manually in Mojaloop Security BC.
- New **addRolePrivileges**: Add privileges to a specific role
- **roleHasPrivilege**: A functionality to confirm if a given role has the necessary privilege
  - roleHasPrivilege(roleId: string, privilegeId: string): boolean;
- **rolesHavePrivilege**: A functionality to confirm if a list of role have the necessary privilege
  - rolesHavePrivilege(roleIds: string[], privilegeId: string): boolean;
