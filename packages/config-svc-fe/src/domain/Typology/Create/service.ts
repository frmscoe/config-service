// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Edge, Node, Position } from "reactflow";
import dagre from 'dagre';
import { Api } from "~/client"
import { IRule } from "~/domain/Rule/RuleDetailPage/service"
import { ITypology } from "../List/service";
import { AttachedRules } from ".";

const defaultNodeWidth = 172;
const defaultNodeHeight = 36;

export const nodeDefaults = {
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    type: 'customNode',
    width: defaultNodeWidth,
    height: defaultNodeHeight
};


export const createTypology = (data: any) => {
    return Api.post('/typology', {...data})
}

export const updateTypology = (data: any, id: string) => {
    return Api.patch(`/typology/${id}`, {...data});
}

export const createNodesAndEdges = (rules: IRule[], handleDelete: (id: string, type: string) => void) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    rules.forEach((rule, i) => {
        const parentNode: Node = {
            id: rule._key,
            ...nodeDefaults,
            data: {
                ...rule,
                label: rule.name,
                onDelete: handleDelete,
                type: 'rule',
                showDelete: true,
            },
            position: {
                x: 250,
                y: 100 + (i * 20), 
            }
        }
        const parentEdge: Edge = {
            id: parentNode.id,
            source: '1',
            target: parentNode.id,
        }
        nodes.push(parentNode);
        edges.push(parentEdge);
        rule?.ruleConfigs.forEach((config, index) => {
            const configNode: Node = {
                id: config._key,
                ...nodeDefaults,
                data: {
                    ...config,
                    label: `${rule.name}-config-${config.cfg}`,
                    showDelete: true,
                    onDelete: handleDelete,
                },
                position: {
                    x: 500, y: 100 + (index * 20)
                },
                
            }
            const configEdge: Edge = {
                id: config._key,
                source: rule._key,
                target: config._key,
            }
            nodes.push(configNode);
            edges.push(configEdge);
        });
    })
    return {nodes, edges}
}

export const updateLayout = (nodes: any[], edges: any[]) => {
    const graph = new dagre.graphlib.Graph();
    graph.setGraph({rankdir: 'LR'});
    graph.setDefaultEdgeLabel(() => ({}));

    nodes.forEach(node => {
        graph.setNode(node.id, { width: defaultNodeWidth, height: defaultNodeHeight  }); // Set width and height for each node
    });

    edges.forEach(edge => {
        graph.setEdge(edge.source, edge.target); // Add edges to the graph
    });

    dagre.layout(graph); // Apply Dagre layout algorithm

    // Update positions of nodes based on Dagre layout
    const layoutedNodes = nodes.map(node => ({
        ...node,
        position: {
            x: graph.node(node.id).x - defaultNodeWidth / 2 ,
            y: graph.node(node.id).y - defaultNodeHeight / 2
        }
    }));
    return layoutedNodes;
}

export const hasChanged = (
    currentData: ITypology & { attachedRules: AttachedRules[] }, 
    newValues: { name: string; description: string; minor: number; major: number; patch: number },  
    newRules: AttachedRules[]
) => {
    // Check if the typology properties have changed
    const typologyChanged =
        currentData.name !== newValues.name ||
        currentData.desc !== newValues.description ||
        currentData.cfg !== `${newValues.major}.${newValues.minor}.${newValues.patch}`;

    // Check if the attached rules have changed
    const rulesChanged = !areAttachedRulesEqual(currentData.attachedRules, newRules);

    return typologyChanged || rulesChanged;
};

// Helper function to compare attached rules
const areAttachedRulesEqual = (rules1: AttachedRules[], rules2: AttachedRules[]) => {
    // For simplicity, comparing only the length of attachedRules array
    if (rules1?.length !== rules2?.length) {
        return false;
    }

    // Assuming order matters, compare each element in the arrays
    for (let i = 0; i < rules1.length; i++) {
        const attachedRules1 = rules1[i];
        const attachedRules2 = rules2[i];

        // Compare attachedConfigs array lengths
        if (attachedRules1?.attachedConfigs?.length !== attachedRules2?.attachedConfigs?.length) {
            return false;
        }

        // Compare each element in attachedConfigs arrays
        for (let j = 0; j < attachedRules1.attachedConfigs.length; j++) {
            const config1 = attachedRules1?.attachedConfigs[j];
            const config2 = attachedRules2?.attachedConfigs[j];

            // Comparing _id assuming it's unique identifier
            if (config1?._id !== config2?._id) {
                return false;
            }
        }
    }

    return true;
};




export const checkTypologyDuplicate = async (name: string, version: string) => {
  const res = await Api.get('/typology', {
    params: {
      page: 1,
      limit: 100, // increase limit to get more results
      name,
    },
  });

  const matches = res.data.data?.filter(
    (typology: any) =>
      typology.name?.trim().toLowerCase() === name.trim().toLowerCase() &&
      typology.cfg === version
  );

  return matches.length > 0;
};



