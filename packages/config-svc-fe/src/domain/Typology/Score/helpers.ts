import { Position } from "reactflow";
import { RuleConfig } from "./service";

const defaultNodeWidth = 172;
const defaultNodeHeight = 36;

export const nodeDefaults = {
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    type: 'customNode',
    width: defaultNodeWidth,
    height: defaultNodeHeight
};

export const createNodesAndEdges = (rules: any[]) => {
    const newNodes: any[] = [];
    const newEdges: any[] = [];

    // Create nodes for ungrouped items
    rules.forEach((item: any, index: number) => {
        newNodes.push({
            id: item.rule._key,
            ...nodeDefaults,
            position: { x:  250, y:  150 * (index + 1) },
            data: {
                label: item.rule.name,
                ...item.rule,
                showDelete: false,
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
