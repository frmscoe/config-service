# Create and Edit Rules

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

### Create Rule  

```mermaid
sequenceDiagram
title Sequence Diagram: Rule Creation

    actor User as Rule Analyst
    participant FE as Frontend
    participant BE as Backend
    participant auth as Auth_Service

    User->>FE: Clicks create button
    FE->>BE: Validate token
    BE->>auth: Validate token
    alt valid token
        auth->>BE: Valid token<br>with appropriate priveleges
        BE->>FE: Valid token<br>with appropriate priveleges
        FE->>FE: Open modal with fields (name, description, datatype)
        User->>FE: Enters data in all fields
        User->>FE: Submits the form
        FE->>FE: Validate form data (name, description, datatype, version)
        alt Form data is valid
            FE->>BE: Send data to backend
            BE-->>FE: Data saved successfully
            FE->>User: Show success message and clear form
        else Form data is not valid
            FE->>User: Show form validation errors
        end
        BE-->>FE: Error saving data
        FE->>User: Show error message
    else token not valid
        auth->>BE: invalid token
        BE->>FE: Access Denied
    end
```

### Edit Rule  

```mermaid

sequenceDiagram
title Sequence Diagram: Rule Edit

    actor User as Rule Analyst
    participant FE as Frontend
    participant BE as Backend
    participant auth as Auth_Service

    User->>FE: Clicks Modify button
    FE->>BE: Validate token
    BE->>auth: Validate token
    alt valid token
        auth->>BE: Valid token<br>with appropriate priveleges
        BE->>FE: Valid token<br>with appropriate priveleges
        alt Rule is in Draft State(01_DRAFT)
            FE->>User: Opend Edit modal with default rule data
            User->>FE: User make changes to fields(name, description)
            User->>FE: Click Submit
            alt Form data is valid
                FE->>BE: PATCH /rule/:id 
                BE-->>FE: Data saved successfully
                FE->>User: Show success message 
            else Form data is not valid
             FE->>User: Show form validation errors
            end

            FE->>BE: Send data to backend
            BE-->>FE: Data saved successfully
            FE->>User: Show success message and clear form
        else Rule is in any other state eg 10_PENDING_REVIEW
            FE->>User: Show confirmation for user to create new rule with default information
            alt User click Ok
                FE->>User: Open create modal with default data
                FE-->>BE: Fetch all rules GET /rules 200 
                FE->>User: Show success message and clear form
                User->>FE: User enter desired data like name, description, type of change(major, minor, patch)
                User->>FE: Click Submit to save data
                FE-->FE: Calcuate new version based off type of change
                FE-->BE: POST /rules 200 {name, description, cfg, state}
            else User clicks cancel
                FE->>User: Close confirmation modal and do nothing
            end
        end
    else token not valid
        auth->>BE: invalid token
        BE->>FE: Access Denied
    end


```
