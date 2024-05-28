
## Introduction

Once a user has been authenticated via the login service, if they have sufficient access rights because of their role, they can now do the following with rules:

- Create
- Import a Draft
- Save a draft
- Delete a Draft Rule
- Disable non Draft Rules
- Review any Rule type
- Modify any Rule type
- Submit a Draft rule for Approval

This documentation assumes an understanding of the [flow of artefacts](50_flow_of_artefacts.md) and [states](51_states.md) of any event

## Rules
### Create a Rule
The service will allow for a Rule to be created
```mermaid
sequenceDiagram
    title Creating a New Rule
    autonumber
        # declare actors
        actor fe as Front End
        participant be as Backend
        participant bc as Security Bound Context
        participant db as Database
        fe->>be: Create New Rule
        be->>bc: validates User and permissions
        bc->>db: Save rule in database
        db->>be: saved Rule
        be->>fe: Saved Rule

```

### Import a Rule
```mermaid
sequenceDiagram
    title Importing a rule
    autonumber
        # declare actors
        actor fe as Front End
        participant be as Backend
        participant bc as Security Bound Context
        participant db as Database
        fe->>be: Create New Rule
        be->>bc: validates User and permissions
        bc->>db: Save rule in database
        db->>be: saved Rule
        be->>fe: Saved Rule

```

### Get Rule
```mermaid
sequenceDiagram
    title Gets a rule
    autonumber
        # declare actors
        actor fe as Front End
        participant be as Backend
        participant bc as Security Bound Context
        participant db as Database
        fe->>be: rule id
        be->>bc: validates User and permissions
        bc->>be: Does rule exist
        be->>db: finds a rule
        db->>be: rule
        be->>fe: rule

```

### Get Rules
```mermaid
sequenceDiagram
    title Gets Rules
    autonumber
        # declare actors
        actor fe as Front End
        participant be as Backend
        participant bc as Security Bound Context
        participant db as Database
        fe->>be: request
        be->>bc: validates User and permissions
        bc->>be: validated user
        be->>db: finds rules
        db->>be: rule
        be->>fe: rule

```


### Modify a Rule
```mermaid
sequenceDiagram
    title Modify a rule
    autonumber
        # declare actors
        actor fe as Front End
        participant be as Backend
        participant bc as Security Bound Context
        participant db as Database
        fe->>be: modify rule data
        be->>bc: validates User and permissions
        bc->>be: Does rule exist
        be->>db: Saves a new rule with the originatedId in the database
        db->>be: new saved Rule
        be->>fe: new saved Rule

```

### Disable a Rule
```mermaid
sequenceDiagram
    title Disable a rule
    autonumber
        # declare actors
        actor fe as Front End
        participant be as Backend
        participant bc as Security Bound Context
        participant db as Database
        fe->>be: rule to be disabled
        be->>bc: validates User and permissions
        bc->>be: Does rule exist
        be->>db: changes rule state to 92_DISABLED
        db->>be: disabled Rule
        be->>fe: disabled Rule

```

### Mark a Rule For Deletion
```mermaid
sequenceDiagram
    title Mark a rule for Deletion
    autonumber
        # declare actors
        actor fe as Front End
        participant be as Backend
        participant bc as Security Bound Context
        participant db as Database
        fe->>be: rule to be marked for deletion
        be->>bc: validates User and permissions
        bc->>be: Does rule exist
        be->>db: changes rule state to 92_DISABLED
        db->>be: disabled Rule
        be->>fe: disabled Rule

```