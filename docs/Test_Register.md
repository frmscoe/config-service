# **Backend Test Register (Unit + E2E)**

---

## **1. Rule Management – Backend Unit Tests**

| Test Case ID | Method / Target      | Description                                                    | Expected Output                 | Test File   | Status         | Comment |
| ------------ | -------------------- | -------------------------------------------------------------- | ------------------------------- | -------------------- | ---------------| -----------------------|
| RU-001       | createRule()         | Should create a rule with valid name, description, and version | Rule created and stored         | rule.service.spec.ts | Done | The method is create() |
| RU-002       | createRule()         | Should reject duplicate rule name/version                      | Error: "Rule already exists"    | rule.service.spec.ts | Done | The method is create() |
| RU-003       | getRuleById()        | Should fetch rule by valid UUID                                | Rule object returned            | rule.service.spec.ts | Done | None |
| RU-004       | updateRule()         | Should update rule fields and increment version correctly      | Updated rule stored             | rule.service.spec.ts | Done | The method is update()
| RU-005       | bumpVersion()        | Should bump minor or patch version properly                    | New version string generated    | rule.service.spec.ts | Done | None |
| RU-006       | parseRuleId()        | Should parse composite rule ID (rule\@version)                 | Rule UUID and version extracted | rule.service.spec.ts | Done | None |
| RU-007       | validateRuleUUID()   | Should reject invalid UUID format                              | Error thrown                    | rule.service.spec.ts | Done | None |
| RULE-002     | generateRuleId()     | Generates rule UUID automatically if missing                   | New rule UUID returned          | rule.service.spec.ts | Done | None |

---

## **2. Rule Configurations – Backend Unit Tests**

| Test Case ID | Method / Target          | Description                                        | Expected Output                       | Test File                   | Status | Comment |
| ------------ | ------------------------ | -------------------------------------------------- | ------------------------------------- | --------------------------- | ------------ | ------------------|
| RC-001       | createRuleConfig()       | Should create a rule config with valid bands       | Config with bands saved               | rule-config.service.spec.ts | Done | None |
| RC-002       | createRuleConfig()       | Should create a rule config with valid cases       | Config with cases saved               | rule-config.service.spec.ts | Done | None |
| RC-003       | createRuleConfig()       | Should reject config missing bands/cases           | Error returned                        | rule-config.service.spec.ts | Done | None |
| RC-004       | createRuleConfig()       | Should generate new config version on update       | Config version incremented            | rule-config.service.spec.ts | Done | None |
| RC-005       | addExitConditions()      | Should add exit conditions and rationale           | Config includes exit conditions       | rule-config.service.spec.ts | Done | None |
| RC-006       | parseRuleConfigId()      | Should parse config UUID + version from JSON input | ID and version extracted              | rule-config.service.spec.ts | Done | None |
| RC-007       | validateMetadataFields() | Should validate rule config metadata               | Metadata accepted and stored          | rule-config.service.spec.ts | Done | None |
| RCFG-001     | validateRuleConfigJson() | Should parse JSON metadata and validate schema     | Valid config stored                   | rule-config.service.spec.ts | Done | None |
| RCFG-002     | checkDuplicateConfig()   | Should reject duplicate rule config ID + version   | Error: "Configuration already exists" | rule-config.service.spec.ts | Done | None |
| RCFG-003     | processBands()           | Should correctly persist bands metadata            | Bands saved properly                  | rule-config.service.spec.ts | Done | None |
| RCFG-004     | processCases()           | Should correctly persist cases metadata            | Cases saved properly                  | rule-config.service.spec.ts | Done | None |
| RCFG-005     | checkEmptyConfig()       | Should reject config without bands or cases        | Error returned                        | rule-config.service.spec.ts | Done | None |
| RCFG-006     | addExitsToConfig()       | Should create config with exits and reasons        | Exits visible in config               | rule-config.service.spec.ts | Done | None |

---

## **3. Typology Management – Backend Unit Tests**

