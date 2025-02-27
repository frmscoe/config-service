# Rules

## Introduction

Once a user has been authenticated via the login service, the user should be able to view the list of rules returned from the backend service.  
The user cannot access this page without being logged in.  
The user cannot access this page without being authorised in.  
The user is be able to view, sort and filter any of the following fields  

- Name
- Description
- Version
- Owner
- State

### Open Rules Page

```mermaid
sequenceDiagram
title Sequence Diagram: Open Rules Page
    actor User as Rule Analyst
    participant FE as Frontend
    participant BE as Backend
    participant auth as Auth_Service

    User->>FE: Requests Rules Page
    FE->>BE: Request Rules page
    BE->>auth: Validate token
    alt valid token
        auth->>BE: Valid token<br>with appropriate priveleges
        BE->>FE: Rules Landing Page
    else token not valid
        auth->>BE: invalid token
        BE->>FE: Access Denied
    end
```

### View List of rules

The service allows the user to view all rules from the backend assuming the have appropriate privileges

```mermaid
sequenceDiagram
title Sequence Diagram: Rules Retrieval and Pagination
    actor User as Rule Analyst
    participant FE as Frontend
    participant BE as Backend
    participant auth as Auth_Service

Note over User,BE: Assumption authenticated to the service
    User->>FE: Requests all rules
    FE->>BE: Request all rules
    BE->>auth: Validate token

    alt valid token
        auth->>BE: Valid token<br>with appropriate priveleges
        BE-->>FE: Return all rules
        alt Rules retrieved successfully
            FE->>User: Display all rules in table
        else Error retrieving rules
            FE->>User: Display error message
        end
        User->>FE: Clicks pagination button
        FE->>BE: Request next page of rules
        BE-->>FE: Return next page of rules
        alt Rules retrieved successfully
            FE->>User: Display next page of rules in table
        else Error retrieving rules
            FE->>User: Display error message
        end
    else token not valid
        auth->>BE: invalid token
        BE->>FE: Access Denied
    end

```

### Filter List of rules

User  filter rules currently displayed in the table

```mermaid
sequenceDiagram
title Sequence Diagram: Rule Filtering
    actor User as Rule Analyst
    participant FE as Frontend

    User->>FE: Clicks filter icon next to column name
    FE->>FE: Pick filter criteria
    FE->>FE: Apply filter to loaded list on UI (fields: name, description, state, owner, version)
    FE->>User: Display filtered list in table

```

### Sort List of rules

```mermaid
sequenceDiagram
title Sequence Diagram: Rule Sorting 

    actor User as Rule Analyst
    participant FE as Frontend

    User->>FE: Clicks sort arrow  next to column name
    FE->>FE: Click either up arrow or down arrow
    FE->>FE: Apply sort to loaded list on UI (fields: name, description, state, owner, version)
    FE->>User: Display sorted list in table

```
