---  
sidebar_position: 2  
sidebar_label: import rule config
title: Import an existing rule configuration
date: 2023-11-17 08:41:28
author: Rob Reeve
---  


## Introduction

As the platform allows for sharing of typologies, it is possible that rules and their configuration files might be shared from one deployment to another. Because of this we need the ability to import the files in to the platform.

## Simple Import

```mermaid
sequenceDiagram

Title: Import Configuration
autonumber

# declare actors
actor user as Rules Analyst
participant fe as Front End
participant be as Back End
participant db as Back End

# start flow
user->>fe: Select import existing file
activate fe
fe->>user: open "browse this computer"<br/>to find file
user->>fe: upload file

fe->>fe: Check not malicious code
fe->>fe: Analyse imported JSON
fe->>be: Check for existing Rule<br/>Use ID or Description
deactivate fe
activate be
be->>db: query ID
activate db
db->>be: query Data
deactivate db
be->>db: query Description
activate db
db->>be: query Data
deactivate db
deactivate be

alt No existing rule
    be->>fe: No existing rule
    activate fe
    fe->>fe: No Existing rule process
    deactivate fe
else Existing rule
    be->>fe: Existing rule:<br/>- ID match,<br/>- Description match,<br/>- both match
    activate fe
    fe->>fe: Existing rule process
    deactivate fe
end
```

## No existing rule Process

```mermaid
sequenceDiagram

Title: Import Configuration no existing rule
autonumber

# declare actors
actor user as Rule Analyst
participant fe as Front End
participant be as Back End
participant db as Back End

# start flow

be->>fe: No existing rule
activate fe
fe->>fe: Rule and Rule config<br/>State set to 00
fe->>fe: Rule and Rule config version<br/>set to 1.0.0
fe->>fe: Rule and Rule config<br/>ownerID set to MyID
fe->>user: enter missing data
deactivate fe
user->>fe: manually select dataType
user->>fe: modify description
user->>fe: save
activate fe
fe->>be: Create new rule
activate be
be->>fe: Confirmed
deactivate be
fe->>be: Create new rule configuration
activate be
be->>fe: Confirmed
deactivate be
fe->>user:all saved
deactivate fe
```

## Existing Rule

```mermaid
sequenceDiagram

Title: Import Configuration Existing rule
autonumber

# declare actors
actor user as Rule Analyst
participant fe as Front End
participant be as Back End
participant db as Back End

# start flow
activate fe
fe->>user: Do you want to use<br/>the existing rule?
deactivate fe
alt Use Existing rule - Yes
        user->>fe: yes
        activate fe
        fe->>be: Check for existing Rule Config<br/>Use ID or Description
        activate be
        be->>db: query ID
        activate db
        db->>be: query Data
        deactivate db
        be->>db: query Description
        activate db
        db->>be: query Data
        deactivate db
        deactivate be
        deactivate fe
        alt No Existing Rule Config
            be->>fe: No existing rule Config
            activate fe
            fe->>fe: set rule config state to 00
            fe->>fe: set rule config version to 1.0.0
            fe->>fe: set rule config OwnerID to MyID
            fe->>be: Save new rule configuration
            be->>fe: Confirmed
            fe->>user: Rule Config saved
            deactivate fe

        else Existing Rule Config
            be->>fe: Existing rule config:<br/>- ID match,<br/>- Description match,<br/>- both match
            activate fe
            fe->>fe: Existing rule and rule config process
            deactivate fe
            
        end
else Use Existing rule - No
    user->>fe: no
    activate fe
    fe->>fe: Rule and Rule config<br/>State set to 00
    fe->>fe: Rule version set to n.0.0
    note over fe: n = [highest rule major version that matches this rule] + 1
    fe->>fe: Rule Config version set to 1.0.0
    fe->>fe: Rule and Rule config<br/>ownerID set to MyID

    fe->>user: enter missing data
    deactivate fe
    user->>fe: manually select dataType
    user->>fe: modify description
    activate fe
    fe->>be: Create new rule
    activate be
    be->>fe: Confirmed
    deactivate be
    fe->>be: Create new rule configuration
    activate be
    be->>fe: Confirmed
    deactivate be
    fe->>user: all saved
    deactivate fe

end
```

### Existing Rule and Rule Config

```mermaid
sequenceDiagram

Title: Import Configuration Existing Rule Existing rule Config
autonumber

# declare actors
actor user as Rule Analyst
participant fe as Front End
participant be as Back End
participant db as Back End

# start flow
            be->>fe: Existing rule config:<br/>- ID match,<br/>- Description match,<br/>- both match
            activate fe
            fe->>user: Rule Config Found<br/>Do you want to keep<br/>the existing rule config?
            deactivate fe
            alt use Existing Rule Config
                user->>fe: yes
                activate fe
                fe->>fe: Discard the rule
                fe->>user: Process cancelled
                deactivate fe
            else do not use Existing Rule Config
                user->>fe: no
                activate fe
                fe->>fe: Rule config<br/>ID set to Max Old ID + 1
                fe->>fe: Rule config version set to n.0.0
                note over fe: n = [highest rule config major version that matches this rule] + 1
                fe->>fe: Rule config<br/>State set to 00
                fe->>fe: Rule and Rule config<br/>ownerID set to MyID
                fe->>be: Save Rule Config
                be->>fe: Save Rule Config completed
                fe->>user: Rule Saved
                deactivate fe
            end
        
```

(c) LexTego ltd 2021-2024