| Test Case ID | Method / Target           | Description                                               | Expected Output                       | Test File                  | Status | Comment |
| ------------ | ------------------------- | --------------------------------------------------------- | ------------------------------------- | -------------------------- | ----------- | -----------------|
| TY-001       | createTypology()          | Create a new typology with metadata and rules             | Typology created and stored           | typology.service.spec.ts   | Done | None |
| TY-002       | addRuleToTypology()       | Add rule to typology structure                            | Rule listed under typology            | typology.service.spec.ts   | Done | None |
| TY-003       | preventDuplicateRules()   | Prevent adding same rule twice                            | Validation error                      | typology.service.spec.ts   | Done | None |

---

## **4. Typology Rule Config Logic – Backend Unit Tests**

| Test Case ID | Method / Target             | Description                                    | Expected Output             | Test File | Status | Comment                       |
| ------------ | --------------------------- | ---------------------------------------------- | --------------------------- | ------------------------------- | ----------- | -------------- |
| TRC-001      | create()                    | Link typology to rule and config               | Entry inserted into DB      | typology-config.service.spec.ts | Done | None |
| TRC-002      | preventDuplicateLinks()     | Prevent duplicate typology-rule-config entries | Error: "Already exists"     | typology-config.service.spec.ts | Done | None |
| TRC-004      | validateRuleConfigReference | Ensure UUIDs exist and are linked              | Validation passed/failed    | typology-config.service.spec.ts | Done | None |
| TRC-005      | fetchLinkedRules()          | Get all rule-configs in typology               | Full mapping returned       | typology-config.service.ts      | Done | None |

---

## **5. Workflow Transitions & Logic – Backend Unit Tests**
### ***NB: these where impelemented inside the various artifact service.spec.ts file***

| Test Case ID | Method / Transition  | Description                    | Expected Output             | Status | Comment |
| ------------ | -------------------- | ------------------------------ | --------------------------- | ------- | -------- |
| WF-001       | Draft → Review       | Submit from draft state        | Status: 10-Pending Review   | Done    | None     |
| WF-002       | Review → Approved    | Reviewer approves item         | Status: 20-Approved         | Done    | None     |
| WF-003       | Review → Rejected    | Reviewer rejects item          | Status: 11-Rejected         | Done    | None     |
| WF-004       | Withdrawn → Archived | Archive withdrawn items        | Status: 91-Archived         | Done    | None     |
| WF-005       | Rejected → Abandoned | Mark rejected as abandoned     | Status: 90-Abandoned        | Done    | None     |
| WF-006       | Rejected → Draft     | Resubmit resets to draft       | Status: 01-Draft            | Done    | None     |
| WF-007       | Approved → Deployed  | Deploy approved items          | Status: 30-Deployed         | Done    | None     |
| WF-008       | Deployed → Retired   | Retire deployed item           | Status: 32-Retired          | Done    | None     |

---

### **7. Authentication & Session Security**

#### **Backend Unit Tests**

| Test Case ID | Component      | Method / Function Tested | Description                                             | Expected Output             | Test File               | Status  | Comment  |
| ------------ | -------------- | ------------------------ | ------------------------------------------------------- | --------------------------- | ----------------------- | -------- | ----------- |
| AUTH-001     | AuthService    | validateUser()           | Validates user credentials and returns user object      | Valid user object or null   | auth.service.spec.ts    | Done | None |
| AUTH-002     | AuthService    | login()                  | Returns JWT token and user info after authentication    | JWT token and user ID       | auth.service.spec.ts    | Done | None |
| AUTH-003     | JwtAuthGuard   | canActivate()            | Ensures only requests with valid JWTs can access routes | Access granted or denied    | jwt-auth.guard.ts       | Done | Was implemented in jwt-guard.spec.ts file |
| AUTH-004     | RolesGuard     | canActivate()            | Verifies that user has required roles                   | Access allowed or forbidden | roles.guard.ts          | Done | Was implemented in roles.guard.spec.ts file |
| AUTH-005     | AuthController | POST /auth/login         | Accepts credentials, returns JWT on success             | HTTP 201 with token in body | auth.controller.spec.ts | Done | None |
| AUTH-006     | AuthController | GET /auth/profile        | Returns authenticated user profile                      | User object with metadata   | auth.controller.spec.ts | Done | None |

