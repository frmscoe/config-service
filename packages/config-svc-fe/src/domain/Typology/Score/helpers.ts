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



export const extractOutcomes = (
  rules_rule_configs: {
    ruleId: string;
    ruleConfigId: string | string[];
  }[],
  ruleConfigsMap: Record<string, IRuleConfig>
) => {
  const combinedOutcomes: any[] = [];

  console.log("rules_rule_configs:", rules_rule_configs);
  console.log("ruleConfigsMap keys:", Object.keys(ruleConfigsMap));

  rules_rule_configs.forEach(entry => {
    const { ruleId, ruleConfigId } = entry;
    const configIds = Array.isArray(ruleConfigId) ? ruleConfigId : [ruleConfigId];

    configIds.forEach(configId => {
      //Remove 'rule_config/' prefix if present
      const cleanConfigId = configId.replace(/^rule_config\//, "");
      const ruleConfig = ruleConfigsMap[cleanConfigId];

      if (!ruleConfig || !ruleConfig.config) {
        console.warn("Missing ruleConfig or config for:", configId);
        return;
      }

      const { exitConditions = [], bands = [], cases = [] } = ruleConfig.config;

      exitConditions.forEach(item => {
        combinedOutcomes.push({
          ...item,
          type: 'ExitCondition',
          ruleId,
        });
      });

      bands.forEach(item => {
        combinedOutcomes.push({
          ...item,
          type: 'Band',
          ruleId,
        });
      });

      cases.forEach(item => {
        combinedOutcomes.push({
          ...item,
          type: 'Case',
          ruleId,
        });
      });
    });
  });

  console.log("Final Combined Outcomes:", combinedOutcomes);
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

  for (const node of scoreNodes) {
    const { ruleId, subRuleRef, score } = node.data;

    if (!ruleId || !subRuleRef || score == null) continue;

    // Ensure every ruleId fetches its correct metadata
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
      false: "0"
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
