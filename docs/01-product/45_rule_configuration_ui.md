# Rule Configuration

## Introduction

Once a user has been authenticated via the login service, the user should be able to view the list of rules with configuration returned from the BE service. 
The user cannot access this page without being logged in.  
The can be able to view, sort and filter any of the following fields  

- Name
- Description
- Version
- Owner
- State
- rule configurations

### Open Rule Configuration Page

```mermaid
sequenceDiagram
title Sequence Diagram: Open Rule Configuration Page
    actor User as Rule Analyst
    participant FE as Frontend
    participant BE as BackEnd
    participant auth as Auth_Service

    User->>FE: Requests Rule Configuration Page
    FE->>BE: Request Rule Configuration page
    BE->>auth: Validate token
    alt valid token
        auth->>BE: Valid token<br>with appropriate priveleges
        BE->>FE: Rule Configuration Landing Page
    else token not valid
        auth->>BE: invalid token
        BE->>FE: Access Denied
    end
```

### View List of rules with configurations

The service allows the user to view all rules from the BE assuming the have appropriate privileges

```mermaid
sequenceDiagram

title Sequence Diagram: Rule Configuration Retrieval and Pagination

    actor User as Rule Analyst
    participant FE as Frontend
    participant BE as BackEnd
    participant auth as Auth_Service
Note over User,BE: Assumption authenticated to the service

    User->>FE: Requests all rules with configurations
    FE->>BE: Request all rules with configurations
    BE->>auth: Validate token
    alt valid token
        auth->>BE: Valid token<br>with appropriate priveleges
        BE-->>FE: Return all rules with configurations
        alt rules with configurations retrieved successfully
            FE->>User: Display all rules with configurations in table
        else Error retrieving rules with configurations
            FE->>User: Display error message
        end

        User->>FE: Clicks pagination button
        FE->>BE: Request next page of rules with configurations
        BE-->>FE: Return next page of rules with configurations
        alt rules with configurations retrieved successfully
            FE->>User: Display next page of rules with configurations in table
        else Error retrieving rules with configurations
            FE->>User: Display error message
        end

        User->>FE: Clicks + sign to expand rule configurations
        FE->>FE: Expand configurations for the clicked rule
        FE->>User: Display expanded configurations list for the rule
    else token not valid
        auth->>BE: invalid token
        BE->>FE: Access Denied
    end

```

### Create Config

```mermaid
sequenceDiagram
title Sequence Diagram: Open Specific Rule Configuration Page to edit
    actor User as Rule Analyst
    participant FE as Frontend
    participant BE as BackEnd
    participant auth as Auth_Service

    User->>FE: Requests Rule [ID] Configuration Page
    FE->>BE: Request Rule [ID] Configuration Page
    BE->>auth: Validate token
    alt valid token
        auth->>BE: Valid token<br>with appropriate priveleges
        BE->>FE: Rule [ID] Configuration Page
        FE->>FE: Open Form with 4 collapsible sections: Information, Parameters, Conditions
        User->>FE: Fill information form and  selects category (Cases or Bands)
        FE->>FE: Show corresponding form section for either bands or cases

        alt User opens parameter options
            User->>FE: Adds new parameter field
            FE->>FE: Add new input field in Parameter form
        else User removes parameter field
            User->>FE: Removes parameter field
            FE->>FE: Remove corresponding input field from Parameter form
        end

        alt User expands Exit condition to show list
            User->>FE: Press Delete icon on Exit Condition
            FE->>FE: Removes Exit Condition from list 
        else User Clicks Restore Button
            FE->>FE: Return full list of exit conditions
        end

        alt User expands new band/case field
            User->>FE: Adds new band/case field
            FE->>FE: Add new input field in Bands/Cases form
        else User removes band/case field
            User->>FE: Removes band/case field
            FE->>FE: Remove corresponding input field from Bands/Cases form
        end

        User->>FE: Submits the form
        FE->>FE: Validate form data
        FE->>FE: Check for form errors
        alt Form is invalid
            FE->>User: Show errors
        else Form is valid
            FE->>BE: Send form data
            BE->>BE: Process form data
            BE->>BE: Check for data validity
            alt Data is valid
                BE->>BE: Save data
                BE-->>FE: Return status code 201 (Success)
            else Data is invalid
                BE-->>FE: Return status code >400 (Error)
            end
            alt Success
                FE->>User: Show success message
            else Error
                FE->>User: Show error message
            end
        end
    else token not valid
        auth->>BE: invalid token
        BE->>FE: Access Denied
    end
```

#### Create rule configuration Cases

```mermaid
sequenceDiagram
title Sequence Diagram: Create Rule Configuration Cases

    participant user
    participant FE as FrontEnd

    user->>FE: Interacts with FE
    FE->>FE: Renders ValueField component
    FE->>FE: Renders Ant Design components (InputNumber, DatePicker, Select)
    FE->>FE: Utilizes React Hook Form for form control
    FE->>FE: Uses utility functions for conversions
    FE->>FE: Utilizes Common Translations Hook for translations
    FE->>FE: Manipulates and manages data fields (days, hours, minutes, seconds, epoch time)

    alt User selects Time data type
        user->>FE: Selects Time data type
        FE->>FE: Displays InputNumber for epoch time
        FE->>FE: Displays InputNumber for days
        FE->>FE: Displays InputNumber for hours
        FE->>FE: Displays InputNumber for minutes
        FE->>FE: Displays InputNumber for seconds
        user->>FE: Enters values for each field
        FE->>FE: Updates epoch time based on entered values
    end

    alt User selects Calendar Date Time data type
        user->>FE: Selects Calendar Date Time data type
        FE->>FE: Displays DatePicker for date selection
        FE->>FE: Displays DatePicker for time selection
        user->>FE: Selects date and time
        FE->>FE: Converts selected date and time to epoch time
    end

    alt User selects Numeric data type
        user->>FE: Selects Numeric data type
        FE->>FE: Displays InputNumber for numeric value
        user->>FE: Enters numeric value
        FE->>FE: Stores entered numeric value
    end

```

#### Band Configuration

```mermaid
sequenceDiagram
    participant User
    participant FE as FrontEnd

    User ->> FE: Initiates operation (e.g., append, prepend, remove, slider change)
    FE ->> FE: Retrieves form state
    FE ->> FE: Retrieves bands fields
    alt Append Operation
        FE ->> FE: Append new band
        loop Update Upper Limits
            FE ->> FE: Update upper limit of existing bands
        end
    else Prepend Operation
        FE ->> FE: Prepend new band
        loop Update Upper Limits
            FE ->> FE: Update upper limit of existing bands
        end
    else Remove Operation
        FE ->> FE: Remove band at index
        loop Update Upper Limits
            FE ->> FE: Update upper limit of preceding bands
        end
    else Slider Change Operation
        FE ->> FE: Update slider value at index
        loop Update Upper Limits
            FE ->> FE: Update upper limit of preceding bands
        end
    end
    FE ->> User: Updates UI with new bands list
```