#### **End-to-End Tests**

| Test Case ID | Endpoint         | Method | Scenario                   | Expected Result             | Test File         | Status | Comment |
| ------------ | ---------------- | ------ | -------------------------- | --------------------------- | ----------------- | ------ | ------- |
| E2E-AUTH-001 | /auth/login      | POST   | Valid login                | 201 response with JWT       | auth.e2e-spec.ts  | Already Done | Duplicate of AUTH-005 |
| E2E-AUTH-002 | /auth/login      | POST   | Invalid credentials        | 401 Unauthorized            | auth.e2e-spec.ts  | Done | None |
| E2E-AUTH-003 | /auth/profile    | GET    | Valid token, fetch profile | 200 response with user info | auth.e2e-spec.ts  | Already Done | Duplicate of AUTH-006 |
| E2E-AUTH-004 | /auth/profile    | GET    | No or expired token        | 401 Unauthorized            | auth.e2e-spec.ts  | Already Done | Part of AUTH-002 |
| E2E-AUTH-006 | Session Timeout  | –      | Simulate idle session      | Auto logout / redirect      | Frontend (manual) | Done | it was implemented in LayoutSwitcher.spec.tsx |

---

### **8. Access Control & Privileges**

#### **Backend Unit Tests**
#### ***NB: this section is supposed to be for the frontend, but RolesGuard does not exist in the frontend. usePrivileges exists in the frontend. Backed has a privilege service***
| Test Case ID | Component        | Method / Function Tested | Description                                    | Expected Output              | Test File                 | Status | Comment |
| ------------ | ---------------- | ------------------------ | ---------------------------------------------- | ---------------------------- | ------------------------- | ---------- | ---------- |
| ACL-001      | RolesGuard       | canActivate()            | Ensures unauthorized roles are blocked         | Access denied (false)        | roles.guard.ts            | Already Done | Duplicate of AUTH-004 |
| ACL-002      | RolesGuard       | canActivate()            | Allows access for users with appropriate roles | Access granted (true)        | roles.guard.ts            | Already Done | Duplicate of AUTH-004 |
| ACL-003      | PrivilegeService | checkPrivilege()         | Checks if the user has a specific privilege    | Boolean: true/false          | privilege.service.spec.ts | Done | None |
| ACL-004      | PrivilegeService | getUserPrivileges()      | Retrieves all privileges assigned to a user    | Array of privilege constants | privilege.service.spec.ts | Done | None |

#### **End-to-End Tests**

| Test Case ID | Endpoint                | Method | Scenario                                       | Expected Result                 | Test File                 | Status | Comment |
| ------------ | ----------------------- | ------ | ---------------------------------------------- | ------------------------------- | ------------------------- | ------- | ----------- |
| E2E-ACL-001  | /rule-config/\:id       | PATCH  | Viewer attempts to modify config               | 403 Forbidden or UI blocks edit | rule-config.e2e-spec.ts   | Done | None |
| E2E-ACL-004  | /typology               | GET    | User lacks required privileges                 | 403 Forbidden or empty list     | typology.e2e-spec.ts      | Done | None |
---

## **7. Network Map Management – Backend Unit Tests**

| Test Case ID | Method / Target             | Description                                    | Expected Output                     | Test File                     | Status | Comment |
| ------------ | --------------------------- | ---------------------------------------------- | ----------------------------------- | ----------------------------- | ------- | ------------ |
| NM-001       | createNetworkMap()          | Should create network map with valid structure | Network map created and stored      | network-map.service.spec.ts   | Done | None |
| NM-002       | addTypologyToNetworkMap()   | Should link typology to network map           | Mapping created successfully        | network-map.service.spec.ts   | Done | None |

