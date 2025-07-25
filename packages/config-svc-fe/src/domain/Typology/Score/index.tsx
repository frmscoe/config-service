// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Edge, Node, NodeDragHandler, NodeMouseHandler, Position, ReactFlowProvider, XYPosition, addEdge, useEdgesState, useNodesState } from "reactflow";
import { Score } from "./Score"
import { Modal } from "antd";
import { useState, useRef, useEffect, DragEventHandler, useCallback } from "react";
import { IRuleConfig } from "~/domain/Rule/RuleConfig/RuleConfigList/types";
import usePrivileges from "~/hooks/usePrivileges";
import { AttachedRules } from "../Create";
import React from "react";
import AccessDeniedPage from "~/components/common/AccessDenied";
import { ITypology, RuleWithConfig, getTypology, getTypologyWithRules, getRuleById, getRuleConfigById, getAllRules, updateTypology } from "./service";
import dagre from 'dagre';
import { nodeDefaults, createNodesAndEdges, extractOutcomes, defaultNodeWidth, defaultNodeHeight, createNewNodesAndEdges, buildScorePayload } from "./helpers";
import { getRandomNumber } from "~/utils/getRandomNumberHelper";
import { IOutcome } from "./Outcomes";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { debounce } from "lodash";
import { canTransition } from '../../../../machine/guards';



const initialNodes: Node[] = [
    {
        id: '1',
        position: { x: 0, y: 150 },
        data: { label: 'Typology Design Service', showDelete: false },
        ...nodeDefaults,
    },
];

const initialEdges: Edge[] = [];

