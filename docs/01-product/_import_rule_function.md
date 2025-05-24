<!-- SPDX-License-Identifier: Apache-2.0 -->

# Processes For importRuleFunction

## Introduction

This document outlines the automated test coverage for the **Import Rule** feature implemented in the `config-service-fe` frontend. The goal of these tests is to ensure the feature behaves as expected under all key user flows and system interactions.

## Background

The import functionality was introduced under the following PR stories:

- **129**: No existing rule
- **130**: Existing rule, user chooses to create a new one
- **131**: Existing rule, user chooses to use it, but config doesn't match
- **132**: Existing rule, config matches, user reuses it

While no dedicated test register exists for each story, this suite covers all relevant logic and user flows.

---

## Frontend Interaction Flow

```mermaid
sequenceDiagram
 Title: Import Configuration Process
    autonumber
    actor user as Rules Analyst
    participant fe as Front End 
    participant api as Backend
    participant db as Database
    user->>fe: Select "Upload File" button
    activate fe
    fe->>user: Open file browser
    user->>fe: Uploads JSON file
    fe->>fe: Parse JSON content
    alt JSON parsing fails
        fe->>user: Display JSON parsing error
    else JSON parses successfully
        fe->>api: GET /rule/name/{ruleName}
        activate api
        api->>db: Query rule by name
        activate db
        db->>api: Return rule data
        deactivate api
        api->>fe: Rule data response
        alt Rule exists
            fe->>api: GET /rule-config/{ruleId}
            activate api
            api->>db: Query rule config by rule ID
            activate db
            db->>api: Return rule config data
            deactivate db
            deactivate api
            api->>fe: Rule config data response
            alt Rule config exists
                fe->>user: Option to update rule and config
            else Rule config not found
                fe->>user: Option to create new rule config
            end
        else Rule not found
            fe->>user: Option to create new rule
        end
    end
    user->>fe: Choose operation (Create or Update)
    fe->>user: User inputs missing data and selects version update type (major, minor, patch)
    alt Create new rule and config
        fe->>api: POST /rule/import to create new rule and config
        activate api
        api->>db: Save new rule and config
        activate db
                db->>api: Return save success
        deactivate db
         deactivate api
        api->>fe: Return 201 created
    else Update existing rule and config
        fe->>api: POST /rule/import to update existing rule and config
        activate api
        api->>db: Update rule and config
        activate db
        db->>api: Return update success
        deactivate db
        deactivate api
        api->>fe: Return 201 updated
    end
    fe->>user: Show success or error message based on response
    deactivate fe