---

## **8. Exit Conditions Management – Backend Unit Tests**

| Test Case ID | Method / Target              | Description                                  | Expected Output                    | Test File                      | Status | Comment |
| ------------ | ---------------------------- | -------------------------------------------- | ---------------------------------- | ------------------------------ | ------- | ---------- |
| EC-001       | createExitCondition()        | Should create exit condition with metadata   | Exit condition created and stored  | exit-conditions.service.spec.ts | Done | None |
| EC-002       | getUserExitConditions()      | Should retrieve user-specific exit conditions| User exit conditions returned     | exit-conditions.service.spec.ts | Done | None |
| EC-003       | validateExitConditionLogic() | Should validate exit condition business logic| Validation passes/fails correctly  | exit-conditions.service.spec.ts | Done | this is happening in the createExitCondition method |
| EC-005       | seedDefaultExitConditions()  | Should seed system with default conditions   | Default conditions created         | exit-conditions.service.spec.ts | Done | This was implemented in exit-conditions.seeder.spec.ts file |

---

## **9. User Mapping Service – Backend Unit Tests**

| Test Case ID | Method / Target               | Description                                | Expected Output                  | Test File                       | Status | Comment |
| ------------ | ----------------------------- | ------------------------------------------ | -------------------------------- | ------------------------------- | ------- | --------- |
| UM-001       | createUserEmailMapping()      | Should create user email mapping          | Mapping created successfully     | user-mapping.service.spec.ts    | Done | None |
| UM-002       | getUserByEmail()              | Should retrieve user by email address     | User object returned             | user-mapping.service.spec.ts    | Done | This should be findByClientId method |
| UM-003       | updateUserEmailMapping()      | Should update existing email mapping      | Mapping updated successfully     | user-mapping.service.spec.ts    | Done | None |
| UM-004       | validateEmailFormat()         | Should validate email address format      | Valid/invalid email detected     | user-mapping.service.spec.ts    | Done | None |

---


### **9. Edge Cases & Error Handling**
#### ***NB: This was implemented in the frontend***

| Test Case ID | Component         | Scenario / Condition                  | Description                         | Expected Outcome                     | Test File / Area            | Status | Comment |
| ------------ | ----------------- | ------------------------------------- | ----------------------------------- | ------------------------------------ | --------------------------- | ------ | ------------ |
| EDGE-001     | RuleService       | Empty rule name                       | Submit form without rule name       | Validation error: "Name is required" | rule.service.spec.ts        | Done | This was implemented in the frontend for create rule CreateRulePage component. The test file name is rule.service.spec.tsx |
| EDGE-002     | RuleConfigService | No bands or cases                     | Save config missing structure       | Error: "Invalid configuration"       | rule-config.service.spec.ts | Done | This was implemented in the frontend, the component is CreateRuleConfigPage. the test file is rule-config.service.spec.ts |
| EDGE-003     | ImportService     | Invalid JSON import                   | Malformed file upload               | Error: "Invalid structure"           | utils.ts                    | Done | This was implemented for the three artifacts that have import and they are rule config (ImportRuleConfig.spec.tsx) typology (ImportTypology.spec.tsx) and network map (ImportNetworkMap.spec.tsx) |
| EDGE-004     | RuleController    | Rename deployed rule                  | Edit a deployed rule or config      | Update blocked, warning shown        | rule.controller.spec.ts     | Done | This is to check the modify name of the deployed rule. It is implemented in the frontend for rule (rule-modify.spec.tsx) |
| EDGE-007     | AppController     | Backend 500 error                     | Simulate DB timeout                 | Generic error: "Something broke"     | app.controller.ts           | Done | implemented in api.spec.tsx
| EDGE-010     | RuleConfig        | Delete last band                      | Remove final band in config         | Save blocked; validation triggered   | rule-config.service.ts      | Done | this was implemented in the frontend at rule-config.service.spec.ts |
| EDGE-012     | Typology          | Invalid scoring formula               | Broken scoring expression           | Formula validation fails             | typology.service.spec.ts    | Done | this was implemented in the frontend at typology.service.spec.tsx |
| EDGE-013     | AuthService       | Expired JWT token                     | Use expired session token           | Redirect to login / 401 error        | auth.service.ts             | Done | Duplicate of AUTH-002 |