const ScorePage = () => {
    const { id } = useParams();
    const [rules, setRules] = useState<any[]>([]);
    const [ruleOptions, setRuleOptions] = useState<RuleWithConfig[]>([]);
    const [modal, contextHolder] = Modal.useModal();
    const [loadingRules, setLoadingRules] = useState(false);
    const [error, setError] = useState('');
    // const { canReviewTypology } = usePrivileges();
    const { privileges } = usePrivileges();
    const [canReview, setCanReview] = useState(false);
    const reactFlowWrapper = useRef<any>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedRule, setSelectedRuleIndex] = useState<null | string>(null);
    const [attachedRules] = useState<AttachedRules[]>([]);
    const [ruleDragIndex, setRuleDragIndex] = useState<number | null>(null);
    const [removedRules] = useState<RuleWithConfig[] | IRuleConfig[]>([]);
    const [saveLoading] = useState(false);
    const [typology, setTypology] = useState<ITypology>({} as ITypology);
    const [outcomes, setOutComes] = useState<IOutcome[]>([]);
    const [outComeOptions, setOutcomeOptions] = useState<IOutcome[]>([]);
    const [selectedOutcome, setSelectedOutcomeIndex] = useState<null | string>(null);
    const [others] = useState<any[]>([]);
    const [otherOptions, setOtherOptions] = useState<any[]>([]);
    const [selectedOther, setSelectedOther] = useState<null | string>(null);
    const [removed, setRemoved] = useState<any[]>([]);
    const [removedOptions, setRemoveOptions] = useState<any[]>([]);
    const [selectedRemoved, setSelectedRemoved] = useState<null | string>(null);
    const [selectedOutcomes, setSelectedOutComes] = useState<any[]>([]);
    const [activeKeys, setActiveKeys] = useState<string | string[]>(['1']);
    const router = useRouter();

    const onConnect = useCallback(
        (params: any) =>
            setEdges((eds) =>
                addEdge({ ...params, animated: true }, eds)
            ),
        []
    );

    const updatePositions = (newNodes: Node[], newEdges: Edge[]) => {
        const graph = new dagre.graphlib.Graph();
        graph.setGraph({ rankdir: 'LR' });
        graph.setDefaultEdgeLabel(() => ({}));
        const newNodeList = createNewNodesAndEdges(newNodes.filter(n => n.type !== 'operatorNode'), newEdges);

        // Add nodes to the graph
        newNodeList.nodes.forEach(node => {
            graph.setNode(node.id, { width: defaultNodeWidth, height: defaultNodeHeight, fixed: true });
        });

        // Add edges to the graph
        newNodeList.edges.forEach(edge => {
            graph.setEdge(edge.source, edge.target);
        });

        // Apply Dagre layout algorithm
        dagre.layout(graph, { nodesep: 30 });

        // Map layouted positions back to nodes
        const layoutedNodes = newNodeList.nodes.map(node => ({
            ...node,
            position: {
                x: graph.node(node.id).x,
                y: graph.node(node.id).y
            },
            data: {
                ...node.data,
                fixed: false
            }
        }));


        // Create operator nodes between customNodes and next nodes
        const updatedNodes: Node[] = [];
        const updatedEdges: Edge[] = [];
        const otherNodes = layoutedNodes.filter((n) => n.type !== "scoreNode");
        const outComeNodes = layoutedNodes.filter((n) => n.type === "scoreNode").sort((a, b) => a.position.y - b.position.y);

        outComeNodes.forEach((node, index) => {
            // updatedNodes.push({ ...node, data: { ...node.data, currentPosition: node.position } });
            // Push current node
            // Check if current node is a customNode and there's a next node
            if (node.type === 'scoreNode' && index < outComeNodes.length - 1) {
                const nextNode = outComeNodes[index + 1];
                const offsetY = defaultNodeHeight / 10;
                const operatorNodeId = getRandomNumber(10000).toString();
                const operatorNode: Node = {
                    ...nodeDefaults,
                    id: operatorNodeId,
                    data: {
                        label: '+',
                        type: 'operator',
                        score: 0,
                        outcomeId: node.data?.outcomeId,
                        firstNode: node.id,
                        secondNode: nextNode.id,
                    },
                    position: {
                        x: (node.position.x + nextNode.position.x) / 1.8,
                        y: ((node.position.y + nextNode.position.y) / 2) + offsetY
                    },
                    type: 'operatorNode'
                };
                updatedNodes.push(operatorNode);
                const edge: Edge = {
                    id: getRandomNumber(10000).toString(),
                    source: node?.data?.outcomeId,
                    target: operatorNodeId,
                    data: { type: 'operator' },
                    hidden: true
                };
                updatedEdges.push(edge);
            }
        });
        setNodes([...updatedNodes, ...outComeNodes, ...otherNodes]);
        setEdges([...newNodeList.edges, ...updatedEdges]);
    }

    const debounceUpdatePositions = debounce(updatePositions, 1000);


    const onNodeDrag: NodeDragHandler = useCallback(
        (_e, draggedNode) => {
            if (draggedNode && draggedNode.data?.type === "outcome") {
                // Update the position of the dragged node and its related nodes
                const updatedNodes = nodes
                    .filter((n) => n.type !== "operatorNode")
                    .map((node) =>
                        node.id === draggedNode.id
                            ? {
                                ...node,
                                position: {
                                    x: draggedNode.position.x,
                                    y: draggedNode.position.y,
                                },
                                data: {
                                    ...node.data,
                                    fixed: true,
                                }
                            }
                            : node?.data?.outcomeId === draggedNode.id
                                ? {
                                    ...node,
                                    position: {
                                        x: node.position.x,
                                        y: draggedNode.position.y,
                                    },
                                    data: {
                                        ...node.data,
                                        fixed: true,
                                    }
                                }
                                : {
                                    ...node,
                                    data: {
                                        ...node.data,
                                        fixed: true,
                                    }
                                }
                    );

                // Sort nodes with type 'outcome' by their y position
                const outcomeNodes = updatedNodes
                    .filter((node) => node.data?.type === "outcome")
                    .sort((a, b) => a.position.y - b.position.y);
                const otherNodes = updatedNodes
                    .filter((node) => node.data?.type !== "outcome");

                const sortedNodes = [...outcomeNodes, ...otherNodes];
                setNodes(sortedNodes);
                setEdges([...edges]);
                debounceUpdatePositions(sortedNodes, edges);
            }
        },
        [nodes, edges]
    );


    const onOpenTypologyView = () => {
        if (selectedOutcomes.length) {
            modal.confirm({
                title: 'Save in Drafts',
                content: 'Would you like to save your changes as draft before switching to typology view',
                cancelText: 'Dont Save',
                okText: 'Save Changes',
                okButtonProps: {
                    className: 'bg-green-500 text-white'
                },
                onOk: () => {
                    if (!selectedOutcomes.length) {
                        //check if old then move to drafts else back to new
                        router.push('/typology/new');
                    } else {
                        router.push(`/typology/edit/${id}`);
                    }
                }
            })
        } else {
            router.push(`/typology/edit/${id}`);
        }
    }

    const handleScoreChange = (id: string, value: number) => {
        setNodes((prev) => {
            const newNodes = prev;
            const updated = newNodes.findIndex((n) => n.id === id);
            if (updated !== -1) {
                const ruleNodeIndex = newNodes.findIndex((n) => n.id === `${newNodes[updated]?.data?.ruleId}-${newNodes[updated]?.data?.subRuleRef}`);
                newNodes[updated] = {
                    ...newNodes[updated],
                    data: {
                        ...newNodes[updated].data,
                        score: value,
                    }
                }
                if (ruleNodeIndex !== -1) {
                    newNodes[ruleNodeIndex] = {
                        ...newNodes[ruleNodeIndex],
                        data: {
                            ...newNodes[ruleNodeIndex].data,
                            score: value,
                        }
                    }
                }

            }
            return [...newNodes];
        })

    }
    const handleDelete = (id: string) => {
        const deleted = nodes.find((n) => n.id === id);
        if (!deleted) {
            return;
        }

        let newNodes = nodes.filter((n) => n.id !== id);
        let newEdges = edges.filter((e) => e.source !== id && e.target !== id);

        // Find operator nodes connected to the deleted node
        const connectedOperators = edges
            .filter((e) => e.source === id || e.target === id)
            .map((e) => (e.source === id ? e.target : e.source))
            .filter((nodeId) => nodes.find((n) => n.id === nodeId)?.type === 'operatorNode');

        connectedOperators.forEach((operatorId) => {
            // Find score nodes connected to the operator node
            const connectedScoreNodes = edges
                .filter((e) => e.source === operatorId || e.target === operatorId)
                .map((e) => (e.source === operatorId ? e.target : e.source))
                .filter((nodeId) => nodes.find((n) => n.id === nodeId)?.type === 'scoreNode' && nodeId !== id);

            if (connectedScoreNodes.length < 2) {
                newNodes = newNodes.filter((n) => n.id !== operatorId);
                newEdges = newEdges.filter((e) => e.source !== operatorId && e.target !== operatorId);
            }
        });

        // Remove score nodes connected to the deleted node
        newNodes = newNodes.filter((n) => (n?.data.outcomeId !== id));
        newEdges = newEdges.filter((e) => e.source !== id && e.target !== id);

        // Check and fix operator nodes to score nodes ratio
        const scoreNodes = newNodes.filter((n) => n.type === 'scoreNode');
        const operatorNodes = newNodes.filter((n) => n.type === 'operatorNode');
        if (operatorNodes.length >= scoreNodes.length) {
            const operatorToRemove = operatorNodes[operatorNodes.length - 1];
            newNodes = newNodes.filter((n) => n.id !== operatorToRemove?.id);
            newEdges = newEdges.filter((e) => e.source !== operatorToRemove?.id && e.target !== operatorToRemove?.id);
        }

        setNodes(newNodes);
        setEdges(newEdges);
        setSelectedOutComes(selectedOutcomes.filter((o) => o.id !== id));
        const existsInRemoved = removed.find((r) => r.id === id && r.ruleId === deleted?.data?.ruleId);
        if (!existsInRemoved) {
            setRemoved([...removed, deleted?.data]);
            setActiveKeys((prev) => [...prev, '5']);
        }
        const rule = typology.ruleWithConfigs.find((r) => r.rule._key === deleted?.data?.ruleId);
        const options = extractOutcomes(rule?.ruleConfigs || [], deleted?.data?.ruleId);
        setOutcomeOptions([...options]);
        updateLayout(newNodes, newEdges);
    };

    

    const onDrop: DragEventHandler<HTMLDivElement> = (e) => {
        const type = e.dataTransfer.getData('type');
        if (type === 'operator') {
            if (!selectedOutcomes.length) {
                modal.error({
                    title: 'No outcomes',
                    content: 'Please add at least 1 outcome to the screen',
                    okButtonProps: {
                        style: {
                            backgroundColor: 'red',
                        }
                    }
                });
                return;
            }
        } else {
            const data = JSON.parse(e.dataTransfer.getData('data') || '{}');
            const scoresNotAdded = nodes.filter((n) => n.data.type === 'outcome').find((s) => s?.data?.score === undefined);
            if (scoresNotAdded) {
                modal.error({
                    title: 'Missing Score',
                    content: 'Cannot drag on new outcome without adding a score on previous outcome',
                    okButtonProps: {
                        style: {
                            backgroundColor: 'red',
                        }
                    }
                });
                return;
            }

            const newNodes: Node[] = [];
            const newEdges: Edge[] = [];
            let currentNodes = nodes;

            // Sort existing outcome nodes by y position
            const sortedOutcomeNodes = currentNodes
                .filter(node => node.data?.type === 'outcome')
                .sort((a, b) => a.position.y - b.position.y);

            // Get the y position for the new outcome node to place it at the bottom
            const yPos = sortedOutcomeNodes.reduce((maxY, node) => Math.max(maxY, node.position.y), 0) + 100;
            const outcomeNode = {
                ...nodeDefaults,
                id: getRandomNumber(10000).toString(),
                data: { ...data, label: `${data.type}: ${data.subRuleRef}`, type: 'outcome', score: 0, showDelete: true },
                position: { x: 250, y: yPos },
                type: 'customNode'
            };
            newNodes.push(outcomeNode);

            // This edge connects the rule to the newly dropped outcome
            const edge = {
                id: `${(selectedRule || data.ruleId)}-${outcomeNode.id}`, // Modified: Consistent ID
                source: selectedRule || data.ruleId, // Use selectedRule if available, otherwise data.ruleId
                target: outcomeNode.id,
                type: 'smoothstep', // This is required for curved edges
                data: { type: 'outcome' },
            };
            newEdges.push(edge);

            const scoreNode = {
                ...nodeDefaults,
                id: getRandomNumber(10000).toString(),
                data: {
                    ...data,
                    label: 'Score',
                    type: 'score',
                    outcomeId: outcomeNode.id,
                    onScoreChange: handleScoreChange,
                    outComeType: data.type,
                },
                position: { x: 250, y: outcomeNode.position.y - 50 },
                type: 'scoreNode',
            };
            newNodes.push(scoreNode);

            const scoreEdge: Edge = {
                id: getRandomNumber(10000).toString(),
                source: outcomeNode.id,
                target: scoreNode.id,
                type: 'smoothstep', // Also required here
                data: { type: 'score' },
            };
            newEdges.push(scoreEdge);
            const updatedNodes = [...nodes, ...newNodes];
            const outcomeNodes = updatedNodes
                .filter((node) => node.data?.type === "outcome")
                .sort((a, b) => a.position.y - b.position.y);
            const otherNodes = updatedNodes
                .filter((node) => node.data?.type !== "outcome");
            const sortedNodes = [...outcomeNodes, ...otherNodes];
            const updatedEdges = [...edges, ...newEdges].filter((e) => e.data?.type !== 'operator');
            setEdges(updatedEdges);
            
            updateLayout(sortedNodes, [...edges, ...newEdges]);
            setOutcomeOptions((prev) => prev.filter((outcome) => `${outcome.type}-${outcome.ruleId}-${outcome.subRuleRef}` !== `${data.type}-${data.ruleId}-${data.subRuleRef}`));
            setSelectedOutComes((prev) => [...prev, outcomeNode]);
            setActiveKeys((prev) => [...prev, '3']);
        }
    };


    

    const onNodeClick: NodeMouseHandler = (event: any, node: Node) => {
        if (event?.target?.tagName === 'path' || event?.target?.tagName === 'svg') {
            return;
        }
        event.preventDefault();
        setSelectedRuleIndex(node.data.ruleId);

        if (!typology?.ruleWithConfigs || !Array.isArray(typology.ruleWithConfigs)) {
            console.warn("ruleWithConfigs not yet available");
            return;
        }

        const rule = typology.ruleWithConfigs.find((r) => r.rule._key === node.data.ruleId);
        const selectedOutcomes = extractOutcomes(rule?.ruleConfigs || [], node.data.ruleId);
        setOutComes([...selectedOutcomes]);
        setOutcomeOptions([...selectedOutcomes]);
        setActiveKeys((prev) => [...prev, '3']);
    };


    const handleSelectRule = (id: string) => {
        setSelectedRuleIndex(id);
        
        if (!typology?.ruleWithConfigs || !Array.isArray(typology.ruleWithConfigs)) {
            console.warn("ruleWithConfigs not available yet.");
            return;
          }
        const rule = typology.ruleWithConfigs.find((r) => r.rule._key === id);
        const selectedOutcomes = extractOutcomes(rule?.ruleConfigs || [], id);
        setOutComes([...selectedOutcomes]);
        setOutcomeOptions([...selectedOutcomes]);
        setActiveKeys((prev) => [...prev, '3']);

    }


    const updateLayout = React.useCallback((newNodes: Node[], newEdges: Edge[]) => {
        const graph = new dagre.graphlib.Graph();
        graph.setGraph({ rankdir: 'LR' });
        graph.setDefaultEdgeLabel(() => ({}));

        // Add nodes to the graph
        newNodes.filter(n => n.type !== 'operatorNode').forEach(node => {
            graph.setNode(node.id, { width: defaultNodeWidth, height: defaultNodeHeight, fixed: true });
        });

        // Add edges to the graph
        newEdges.filter(e => e.data?.type !== 'operator').forEach(edge => {
            graph.setEdge(edge.source, edge.target);
        });

        // Apply Dagre layout algorithm
        dagre.layout(graph, { nodesep: 30 });

        // Map layouted positions back to nodes
        const layoutedNodes = newNodes.filter(n => n.type !== 'operatorNode').map(node => ({
            ...node,
            position: {
                x: graph.node(node.id).x,
                y: graph.node(node.id).y
            },
            data: {
                ...node.data,
            }
        }));

        // Create operator nodes between customNodes and next nodes
        const updatedNodes: Node[] = [];
        const updatedEdges: Edge[] = [];
        const otherNodes = layoutedNodes.filter((n) => n.type !== "scoreNode");
        const outComeNodes = layoutedNodes.filter((n) => n.type === "scoreNode").sort((a, b) => a.position.y - b.position.y);

        outComeNodes.forEach((node, index) => {
            if (index < outComeNodes.length - 1) {
                const nextNode = outComeNodes[index + 1];
                const offsetY = defaultNodeHeight / 10;
                const operatorNodeId = getRandomNumber(10000).toString();
                const operatorNode: Node = {
                    ...nodeDefaults,
                    id: operatorNodeId,
                    data: {
                        label: '+',
                        type: 'operator',
                        score: 0,
                        outcomeId: node.data?.outcomeId, // Adjust as per your requirement
                        firstNode: node.id,
                        secondNode: nextNode.id,
                    },
                    position: {
                        x: (node.position.x + nextNode?.position?.x) / 1.8,
                        y: ((node.position.y + nextNode?.position?.y) / 2) + offsetY
                    },
                    type: 'operatorNode'
                };
                updatedNodes.push(operatorNode);
                const edge: Edge = {
                    id: getRandomNumber(10000).toString(),
                    source: node?.data?.outcomeId,
                    target: operatorNodeId,
                    data: { type: 'operator' },
                    hidden: true
                };
                updatedEdges.push(edge);
            }
        });
        setNodes([...outComeNodes, ...updatedNodes, ...otherNodes]);
        setEdges([...newEdges.filter((e) => e.data?.type !== 'operator'), ...updatedEdges]);
    }, []);


    

    const fetchTypology = React.useCallback(() => {
      setError('');

      if (!id) return;

      setLoadingRules(true);

      getTypologyWithRules(id as string)
        .then(async (data) => {
          console.log("Typology API Response:", data);

          const attachedRuleEntries = await Promise.all(
            (data.rules_rule_configs || []).map(async (entry: any) => {
              const rule = await getRuleById(entry.ruleId).catch(() => null);
              const configs = await Promise.all(
                (entry.ruleConfigId || []).map((cfgId: string) =>
                  getRuleConfigById(cfgId).catch(() => null)
                )
              );

              if (!rule) return null;

              return {
                rule,
                ruleConfigs: configs.filter(Boolean),
              };
            })
          );

          const attachedRules = attachedRuleEntries.filter(Boolean);

          const ruleConfigsMap = attachedRules
            .flatMap(r => r.ruleConfigs)
            .reduce((acc, cfg) => {
              acc[cfg._key] = cfg;
              return acc;
            }, {} as Record<string, IRuleConfig>);

          const outcomes = extractOutcomes(data.rules_rule_configs, ruleConfigsMap);

          setTypology(data);
          setRules(attachedRules);

          // FIX: Flatten rule structure to what Rules.tsx expects
          setRuleOptions(
            attachedRules.map(ar => ({
              _key: ar.rule._key,
              name: ar.rule.name,
              ...ar.rule,
              ruleConfigs: ar.ruleConfigs,
            }))
          );

          setOutComes(outcomes);
          setOutcomeOptions(outcomes);
          console.log("Extracted Outcomes:", outcomes);

          const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(attachedRules);
          setNodes(prev => [...prev, ...newNodes]);
          setEdges(prev => [...prev, ...newEdges]);
          updateLayout([...initialNodes, ...newNodes], [...initialEdges, ...newEdges]);
          setActiveKeys(prev => [...prev, '2']);
        })
        .catch((e: any) => {
          const message = e.response?.data?.message || e?.message || 'Something went wrong';
          setError(message);
        })
        .finally(() => {
          setLoadingRules(false);
        });
    }, [id, updateLayout]);


    useEffect(() => {
        fetchTypology();
    }, []);

    
    const handleSave = async () => {
      if (!typology?._key) {
        Modal.error({ title: "Missing Typology", content: "Typology ID not found." });
        return;
      }

      const scorePayload = await buildScorePayload(nodes);
      console.log("Final Score Payload", scorePayload);

      try {
        await updateTypology({ score: scorePayload }, typology._key);
        Modal.success({
          title: "Saved!",
          content: "Score section saved successfully.",
        });
      } catch (error) {
        console.error("Error saving score:", error);
        Modal.error({
          title: "Save Failed",
          content: "Something went wrong while saving the score.",
        });
      }
    };







    return <ReactFlowProvider>
        {contextHolder}
        <Score
            rules={rules}
            loadingRules={loadingRules}
            nodes={nodes}
            onConnect={onConnect}
            onEdgesChange={onEdgesChange}
            onNodesChange={onNodesChange}
            edges={edges}
            onDrop={onDrop}
            flowRef={reactFlowWrapper}
            ruleOptions={ruleOptions}
            setRuleOptions={setRuleOptions}
            selectedRule={selectedRule}
            setSelectedRuleIndex={setSelectedRuleIndex}
            attachedRules={attachedRules}
            ruleDragIndex={ruleDragIndex}
            setRuleDragIndex={setRuleDragIndex}
            handleDelete={handleDelete}
            recentlyRemovedRules={removedRules}
            onNodeClick={onNodeClick}
            saveLoading={saveLoading}
            outComeOptions={outComeOptions}
            selectedOutcome={selectedOutcome}
            setOutcomeOptions={setOutcomeOptions}
            setSelectedOutcomeIndex={setSelectedOutcomeIndex}
            outcomes={outcomes}
            others={others}
            otherOptions={otherOptions}
            setOtherOptions={setOtherOptions}
            selectedOther={selectedOther}
            setSelectedOther={setSelectedOther}
            removed={removed}
            removeOptions={removedOptions}
            setRemovedOptions={setRemoveOptions}
            selectedRemoved={selectedRemoved}
            setSelectedRemoved={setSelectedRemoved}
            handleSelectRule={handleSelectRule}
            selectedOutcomes={selectedOutcomes}
            activeKeys={activeKeys}
            setActiveKeys={setActiveKeys}
            error={error}
            fetchTypology={fetchTypology}
            onOpenTypologyView={onOpenTypologyView}
            handleSave={handleSave}
            onNodeDrag={(e, node, nodesList) => {
                onNodeDrag(e, node, nodesList);
            }}

            onDragExit={(e) => {
                console.log('stooped dragging');
            }}
        />
    </ReactFlowProvider>
}

export default ScorePage;