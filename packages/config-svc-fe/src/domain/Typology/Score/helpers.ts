// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Edge, Node, Position } from "reactflow";
import { RuleConfig } from "./service";

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

export const extractOutcomes = (ruleConfigs: RuleConfig[], ruleId: string) => {
  // Initialize an empty array to store the combined results
  let combinedArray: any[] = [];

  // Iterate over each ruleWithConfigs
  // ruleWithConfigs.forEach(ruleWithConfig => {
  // Iterate over each ruleConfig within the ruleWithConfig
  ruleConfigs.forEach(ruleConfig => {
    const config = ruleConfig.config;
    // Check if exitConditions exist and add them to the combined array with type 'exit-conditions'
    if (config?.exitConditions?.length) {
      config.exitConditions.forEach(item => {
        combinedArray.push({
          ...item,
          type: 'ExitCondition',
          ruleId,
        });
      });
    }

    // Check if bands exist and add them to the combined array with type 'bands'
    if (config?.bands?.length) {
      config.bands.forEach(item => {
        combinedArray.push({
          ...item,
          type: 'Band',
          ruleId,

        });
      });
    }

    // Check if cases exist and add them to the combined array with type 'cases'
    if (config?.cases?.length) {
      config.cases.forEach(item => {
        combinedArray.push({
          ...item,
          type: 'Case',
          ruleId,
        });
      });
    }
  });

  // Return the combined array
  return combinedArray;
}

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