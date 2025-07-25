# 🧾 Manual Testing & Validation Workflow  
## For: Rule Configs, Typologies, and Network Maps (Tazama TMS)

## 🗂️ Sections

1. [Overview](#1-overview)  
2. [Roles & Responsibilities](#2-roles--responsibilities)  
3. [Environments & Preconditions](#3-environments--preconditions)  
4. [Workflow Steps](#4-workflow-steps)   
6. [Acceptance Criteria](#5-acceptance-criteria)  

## 1. Overview

The Tazama Configuration Service supports a flexible system to create and define **Rules**, **Rule Configurations**, **Typologies**, and **Network Maps**. Once any of the configurations have been approved for deployment, they need to be exported and tested, prior to being confirmed as deployed. Before these configurations can be deployed into production of the Tazama TMS, they must be manually verified to ensure they are logically consistent, functionally correct and secure

## 2. Roles & Responsibilities

| Role                              | Responsibility                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Rule Analyst**                  | Drafts and prepares new configurations. Validates metadata.                                            |
| **Test Analyst**                  | Executes manual validation across sample and edge case scenarios. Documents results and raises issues. |
| **TMS Admin**                     | Final approver for staging/production deployment. Monitors system-level integration and logs.          |
| **Compliance Officer (optional)** | Reviews alignment with regulatory typology definitions and risk thresholds.                            |

## 3. Environments & Preconditions

| Item                      | Description                                                             |
| ------------------------- | ----------------------------------------------------------------------- |
| **Test Environment**      | Must mirror production configuration (auth, data models, privileges).   |
| **Sample Dataset**        | Includes synthetic or masked real data covering edge and typical cases. |
| **Configuration Service** | Access to configuration service to create and export items              |

## 4. Workflow Steps

| Step | Action                                                                                                                   | Output                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| 1    | Create or import a new Rule Config, Typology, or Network Map                                                             | Draft config version            |
| 2    | Fill in all required metadata fields (name, description, version, outcomes, etc.)                                        | Metadata complete               |
| 3    | Save and start review process                                                                                            | Versioned config                |
| 4    | Export the approved item                                                                                                 | Exported item ready for testing |
| 5    | Adjust test data for new configurations                                                                                  |             New adjusted test data ready to run         |
| 6    | Run Tests to validate configurations                                                                                     |            Outputed results of tests                     |
| 7    | If test passed - configuration can move through SDLC process to Production (Tazama process for deploying configurations) |   New updated configurations ready for real world use                              |
| 8    | Once in Production, Config Service can be updated to mark item as deployed                                               |  Updated state in the config service                               |


### 4.1 Functional Scenario Testing

| Test                | Description                                                                    | Expected Outcome                       |
| ------------------- | ------------------------------------------------------------------------------ | -------------------------------------- |
| **Positive Case**   | Create clean test data that should trigger rule/typology                       | Expected alert or match is generated   |
| **Negative Case**   | Create data that should NOT trigger config                                     | No alert or action                     |
| **Edge Case**       | Data missing optional fields, max values, empty arrays                         | System handles gracefully, logs errors |
| **Link Traversal**  | For network maps, test deep and circular relationships                         | Map correctly resolves entities        |
| **Workflow Output** | Typology routes cases into defined buckets (e.g. “High Risk”, “Manual Review”) | Correct assignment or escalation       |

### 4.2 Audit & Logging Review

| Action | Description                                                                      |
| ------ | -------------------------------------------------------------------------------- |
| 1      | Review TMS logs for errors or unhandled exceptions from config execution         |
| 2      | Confirm TMS Output logs match backend state (rule scores, case creation, alerts) |

### 4.3 Edge & Failure Case Testing

| Edge Case              | Test                                                       |
| ---------------------- | ---------------------------------------------------------- |
| Missing Parameters     | Try using a rule config with a missing required input      |
| Invalid Rule Reference | Use a typology with a rule ID that doesn’t exist           |
| Circular Logic         | Typology decision tree loops back on itself                |
| Time-based Expiry      | Check config version expiry if enabled                     |
| Large Datasets         | Apply config to 10k+ synthetic records to test scalability |

### 4.6 Staging Deployment

| Step  | Action                                      | Responsible           |
| ----- | ------------------------------------------- | --------------------- |
| 4.6.1 | Deploy verified config into staging         | TMS Admin             |
| 4.6.2 | Run real-time event simulation if supported | Test Analyst          |
| 4.6.3 | Perform smoke tests on key use cases        | Configuration Analyst |
| 4.6.4 | Final sign-off                              | All stakeholders      |

## 5. Acceptance Criteria

A Rule Config / Typology / Network Map is approved for deployment if:

- All test cases pass, including edge cases  
- It adheres to schema and syntax specifications  
- It functions correctly on real or synthetic data    
- Approved by peer reviewer and TMS Admin  
