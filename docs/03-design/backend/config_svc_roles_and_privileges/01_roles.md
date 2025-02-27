# Config Service Roles

## Role-Based Access Control (RBAC) Levels and Privileges for Config Service

To ensure that users have the appropriate level of access, there are four roles defined with specific privileges. These roles are designed to align with common security practices and provide a clear separation of duties.

> **Note:** The roles and privileges are subject to change based on the evolving requirements of the Config Service. The following roles are based on the initial design considerations. Currently the typology privileges and Approver role are not yet implemented.

### 1. Read-Only

**Role Name:** Config Service Viewer

**Description:** This role is designed for users who need access to view information without the ability to modify it. Suitable for audit and compliance roles or staff that require visibility into configurations for monitoring or reporting purposes.

<details>
<summary><strong>Privileges:</strong></summary>

- **SECURITY_GET_RULES**
  - Allows returning all rules.
- **SECURITY_GET_RULE**
  - Allows returning a specific rule.
- **SECURITY_GET_RULE_CONFIGS**
  - Allows returning all rule configs.
- **SECURITY_GET_RULE_CONFIG**
  - Allows returning a specific rule config.
- **SECURITY_GET_RULE_RULE_CONFIG**
  - Allows returning all rules with the rule configs.
- **SECURITY_GET_TYPOLOGIES**
  - Allows returning all typologies.
- **SECURITY_GET_TYPOLOGY**
  - Allows returning a specific typology.
- **SECURITY_GET_TYPOLOGY_RULE_CONFIGS**
  - Allows returning all typology rule configs.
- **SECURITY_GET_TYPOLOGY_RULE_CONFIG**
  - Allows returning a specific typology rule config.

</details>

### 2. Create, Edit, and Read

**Role Name:** Config Service Editor

**Description:** This role is suited for users who are responsible for setting up and maintaining the configurations. Typically, these are system administrators or operations staff who manage daily security settings and configurations.

<details>
<summary><strong>Privileges:</strong></summary>

- Includes all privileges from the Viewer role.
- **SECURITY_CREATE_RULE**
  - Allows creating a rule.
- **SECURITY_UPDATE_RULE**
  - Allows updating a rule.
- **SECURITY_CREATE_RULE_CONFIG**
  - Allows creating a rule config.
- **SECURITY_UPDATE_RULE_CONFIG**
  - Allows updating a rule config.
- **SECURITY_CREATE_TYPOLOGY**
  - Allows creating a typology.
- **SECURITY_UPDATE_TYPOLOGY**
  - Allows updating a typology.
- **SECURITY_CREATE_TYPOLOGY_RULE_CONFIG**
  - Allows creating a typology rule config.
- **SECURITY_UPDATE_TYPOLOGY_RULE_CONFIG**
  - Allows updating a typology rule config.

</details>

### 3. Approve, Create, Edit, and Read

**Role Name:** Config Service Approver

**Description:** This role is assigned to users who are responsible for approving configurations before they are deployed. It is suitable for security architects or compliance officers who need to review and approve changes to the security infrastructure.

<details>
<summary><strong>Privileges:</strong></summary>

- Includes all privileges from the Editor role.
- TBC
<!-- - TBC - **SECURITY_APPROVE_RULE**
  - Allows approving a rule. -->

</details>

### 4. Delete, Approve, Create, Edit, and Read

**Role Name:** Config Service Admin

**Description:** This role is assigned to highly trusted users who manage the entire lifecycle of rules and configurations. It is suitable for senior IT staff or security managers who oversee the security infrastructure.

<details>
<summary><strong>Privileges:</strong></summary>

- Includes all privileges from the Approver role.
- **SECURITY_DELETE_RULE**
  - Allows deleting a rule.
- **SECURITY_DISABLE_RULE**
  - Disables a rule.
- **SECURITY_DELETE_RULE_CONFIG**
  - Allows deleting a rule config.
- **SECURITY_DISABLE_RULE_CONFIG**
  - Disables a rule config.
- **SECURITY_DELETE_TYPOLOGY**
  - Allows deleting a typology.
- **SECURITY_DISABLE_TYPOLOGY**
  - Disables a typology.
- **SECURITY_DELETE_TYPOLOGY_RULE_CONFIG**
  - Allows deleting a typology rule config.

</details>
