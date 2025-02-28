<!-- SPDX-License-Identifier: Apache-2.0 -->
# Rules Builder Target Customers

One of the major challenges for the users of the Tazama FRMS solution is that invariably they are in a department that is ordinarily a cost centre. Any investment in technology has to minimise the further operational costs of the solution.

Compliance managers do not always have technical knowledge, so requiring the input of further technical resources will be challenging our default assumption of reducing operational costs.  The initial iteration of the product needs to provide tooling for these compliance managers, so they can add new rules and typologies, that are then deployed to production with minimal interaction of technical teams.

Compliance managers will have a good understanding of the typologies and the impact of any exposure to risks, as well as the controls they would deploy in the form of rules. They will not have a good understanding of the CI/CD process and the testing, so these elements should be addressable from within the platform.

## High Level product requirements

### Login and Access

The system will be multi-tenant, accommodating multiple users from the same company or different companies. It will come with a set of pre-established rules and typologies against given events and existing formats. Despite being used by multiple companies, the system ensures data confidentiality as users can only access default rules or rules that have been created by their organisation themselves.

### Event or Data Analysis

The builder provides an intuitive interface where users can easily create new rules by dragging a data file (JSON or XML) onto a blank page. The system will then intelligently analyze whether this is a new or existing data type. Users can define the related events to this data file, confirm the automatically selected data type, and assign the data type to an existing endpoint.

### Rules Builder

The rules builder enables users to create or modify rules with version control for enhanced management. The system allows for building rules against a single data point or combination of data points within an event, and with multiple calibrations. It also provides functionalities to compare similar data types, perform calculations, and assess against predefined functions. The results can then be added to existing or new typologies.

### Typology Builder

The typology builder also incorporates version control, ensuring the orderly management of different typologies. Users can select an existing typology or create a new one directly after a rule has been created. Once a typology is selected, users can modify the impact of a rule, add or delete other rules, or create a new rule for the typology. The builder also facilitates the combined assessment of different rule outcomes for the typology assessment.

### CI/CD

The system supports continuous integration and continuous delivery (CI/CD) processes. Users can view all deployed rules and typologies, while orphaned rules or typologies (rules without a typology or vice versa) cannot be deployed. The user interface clearly displays all currently deployed rules and typologies. Any new or updated typology will be accompanied by dedicated sample data, classified as existing or "to process" (for testing the rule). If there is no data for a typology, users are prompted to load the data. Once the data, rule, and processor are confirmed, they can be submitted for CI/CD assessment. To maintain system integrity, a user who makes a commit cannot approve the changes - this task must be carried out by a separate checker.

### Multi Lingual

As the platform is for developing nations primarily, it needs to allow a user to change their language quickly and easily. It cannot be assumed that text will flow left to right, as right to left is also common in the initial deployments.
