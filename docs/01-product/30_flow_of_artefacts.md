<!-- SPDX-License-Identifier: Apache-2.0 -->
# Stages and Artefact will follow during its lifecycle

## Introduction

All artefacts will follow a similar process for creation, review and design before deployment - that is summarised in the following diagram.

## Artefact Lifecycle Stages

```mermaid
flowchart TD
    0((Start))-->00
    00 -->|cancel| Z((End))
    00(Modify/New) -.->|submitConfig| 10
    00 -->|save for later| 01(Edit)
    01 -->|submit Config| 10{Review}
    01 -->|amend existing<br/>00 draft| 00
    01 -->|save too long for later| 90(abandoned)
    10 -->|approve Config| 20{Deploy}
    10 -->|withdraw Config| 12(Undeployed Reject)
    10 -->|rejected| 11(rejected)
    11 -->|resumeConfig| 01 
    11 --> 90
    12 -->|archived| 91
    12 -->|left too long| 90
    12 --> 01
    20 -->|deployConfig| 30(Deployed)
    20 -->|tests fail| 12(Withdrawn)
    30 -->|retire config| 32(Retired)
    32 -->|archive| 91(archived)
    00 -->|discard| 90
    90 --> Z
    91 --> Z
    
```
