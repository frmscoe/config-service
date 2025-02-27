<!-- SPDX-License-Identifier: Apache-2.0 -->
# Typology Configuration

taken from [eKuta documentation](https://frmscoe.atlassian.net/wiki/spaces/FRMS/pages/76906497/Configuration+management#2.2.-Typology-Configuration)

## Introduction

The typology processor collects rule results and compiles the rule results into a variety of fraud and money laundering scenarios, called typologies. Unlike rule processors that have specific and unique functions guided by their individual configurations, the typology processor is a centralized processor that arranges rules into scenarios based on multiple typology-specific configurations. Effectively, a typology is described solely by its configuration and does not otherwise exist as a physical processor. When the typology processor receives a rule result, it determines which typologies rely on the result and a typology-specific configuration is used to formulate the scenario.

A typology processor configuration document typically contains the following information:

- Typology configuration metadata
- A ```rules``` object, that specifies the weighting for each rule result by sub-rule reference
- An ```expression``` object, that defines the formula for calculating the typology score out of the rule result weightings
- A ```workflow``` object, that contains the alert and interdiction thresholds against which the typology score will be measured

## Typology configuration metadata

The typology configuration “header” contains metadata that describes the typology. The metadata includes the following attributes:

- ```id``` identifies the specific typology processor and its version that will be used by the configuration. There will typically only be a single typology processor active in the platform at a time, but it is possible and conceivable that multiple typology processors and/or versions can co-exist simultaneously. It is recommended that the typology processor “name” is drawn from the source-code repository where the typology processor code resides, and the version should match the semantical version of the source code as defined in the source code.
- ```cfg``` is the unique version of the typology configuration. Though unlikely, multiple different versions of a typology configuration can co-exist simultaneously in the platform. The configuration consists of two parts: an arbitrary identifier for the typology to differentiate one typology from another, and then, separated by an @, a semantical version that defines the specific version of the configuration for that typology, for example typology-001@1.0.0. 
- ```desc``` offers a readable description of the typology

The combination of the ```id``` and ```cfg``` strings forms a unique identifier for every rule configuration and is sometimes compiled into a database key, though this is not essential: the database enforces the uniqueness of any configuration to make sure that a specific version of a configuration can never be over-written.

> :exclamation: **Why does the typology configuration cfg look different from the rule configuration cfg?**  
> A rule processor (defined by its id) is closely paired with its configuration (defined by the cfg): the configuration works for that rule processor and no other, and the rule processor won't work with another rule processor's configuration.  
> 
> A typology processor is a generic “engine” processor. It is not paired with a specific typology the way a rule processor is - it is intended to work for multiple, if not all, typologies. The typology configuration needs another way to reference the specific typology that will be scored by the typology processor. For that reason, the cfg attribute is subdivided in the same way as the id into name and a version parts. And remember we can have multiple parallel typology processors if we need them, so the id describes the specific typology processor and its version (for routing purposes), and the cfg describes the specific typology and the version of its configuration.

Example of the typology configuration metadata:


```json
{
  "id": "typology-processor@1.0.0",
  "cfg": "typology-001@1.0.0",
  "desc": "Use of several currencies, structured transactions, etc",
  ...
  }
```

## Typology attributes

In addition to these parameters required in the file itself, the following are required in the database so we can actually create a more human readable version, and the hooks we need to track this through the platform.

| Name         | Type         | Description                                                        |
| ------------ | ------------ | ------------------------------------------------------------------ |
| ID           | string       | system-generated UUIDv4 identifier                                 |
| typologyID   | Int          | the typology ID                                                    |
| typologyName | varChar(255) | A simple description of the typology                               |
| state        | int          | The current state will default to 00 (new)                         |
| createdAt    | DateTime     | the date and time the configuration was first created, or imported |
| UpdatedAt    | DateTime     | the date and time the configuration was last updated               |
| ownerID      | int          | the ID of the person that created the rule                         |
| approverID   | int          | the ID of the person that approved the rule                        |

(c) LexTego ltd 2021-2024

### typology Table

| Name                | Type         | Description                                                   |
| ------------------- | ------------ | ------------------------------------------------------------- |
| typologyUUID        | string       | system-generated UUIDv4 identifier                            |
| typologyID          | Int          | the Typology processor ID                                     |
| typologyName        | varChar(255) | a short name for the Typology                                 |
| typologyDescription | varChar(255) | A simple description of the Typology                          |
| typologyVersion     | varChar(255) | x.y.z versioning                                              |
| typologyCategoryID  | Int          | the Typology processor ID                                     |
| state               | int          | The current state will default to 00 (new)                    |
| createdAt           | DateTime     | the date and time the Typology was first created, or imported |
| UpdatedAt           | DateTime     | the date and time the Typology was last updated               |
| ownerID             | int          | the ID of the person that created the Typology                    |
| approverID          | int          | the ID of the person that approved the Typology                   |
|                     |              |                                                               |

### typologyCategory table

| Name                 | Type         | Description                                                            |
| -------------------- | ------------ | ---------------------------------------------------------------------- |
| typologyCategoryID   | Int          | the Typology Category ID (auto incrementing)                           |
| typologyCategoryName | varChar(255) | a short name for the Typology Category                                 |
| createdAt            | DateTime     | the date and time the Typology Category was first created, or imported |
| UpdatedAt            | DateTime     | the date and time the Typology Category was last updated               |
| ownerID              | int          | the ID of the person that created the Typology Category                |
| approverID           | int          | the ID of the person that approved the Typology Category               |
|                      |              |                                                                        |

## Typology and assigned Rule and Config Table

typologyRuleConfig

| Name                   | Type     | Description                                                               |
| ---------------------- | -------- | ------------------------------------------------------------------------- |
| typologyRuleConfigUUID | string   | UUIDv4 identifier                                                         |
| typologyUUID           | string   | UUIDv4 identifier                                                         |
| ruleUUID               | string   | UUIDv4 identifier                                                         |
| ruleConfigUUID         | string   | UUIDv4 identifier                                                         |
| state                  | int      | The current state will default to 00 (new)                                |
| x                      | tbc      | Typology Rule Distance                                                    |
| y                      | tbc      | Rules in quarter circle                                                   |
| z                      | tbc      | Rules in semi circle                                                      |
| createdAt              | DateTime | the date and time the Typology Rule Config was first created, or imported |
| UpdatedAt              | DateTime | the date and time the Typology Rule Config was last updated               |
| ownerID                | int      | the ID of the person that created the Typology Rule Config                |
| approverID             | int      | the ID of the person that approved the Typology Rule Config               |
|                        |          |                                                                           |

```bash
Typology-001/  
├── rule-001/  
│   └── rule-001-config-1/  
└── rule-004/  
    ├── rule-004-config-2/  
    └── rule-004-config-3/  
```

## The Rules object  

The rules object is an array that contains an element for every possible outcome for each of the rule results that can be received from the rule processors in scope for the typology.

![rules object](../assets/rules_object_typology.png)

**Every. Possible. Outcome.**

All the possible outcomes from the rule processors are encapsulated in each rule’s configuration, with the exception of the .err outcome that is not listed in the rule configuration because the conditions and descriptions are built into the rule processor itself. When composing the typology configuration, the user must remember to include the ```.err``` outcome, but the rest of the rule results (exit conditions and banded/cased results) can be directly reconciled with the elements in the ```rules``` object.

Each rule result element in the rules array contains the same attributes:

| Attribute | Description |
|----|----|
| ```id``` | The rule processor that was used to determine the rule result is uniquely identified by this identifier attribute. |
| ```cfg``` | The configuration version attribute specifies the unique version of the rule configuration that was used by the processor to determine this result. |
| ```ref``` | Every rule processor is capable of reporting a number of different outcomes, but only a single outcome from the complete set is ultimately delivered to the typology processor. Each unique outcome is defined by a unique sub-rule reference identifier to differentiate the delivered outcome from the others
| | The unique combination of id, cfg and ref attributes references a unique outcome from each rule processor and allows the typology processor to apply a unique weighting to that specific outcome. |
| ```true``` | The outcome of the rule result will be either true or false, depending if the configurer expected the result to deterministic or not. If the outcome is true, the rule result will be assigned the weighting associated with the true attribute in the configuration. By convention, deterministic (true) outcomes are assigned a positive number as a weighting. |
| ```false``` | The outcome of the rule result will be either true or false, depending if the configurer expected the result to deterministic or not. If the outcome is false, the rule result will be assigned the weighting associated with the false attribute in the configuration. By convention, deterministic (false) outcomes are usually assigned a weighting of 0 (zero).

> :exclamation: What does “every possible outcome” mean?
> A rule processor must always produce a result, and only ever a single result from a number of possible results. The rule result will always fall into one of the following categories: error, exit or band/case. Results across all the categories are mutually exclusive and there can be only one result regardless of the category. Results are uniquely identified via the subRuleRef attribute:
> 
> ".err" is reserved for the error condition, of which there will only ever be one;  
> exit conditions are prefaced with an ".x" and there may be many;  
> bands/cases are typically sequentially numbered (and ".00" is reserved in cases) and will always have at least two.
> 
> The rule processor must produce one of these results (identified by the result’s subRuleRef) and when it does, the typology processor must be configured via a typology configuration to “catch” that specific subRuleRef. If the rule processor produces a result that the typology processor can't process, the typology processor won't be able to complete the evaluation of that specific typology or the channel that contains the typology or the transaction that contains the channel: the evaluation will "hang". For this reason alone the exit conditions must be represented in the typology configuration and interpreted in the typology processor, even if the interpretation is non-deterministic (false, with a zero weighting), but some (few!) exit conditions actually also have deterministic results that have a weighting.

Because the rules object contains every possible rule result outcome from each of the rule processors allocated to the typology, the typology configuration can become quite verbose, but here’s a short example of a rules object for a typology that contains two rules:

```json
"rules": [
  {
    "id": "001@1.0.0",
    "cfg": "1.0.0",
    "ref": ".err",
    "true": 0,
    "false": 0
  },
  {
    "id": "001@1.0.0",
    "cfg": "1.0.0",
    "ref": ".x01",
    "true": 100,
    "false": 0
  },
  {
    "id": "001@1.0.0",
    "cfg": "1.0.0",
    "ref": ".01",
    "true": 200,
    "false": 0
  },
  {
    "id": "001@1.0.0",
    "cfg": "1.0.0",
    "ref": ".02",
    "true": 100,
    "false": 0
  },
  {
    "id": "002@1.0.0",
    "cfg": "1.0.0",
    "ref": ".err",
    "true": 0,
    "false": 0
  },
  {
    "id": "002@1.0.0",
    "cfg": "1.0.0",
    "ref": ".x01",
    "true": 100,
    "false": 0
  },
  {
    "id": "002@1.0.0",
    "cfg": "1.0.0",
    "ref": ".x02",
    "true": 100,
    "false": 0
  },
  {
    "id": "002@1.0.0",
    "cfg": "1.0.0",
    "ref": ".01",
    "true": 100,
    "false": 0
  },
  {
    "id": "002@1.0.0",
    "cfg": "1.0.0",
    "ref": ".02",
    "true": 200,
    "false": 0
  }
]
```

## The expression object

The expression object in the typology processor defines the formula that is used to calculate the typology score. The expression is able to accommodate any formula composed out of a combination of multiplication (```*```), division (```/```), addition (```+```) and subtraction (```-```) operations.

In its most basic implementation, the expression is merely a sum of all the weighted rule results. This also means that every deterministic rule listed in the ```rules``` array object in the typology configuration must be represented in the expression as a term, otherwise the rule weighting will not be taken into account during the score calculation.

The ```expression``` object contains the operators and terms that make up the typology scoring formula. Operators and their associated terms are defined as a series of nested objects in the JSON structure. For example, if  wanted to add two terms, a and b, I would start the expression with the operator and then nest the terms beneath it, as follows:

```a + b```


```json
"expression": {
  "operator": "+",
  "terms": ["a", "b"]
}
```

In the platform the terms a and b would be represented by their unique ```id``` and ```cfg``` combination:

```json
{
  "id": "001@1.0.0",
  "cfg": "1.0.0"
}
```

We don’t have to also supply a specific sub-rule reference: each rule processor only submits one of its possible rule results at a time.

If, for example, we wanted to apply an additional multiplier to the formula (e.g. (a + b) * c, the resulting expression would be structured as follows:

```json
"expression": {
  "operator": "*",
  "terms": ["c",
    "operator":"+",
    "terms": ["a", "b"]
  ]
}
```

By example, a complete expression for a typology that relies on 4 rule results and calculates the typology score as a sum of the rule result weightings would be composed as follows:


```json
"expression": {
  "operator": "+",
  "terms": [
    {
      "id": "001@1.0.0",
      "cfg": "1.0.0"
    },
    {
      "id": "002@1.0.0",
      "cfg": "1.0.0"
    },
    {
      "id": "003@1.0.0",
      "cfg": "1.0.0"
    },
    {
      "id": "004@1.0.0",
      "cfg": "1.0.0"
    },    
  ]
}
```

Mathematically, this expression would translate to:


$$\sum_{i=1}^4 r_1 = r_1 + ... + r_4$$

or simply: 

```typology score = rule 001 weighting + rule 002 weighting + rule 003 weighting + rule 004 weighting``` 

## The workflow object  

The workflow object determines the thresholds according to which the typology processor will decide if an action is necessary in response to the typology score. A typology can be configured with two separate thresholds:

**Alert** (```alertThreshold```): this threshold will only alert an investigator if the threshold was breached, but will not force the typology processor to take any other direct action

**Interdiction** (```interdictionThreshold```): if breached, this threshold will force the typology processor to issue a message to the client platform to block the transaction. This action will also force an alert to an investigator at the end of the evaluation process.

A threshold breach occurs when the calculated typology score is greater or equal to the threshold (>=).

Alerts are intended to trigger the investigation of a transaction; either because the transaction was blocked by interdiction, or perhaps because there was not sufficient evidence to outright block a transaction, but enough evidence was accumulated to arouse suspicion.
A typology may be configured with alert threshold, but without an interdiction threshold, usually when the typology is focused on money laundering and the intention of the alert is to trigger surveillance processes without tipping the participants off that their criminal behavior had been noticed.

The platform also allows for separate thresholds for alerts and interdictions so that the platform can generate an alert for a lower and more sensitive threshold than an interdiction. The platform may also omit the alert threshold altogether since the interdiction threshold will generate an alert anyway if the interdiction threshold is breached. (And even though it is possible to specify an alert threshold greater or equal to an interdiction threshold, this alert threshold would be redundant.)

| Option | Outcome |
|----|----|
|Alert threshold only | An alert will be generated out of the Transaction Aggregation and Decisioning Processor (TADProc) if the alert threshold for a typology is breached. A single alert will be generated to cover all typologies that breached this threshold if any one of the typologies breached this threshold. | 
| Interdiction threshold only | An interdiction will be generated out of the typology processor if the interdiction threshold is breached. An alert will also be generated out of the TADProc once the evaluation of the transaction is complete, similar to if an alert threshold was breached. | 
| Alert threshold and interdiction threshold | A typology that is configured with both an alert and an interdiction threshold will typically generate an alert only if the alert threshold is breached at a lower value and then may also interdiction the transaction if the interdiction threshold is breached at a higher value. |

If a specific type of threshold is not required, the threshold should be omitted entirely. A typology configuration threshold value of 0 (zero) will always result in a breach of that typology.

The thresholds are located in a workflow object in the typology configuration. If, for example, the platform is expected to alert on a typology score of 500 or more, and interdict on a typology score of 1000 or more, the workflow object would be composed as follows:


```json
"workflow": {
  "alertThreshold": 500,
  "interdictionThreshold": 1000
}
```

## Complete example of a typology configuration

```json
{
  "desc": "Double-payment to a merchant.",
  "id": "typology-processor@1.0.0",
  "cfg": "001@1.0.0",
  "rules": [
    {
      "id": "006@1.0.0",
      "cfg": "1.0.0",
      "ref": ".err",
      "true": 0,
      "false": 0
    },
    {
      "id": "006@1.0.0",
      "cfg": "1.0.0",
      "ref": ".x00",
      "true": 100,
      "false": 0
    },
    {
      "id": "006@1.0.0",
      "cfg": "1.0.0",
      "ref": ".x01",
      "true": 100,
      "false": 0
    },
    {
      "id": "006@1.0.0",
      "cfg": "1.0.0",
      "ref": ".01",
      "true": 0,
      "false": 0
    },
    {
      "id": "006@1.0.0",
      "cfg": "1.0.0",
      "ref": ".02",
      "true": 200,
      "false": 0
    },
    {
      "id": "006@1.0.0",
      "cfg": "1.0.0",
      "ref": ".03",
      "true": 300,
      "false": 0
    },
    {
      "id": "078@1.0.0",
      "cfg": "1.0.0",
      "ref": ".err",
      "true": 0,
      "false": 0
    },
    {
      "id": "078@1.0.0",
      "cfg": "1.0.0",
      "ref": ".00",
      "true": 0,
      "false": 0
    },
    {
      "id": "078@1.0.0",
      "cfg": "1.0.0",
      "ref": ".01",
      "true": 0,
      "false": 0
    },
    {
      "id": "078@1.0.0",
      "cfg": "1.0.0",
      "ref": ".02",
      "true": 1,
      "false": 0
    },
    {
      "id": "078@1.0.0",
      "cfg": "1.0.0",
      "ref": ".03",
      "true": 0,
      "false": 0
    }
  ],
  "expression": {
    "operator": "*",
    "terms": [
      {
        "id": "006@1.0.0",
        "cfg": "1.0.0"
      },
      {
        "id": "078@1.0.0",
        "cfg": "1.0.0"
      }
    ]
  },
  "workflow": {
    "alertThreshold": 200,
    "interdictionThreshold": 300
  }
}
```