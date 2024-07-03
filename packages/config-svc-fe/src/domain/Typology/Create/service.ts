import { Edge, Node, Position } from "reactflow";
import dagre from 'dagre';
import { Api } from "~/client"
import { IRule } from "~/domain/Rule/RuleDetailPage/service"

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
                target: config._key
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