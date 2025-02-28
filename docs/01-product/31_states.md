<!-- SPDX-License-Identifier: Apache-2.0 -->
# States of artefacts in the Configuration services

## Introduction

As the various artefacts move through different stages of deployment, their state is updated, until such time as they are either archived or abandoned. Different processes will ensure that only authorised parties move artefacts between the states, and as they are moved, all these changes are captured in an auditable log.

## States

```mermaid
---
title: State
---
stateDiagram-v2
    direction LR
    00 : 00 - New
    01 : 01 - Draft
    10 : 10 - Pending Review
    11 : 11 - Rejected
    12 : 12 - Withdrawn
    20 : 20 - Approved
    30 : 30 - Deployed
    31 : 31 - Withdrawn
    32 : 32 - Retired
    90 : 90 - Abandoned
    91 : 91 - Archived

%% Happy Path

    [*] --> 00
    00 --> [*]
    00 --> 10
    00 --> 01
    01 --> 10
    10 --> 20
    20 --> 30
    30 --> 32
    32 --> 91
    91 --> [*]

%% Draft Abandoned
    01 --> 90
    90 --> [*]

%% Review Assessment Reject
    10 --> 11
    11 --> 01
    11 --> 90

%% Review Assessment Withdraw

    10 --> 12
    12 --> 01
    12 --> 90
    12 --> 91

%% Test Failure
    20 --> 12

%% Archive WIP
    12 --> 91

%% Forgotten Work
    01 --> 90
    11 --> 90
    12 --> 90
    90 --> [*]

```

## Open Questions

12 and 31 are both withdrawn, is 31 valid, as a withdrawn from Deployed is managed from 32? So use 32 to 01

31 --> 01 is this a withdrawn config that is then sent back to draft, surely this should come from an existing definition and be brought back as a new ID

We need to discuss the decommissioning of a rule config.
A rule will be deployed, then retired - either because it is no longer needed, or it is replaced. If you are updating, you should have created a new one.

How do I get to a rule configuration?
I need to edit an existing rule, and select its configuration
Or create a new rule