---

### **10. API Endpoint Coverage**

| Test Case ID | Endpoint           | HTTP Method | Test File               | Purpose                               | Status     | Comment     |
| ------------ | ------------------ | ----------- | ----------------------- | ------------------------------------- | ---------- | ----------- |
| E2E-APP-001  | /                  | GET         | app.e2e-spec.ts         | Verifies backend server health (ping) | Done | None |
| E2E-AUTH-001 | /auth/login        | POST        | auth.e2e-spec.ts        | Logs in user, returns JWT             | Already Done | Duplicate of AUTH-005 |
| E2E-AUTH-002 | /auth/profile      | GET         | auth.e2e-spec.ts        | Retrieves user profile                | Already Done | Duplicate of AUTH-006 |
| E2E-RULE-001 | /rule              | POST        | rule.e2e-spec.ts        | Creates a new rule                    | Done | The name of the file is rule.controller.spec.ts |
| E2E-RULE-002 | /rule              | GET         | rule.e2e-spec.ts        | Lists all rules                       | Done | The name of the file is rule.controller.spec.ts | 
| E2E-RULE-003 | /rule/\:id         | GET         | rule.e2e-spec.ts        | Retrieves rule details                | Done | The name of the file is rule.controller.spec.ts |
| E2E-RULE-004 | /rule/\:id         | PATCH       | rule.e2e-spec.ts        | Updates rule metadata                 | Done | The name of the file is rule.controller.spec.ts |
| E2E-RULE-005 | /rule/\:id/disable | POST        | rule.e2e-spec.ts        | Disables a rule                       | Done | The name of the file is rule.controller.spec.ts |
| E2E-RULE-006 | /rule/\:id         | DELETE      | rule.e2e-spec.ts        | Marks rule as deleted                 | Done | The name of the file is rule.controller.spec.ts |
| E2E-RULE-007 | /rule/rule-config  | GET         | rule.e2e-spec.ts        | Gets rule/config mapping              | Done | The name of the file is rule.controller.spec.ts |
| E2E-RC-001   | /rule-config       | POST        | rule-config.e2e-spec.ts | Creates rule config                   | Done | The name of the file is rule-config.controller.spec.ts |
| E2E-TY-001   | /typology          | POST        | typology.e2e-spec.ts    | Creates typology with configs         | Done | The name of the file is typology.controller.spec.ts |
| E2E-TY-002   | /typology          | GET         | typology.e2e-spec.ts    | Lists all typologies                  | Done | The name of the file is typology.controller.spec.ts |
| E2E-TY-003   | /typology/\:id     | GET         | typology.e2e-spec.ts    | Gets typology details                 | Done | The name of the file is typology.controler.spec.ts |
| E2E-TY-004   | /typology/\:id     | PATCH       | typology.e2e-spec.ts    | Updates typology scoring/layout       | Done | The name of the file is typology.controller.spec.ts |
| E2E-NM-001   | /network-map       | POST        | network-map.e2e-spec.ts | Creates a new network map             | Done | The name of the file is network-map.controller.spec.ts |
| E2E-NM-002   | /network-map/\:id  | GET         | network-map.e2e-spec.ts | Retrieves network map by ID           | Done | The name of the file is network-map.controller.spec.ts |

---

