// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Edge, Node, Position } from "reactflow";
// import { RuleConfig } from "./service";
import { IRuleConfig } from "~/domain/Rule/RuleConfig/RuleConfigList/types";
import { getRuleById } from "./service";

export const defaultNodeWidth = 200;
export const defaultNodeHeight = 100;

export const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  type: 'customNode',
  width: defaultNodeWidth,
  height: defaultNodeHeight
};

export const createNodesAndEdges = (rules: any[]) => {
  const newNodes: Node[] = [];
  const newEdges: Edge[] = [];

  // Create nodes for ungrouped items
  rules.forEach((item: any, index: number) => {
    newNodes.push({
      id: item.rule._key,
      ...nodeDefaults,
      position: { x: 200, y: 0 },
      data: {
        label: item.rule.name,
        ...item.rule,
        showDelete: false,
        type: "rule"
      }
    });

    newEdges.push({
      id: item.rule._key,
      source: '1',
      target: item.rule._key,

    });
  });
  return { nodes: newNodes, edges: newEdges };
};



// export const extractOutcomes = (
//   rules_rule_configs: {
//     ruleId: string;
//     ruleConfigId: string | string[];
//   }[],
//   ruleConfigsMap: Record<string, IRuleConfig>
// ) => {
//   const combinedOutcomes: any[] = [];

//   console.log("rules_rule_configs:", rules_rule_configs);
//   console.log("ruleConfigsMap keys:", Object.keys(ruleConfigsMap));

//   rules_rule_configs.forEach(entry => {
//     const { ruleId, ruleConfigId } = entry;
//     const configIds = Array.isArray(ruleConfigId) ? ruleConfigId : [ruleConfigId];

//     // configIds.forEach(configId => {
//     //   //Remove 'rule_config/' prefix if present
//     //   const cleanConfigId = configId.replace(/^rule_config\//, "");
//     //   const ruleConfig = ruleConfigsMap[cleanConfigId];

//     //   if (!ruleConfig || !ruleConfig.config) {
//     //     console.warn("Missing ruleConfig or config for:", configId);
//     //     return;
//     //   }
//     configIds.forEach(configId => {
//       if (typeof configId !== 'string') return; // 🛡️ skip invalid entries

//       const cleanConfigId = configId.replace(/^rule_config\//, "");
//       const ruleConfig = ruleConfigsMap[cleanConfigId];

//       if (!ruleConfig || !ruleConfig.config) {
//         return;
//       }

//       console.log(`🔬 ruleConfig.config for ${cleanConfigId}:`, ruleConfig.config);

//       const { exitConditions = [], bands = [], cases = [] } = ruleConfig.config;

//       exitConditions.forEach(item => {
//         combinedOutcomes.push({
//           ...item,
//           type: 'ExitCondition',
//           ruleId,
//         });
//       });

//       bands.forEach(item => {
//         combinedOutcomes.push({
//           ...item,
//           type: 'Band',
//           ruleId,
//         });
//       });

//       cases.forEach(item => {
//         combinedOutcomes.push({
//           ...item,
//           type: 'Case',
//           ruleId,
//         });
//       });
//     });
//   });

//   console.log("Final Combined Outcomes:", combinedOutcomes);
//   return combinedOutcomes;
// };