**Frontend Component Tests – LoginPage**
***NB: This is part of the initial test register done during development in the first deliverables but was not tagged and labeled. All the items where properly executed and are working perfectly ***
| Test Case ID | Component | Test Description                                    | Expected Result                               | Test File                  | Status | Comment |
| ------------ | --------- | --------------------------------------------------- | --------------------------------------------- | -------------------------- | --------- | --------- |
| FE-LOGIN-001 | LoginPage | Renders email and password input fields             | Email & password fields are visible           | LoginPage.test.tsx         |
| FE-LOGIN-002 | LoginPage | Enables login button when fields are valid          | Button enabled on valid input                 | LoginPage.test.tsx         |
| FE-LOGIN-003 | LoginPage | Displays error on invalid credentials               | Error message shown                           | LoginPage.test.tsx         |
| FE-LOGIN-004 | LoginPage | Submits login form and calls authentication handler | Auth method triggered with correct data       | LoginPage.test.tsx         |
| FE-LOGIN-005 | LoginPage | Password field masked by default                    | Password input uses type="password"           | PasswordInputForm.test.tsx |
| FE-LOGIN-006 | LoginPage | Password visibility toggle works                    | Password field switches between text/password | PasswordInputForm.test.tsx |
| FE-LOGIN-007 | LoginPage | Submit disabled on empty fields                     | Login button is disabled                      | LoginPage.test.tsx         |
| FE-LOGIN-008 | LoginPage | Displays loading state during login                 | Spinner or disabled button shown on submit    | LoginPage.test.tsx         |

**Frontend Component Tests – EmailInputForm**
***NB: This is part of the initial test register done during development in the first deliverables but was not tagged and labeled. All the items where properly executed and are working perfectly ***

| Test Case ID | Component      | Test Description                                 | Expected Result                                | Test File               |
| ------------ | -------------- | ------------------------------------------------ | ---------------------------------------------- | ----------------------- |
| FE-EMAIL-001 | EmailInputForm | Renders input with correct label and placeholder | Email input field visible                      | EmailInputForm.test.tsx |
| FE-EMAIL-002 | EmailInputForm | Accepts user input and updates value             | Input value changes                            | EmailInputForm.test.tsx |
| FE-EMAIL-003 | EmailInputForm | Rejects invalid email formats                    | Shows validation error or does not submit      | EmailInputForm.test.tsx |
| FE-EMAIL-004 | EmailInputForm | Allows clearing of input                         | Input is cleared and form reflects empty state | EmailInputForm.test.tsx |

**Frontend Component Tests – PasswordInputForm**
***NB: This is part of the initial test register done during development in the first deliverables but was not tagged and labeled. All the items where properly executed and are working perfectly ***

| Test Case ID | Component         | Test Description                               | Expected Result                         | Test File                  |
| ------------ | ----------------- | ---------------------------------------------- | --------------------------------------- | -------------------------- |
| FE-PASS-001  | PasswordInputForm | Renders password field with masked input       | Input uses type="password"              | PasswordInputForm.test.tsx |
| FE-PASS-002  | PasswordInputForm | Allows toggling password visibility            | Input switches to type="text" on toggle | PasswordInputForm.test.tsx |
| FE-PASS-003  | PasswordInputForm | Displays show/hide toggle icon                 | Icon visible and interactive            | PasswordInputForm.test.tsx |
| FE-PASS-004  | PasswordInputForm | Handles onChange and updates parent form state | Parent receives updated password value  | PasswordInputForm.test.tsx |

**Frontend Component Tests – Rule Details Page**