export const extractOutcomes = (
  rules_rule_configs: {
    ruleId: string;
    ruleConfigId: string | string[];
  }[],
  ruleConfigsMap: Record<string, IRuleConfig>
) => {
  const combinedOutcomes: any[] = [];
  const seenKeys = new Set<string>();

  console.log("rules_rule_configs:", rules_rule_configs);
  console.log("ruleConfigsMap keys:", Object.keys(ruleConfigsMap));

  rules_rule_configs.forEach(entry => {
    const { ruleId, ruleConfigId } = entry;
    const configIds = Array.isArray(ruleConfigId) ? ruleConfigId : [ruleConfigId];

    configIds.forEach(configId => {
      if (typeof configId !== 'string') return;

      const cleanConfigId = configId.replace(/^rule_config\//, "");
      const ruleConfig = ruleConfigsMap[cleanConfigId];

      if (!ruleConfig || !ruleConfig.config) return;

      const { exitConditions = [], bands = [], cases = [] } = ruleConfig.config;

      exitConditions.forEach(item => {
        const key = `ExitCondition-${ruleId}-${item.subRuleRef}`;
        if (!seenKeys.has(key)) {
          combinedOutcomes.push({ ...item, type: 'ExitCondition', ruleId });
          seenKeys.add(key);
        }
      });

      bands.forEach(item => {
        const key = `Band-${ruleId}-${item.subRuleRef}`;
        if (!seenKeys.has(key)) {
          combinedOutcomes.push({ ...item, type: 'Band', ruleId });
          seenKeys.add(key);
        }
      });

      cases.forEach(item => {
        const key = `Case-${ruleId}-${item.subRuleRef}`;
        if (!seenKeys.has(key)) {
          combinedOutcomes.push({ ...item, type: 'Case', ruleId });
          seenKeys.add(key);
        }
      });
    });
  });

  console.log(" Final Combined Outcomes (deduped):", combinedOutcomes);
  return combinedOutcomes;
};


export const createNewNodesAndEdges = (nodes: Node[], edges: Edge[]) => {
  const newNodes: Node[] = [];
  const newEdges: Edge[] = [];
  
  nodes.filter((n) => n?.type !== "operatorNode").forEach((item, index: number) => {
    newNodes.push({
      ...item,
      id: item.id,
      ...nodeDefaults,
      position: { x: item.position.x, y: item.position.y },
      data: {
        ...item.data
      },
      type: item.type,
    });

    if(item.data?.type === "outcome") {
      newEdges.push({
        id: item.id,
        source: item.data.ruleId,
        target: item.id,
        data: {
          type: "outcome"
        }
      });
    }

    if(item.type === "scoreNode") {
      newEdges.push({
        id: item.id,
        source: item?.data?.outcomeId,
        target: item.id,
        data: {
          type: "score"
        }
      });
    }


    if(item.data?.type === "rule") {
      newEdges.push({
        id: item.id,
        source: '1',
        target: item.id,
        data: {
          type: "rule"
        }
      });
    }
   
  });

  return { nodes: newNodes, edges: newEdges };
};





export async function buildScorePayload(nodes: Node[]) {
  const rules: any[] = [];
  const expressionTerms: any[] = [];
  const ruleCache = new Map<string, { name: string; cfg: string }>();

  const scoreNodes = nodes.filter((n) => n.type === "scoreNode");

  // for (const node of scoreNodes) {
  //   const { ruleId, subRuleRef, score } = node.data;

  //   if (!ruleId || !subRuleRef || score == null) continue;

  //   // Ensure every ruleId fetches its correct metadata
  //   if (!ruleCache.has(ruleId)) {
  //     try {
  //       const rule = await getRuleById(ruleId);
  //       const ruleName = rule.name || ruleId.split('/')[1];
  //       const ruleVersion = rule.cfg || '1.0.0';
  //       ruleCache.set(ruleId, { name: ruleName, cfg: ruleVersion });

  //       console.log("Cached Rule:", ruleId, "=>", ruleName, ruleVersion);
  //     } catch (err) {
  //       console.warn("Failed to fetch rule by ID:", ruleId, err);
  //       continue;
  //     }
  //   }

  //   const { name, cfg } = ruleCache.get(ruleId)!;
  //   const id = `${name}@${cfg}`;

  //   rules.push({
  //     id,
  //     cfg,
  //     ref: subRuleRef,
  //     true: score.toString(),
  //     false: "0"
  //   });

  //   if (!expressionTerms.find((t) => t.id === id)) {
  //     expressionTerms.push({ id, cfg });
  //   }
  // }
  for (const node of scoreNodes) {
    const { ruleId, subRuleRef, score, outcomeId } = node.data;

    if (!ruleId || !subRuleRef || score == null) continue;

    // Match the outcome node using outcomeId
    const outcomeNode = nodes.find(n =>
      n.data?.type === 'outcome' &&
      (n.id === outcomeId || n.data?.outcomeId === outcomeId)
    );

    if (!outcomeNode) {
      console.warn("Missing outcome node for:", outcomeId);
      continue;
    }

    const reason = outcomeNode.data?.reason || 'N/A';
    const outcomeType = outcomeNode.data?.type;

    if (!ruleCache.has(ruleId)) {
      try {
        const rule = await getRuleById(ruleId);
        const ruleName = rule.name || ruleId.split('/')[1];
        const ruleVersion = rule.cfg || '1.0.0';
        ruleCache.set(ruleId, { name: ruleName, cfg: ruleVersion });

        console.log("Cached Rule:", ruleId, "=>", ruleName, ruleVersion);
      } catch (err) {
        console.warn("Failed to fetch rule by ID:", ruleId, err);
        continue;
      }
    }

    const { name, cfg } = ruleCache.get(ruleId)!;
    const id = `${name}@${cfg}`;

    rules.push({
      id,
      cfg,
      ref: subRuleRef,
      true: score.toString(),
      false: "0",
      type: outcomeType,
      reason: reason,
    });

    if (!expressionTerms.find((t) => t.id === id)) {
      expressionTerms.push({ id, cfg });
    }
  }


  return {
    rules,
    expression: {
      operator: "+",
      terms: expressionTerms
    }
  };
}


// export function getOutcomeLabelFromType(type?: string): string {
//   switch (type) {
//     case 'exit_condition':
//       return 'Exit Conditions';
//     case 'band':
//       return 'Band';
//     case 'case':
//       return 'Case';
//     default:
//       return 'Unknown';
//   }
// }

// export function getOutcomeLabelFromType(type?: string): string {
//   switch (type?.toLowerCase()) {
//     case 'ExitCondition':
//       return 'Exit Condition';
//     case 'band':
//       return 'Band';
//     case 'case':
//       return 'Case';
//     case 'outcome':
//       return 'Outcome'; // fallback if type wasn't correctly set
//     default:
//       return 'Unknown';
//   }
// }

export function getOutcomeLabelFromType(type?: string): string {
  switch (type) {
    case 'ExitCondition':
      return 'Exit Condition';
    case 'Band':
      return 'Band';
    case 'Case':
      return 'Case';
    case 'Outcome':
      return 'Outcome';
    default:
      console.warn('Unknown type received in getOutcomeLabelFromType:', type);
      return 'Unknown';
  }
}