| Test Case ID | Page / Component | Test Description                                             | Expected Result                                    | Status | Comment |
| ------------ | ---------------- | ------------------------------------------------------------ | -------------------------------------------------- | ------ | ------- |
| FE-RULE-001  | RuleListPage     | Renders rule table with columns (Name, Version, State, etc.) | Table rows displayed with expected rule data       | Done | The file name is rule-list-page.spec.tsx |
| FE-RULE-002  | RuleListPage     | Clicking "Create" opens rule creation form                   | Rule creation modal opens                          | Done | The file name is rule-list-page.spec.tsx |
| FE-RULE-003  | RuleForm         | Fills in name, description, version, and submits             | Rule added to list on success                      | Done | The name of the file is rule-form.spec.tsx |
| FE-RULE-004  | RuleForm         | Form validation triggers for empty name/description          | Error message shown, submit disabled               | Done | The name of the file is rule-form.spec.tsx |
| FE-RULE-005  | RuleListPage     | Clicking "Modify" opens rule edit form with prefilled values | Edit modal loads rule values                       | Done | The |
| FE-RULE-006  | RuleDetailsPage  | Clicking "Review" shows full rule version details            | Version panel renders bands, metadata, and actions | Done | The name of the file is rule-details.spec.tsx |
| FE-RULE-007  | RuleDetailsPage  | Submit for Review button triggers correct handler            | Status changes or API call is triggered            | Done | The name of the file is rule-details.spec.tsx |
| FE-RULE-008  | RuleDetailsPage  | Abandon and Cancel buttons function correctly                | Dialogs close or rule returns to list              | Done | The name of the file is rule-details.spec.tsx |

**Frontend Component Tests – Rule Config Page**

| Test Case ID | Page / Component   | Test Description                                                  | Expected Result                                       | Status | Comment |
| ------------ | ------------------ | ----------------------------------------------------------------- | ----------------------------------------------------- | --------- | ----------- |
| FE-RCFG-001  | RuleConfigListPage | Displays all rule configs in table with "Create Config" button    | List of rule configs is rendered                      | Done | The file name is rule-config-page.spec.tsx |
| FE-RCFG-002  | RuleConfigListPage | Clicking “Create Config” opens rule config editor                 | Modal/form appears                                    | Done | The file name is rule-config-page.spec.tsx |
| FE-RCFG-003  | RuleConfigEditor   | Allows selection of data type, description, and version           | Form values update and validation enforced            | Done | The file name is rule-config-page.spec.tsx |
| FE-RCFG-004  | RuleConfigEditor   | Adds band and case entries, validates upper/lower limit           | Entries appear under Band and Case sections           | Done | The file name is rule-config-page.spec.tsx |
| FE-RCFG-005  | RuleConfigEditor   | Saves and exits from Rule Config editor                           | Form submission triggers backend call or closes modal | Done | The file name is rule-config-page.spec.tsx |
| FE-RCFG-006  | RuleConfigReview   | Displays config metadata, parameters, bands, cases in review page | Read-only config details rendered                     | Done | The file name is rule-config-page.spec.tsx |
| FE-RCFG-007  | RuleConfigReview   | Handles edge cases (no parameters, large bands)                   | Empty states and long lists render cleanly            | Done | The file name is rule-config-page.spec.tsx |

Thanks for the clarification. Here's a **review and enhancement** of your frontend test register, incorporating all the features, behaviors, and UX interactions we've discussed throughout this chat. I’ve:

1. **Audited your existing test register** ✅
2. **Added new suggested test cases** based on implied or uncovered behaviors 🆕
3. **Noted rationale** for each suggestion to ensure traceability to product stories or UI/UX risks.

---

## ✅ Reviewed Test Register Summary

Your existing tests already provide **excellent coverage** across:

* **Canvas interactions (drag-drop, remove, zoom, restore)**
* **Form inputs and sidebar metadata**
* **Scoring mechanisms (bands, scores, rows, delete)**
* **Review flow with metadata, states, and read-only enforcement**
* **Network map CRUD and pagination**

---

## 🆕 Additional Test Cases to Consider

Here are the **enhanced tests** grouped by feature. Each includes a rationale for why it’s worth testing.

---

### 🔹 Typology Canvas

| Test Case ID    | Page / Component   | Test Description                                       | Expected Result                           | Rationale                        | Status | Comment |
| --------------- | ------------------ | ------------------------------------------------------ | ----------------------------------------- | -------------------------------- | -------- | ---------- |
| FE-TYPOLOGY-018 | TypologyCanvasPage | Drag same rule multiple times                          | Multiple rule blocks appear independently | Confirms each instance is unique | Done | The name of the file is typology-canvas-page.spec.tsx |
| FE-TYPOLOGY-020 | TypologyCanvasPage | Redo after undo                                        | Canvas re-applies the reverted action     | Completes undo/redo coverage     | Done | The name of the file is typology-canvas-page.spec.tsx |
| FE-TYPOLOGY-021 | TypologyCanvasPage | View-only mode disables drag/drop                      | Rules cannot be added or deleted          | Supports reviewer permissions    | Done | The name of the file is typology-canvas-page.spec.tsx |

---

### 🔹 Typology Scoring
***NB: this is has the same test number as Typology Canvas***

| Test Case ID    | Page / Component    | Test Description                                  | Expected Result                       | Rationale                        | Status | Comment |
| --------------- | ------------------- | ------------------------------------------------- | ------------------------------------- | -------------------------------- | --------- | --------- |
| FE-TYPOLOGY-018 | TypologyScoringPage | Enter invalid score value (e.g., -1 or text)      | Input validation error displayed      | Data integrity                   | Done | The file name is typology-scoring-page.spec.tsx |
| FE-TYPOLOGY-019 | TypologyScoringPage | Hover over band shows tooltip with description    | Tooltip with band explanation appears | Improves usability               | Done | The file name is typology-scoring-page.spec.tsx |
| FE-TYPOLOGY-020 | TypologyScoringPage | Duplicate rule-band combination not allowed       | Error or prevent duplicate UI         | Prevents scoring logic conflicts | Done | The file name is typology-scoring-page.spec.tsx |
| FE-TYPOLOGY-021 | TypologyScoringPage | Submit scoring while network is offline           | Retry or error message shown          | Offline UX resilience            | Done | The file name is typology-scoring-page.spec.tsx |
| FE-TYPOLOGY-022 | TypologyScoringPage | Save scoring and confirm graph persists on reload | Canvas reloads with same structure    | Ensures data persistence         | Done | The file name is typology-scoring-page.spec.tsx |

---

### 🔹 Network Map Page

| Test Case ID  | Page / Component   | Test Description                          | Expected Result                    | Rationale                          | Status | Comment |
| ------------- | ------------------ | ----------------------------------------- | ---------------------------------- | ---------------------------------- | ------- | -------- |
| FE-NETMAP-005 | NetworkMapListPage | Search bar filters by name or version     | Table updates in real time         | Improves navigation in large lists | Done | The file name is network-map-list.spec.tsx |
| FE-NETMAP-006 | NetworkMapEditor   | Validation prevents blank required fields | Inline error shown near field      | Prevents invalid submissions       | Done | The file name is network-map-list.spec.tsx |
| FE-NETMAP-007 | NetworkMapListPage | Sorting columns updates row order         | Sort icon toggles and list updates | UI standard behavior               | Done | The file name is network-map-list.spec.tsx |

---

### 🔹 Review Mode
***NB: duplicate of FE-RULE-006/007/008***

| Test Case ID  | Page / Component     | Test Description                                                   | Expected Result                  | Rationale | Status | Comment |
| ------------- | -------------------- | ------------------------------------------------------------------ | -------------------------------- | ------------------------ | ------- | -------- |
| FE-REVIEW-011 | RuleReviewPage       | Read-only fields are not editable even via browser dev tools       | Input stays disabled or rejected | Defends against spoofing | Already Done | Duplicate |
| FE-REVIEW-012 | RuleReviewPage       | Clicking "Submit for Review" with missing required metadata        | Blocked with message             | Enforces business rules  | Already Done | Duplicate |
| FE-REVIEW-013 | RuleReviewPage       | Reviewer role sees “Approve” button, editor does not               | Button visibility respects roles | Role-based access test   | Already Done | Duplicate |
| FE-REVIEW-015 | RuleReviewPage       | Back button returns user to previous filtered table                | Filter state preserved           | UX consistency           | Already Done | Duplicate |
