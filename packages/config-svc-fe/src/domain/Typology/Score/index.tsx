import { ConnectionLineType, Node, NodeMouseHandler, ReactFlowProvider, addEdge, useEdgesState, useNodesState } from "reactflow";
import { Score } from "./Score"
import {  Modal } from "antd";
import { useState, useRef, useEffect, DragEventHandler, useCallback } from "react";
import { IRuleConfig } from "~/domain/Rule/RuleConfig/RuleConfigList/types";
import usePrivileges from "~/hooks/usePrivileges";
import { AttachedRules } from "../Create";
import React from "react";
import AccessDeniedPage from "~/components/common/AccessDenied";
import { ITypology, RuleWithConfig, getTypology } from "./service";
import dagre from 'dagre';
import { nodeDefaults, createNodesAndEdges, extractOutcomes } from "./helpers";
import { getRandomNumber } from "~/utils/getRandomNumberHelper";
import { IOutcome } from "./Outcomes";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";

const nodeWidth = 172;
const nodeHeight = 36;

const initialNodes: any[] = [
    {
        id: '1',
        position: { x: 0, y: 150 },
        data: { label: 'Typology Design Service', showDelete: false },
        ...nodeDefaults,
    },
];

const initialEdges = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'smoothstep'
    },
];

const ScorePage = () => {
    const { id } = useParams();
    const [rules, setRules] = useState<any[]>([]);
    const [ruleOptions, setRuleOptions] = useState<RuleWithConfig[]>([]);
    const [modal, contextHolder] = Modal.useModal();
    const [loadingRules, setLoadingRules] = useState(false);
    const [error, setError] = useState('');
    const { canReviewTypology } = usePrivileges();
    const reactFlowWrapper = useRef<any>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedRule, setSelectedRuleIndex] = useState<null | string>(null);
    const [attachedRules, setAttachedRules] = useState<AttachedRules[]>([]);
    const [ruleDragIndex, setRuleDragIndex] = useState<number | null>(null);
    const [removedRules, setRemoveRules] = useState<RuleWithConfig[] | IRuleConfig[]>([]);
    const [saveLoading, setSaveLoading] = useState(false);
    const [typology, setTypology] = useState<ITypology>({} as ITypology);
    const [outcomes, setOutComes] = useState<IOutcome[]>([]);
    const [outComeOptions, setOutcomeOptions] = useState<IOutcome[]>([]);
    const [selectedOutcome, setSelectedOutcomeIndex] = useState<null | string>(null);
    const [others, setOthers] = useState<any[]>([]);
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
                addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)
            ),
        []
    );

    const onOpenTypologyView = () => {
        if(selectedOutcomes.length) {
            modal.confirm({
                title: 'Save in Drafts',
                content: 'Would you like to save your changes as draft before switching to typology view',
                cancelText: 'Dont Save',
                okText: 'Save Changes',
                okButtonProps:{
                    className: 'bg-green-500 text-white'
                },
                onOk: () => {
                    if(!selectedOutcomes.length) {
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

            const newNodes: any[] = [];
            const newEdges: any[] = [];
            const outcomeNode = {
                ...nodeDefaults,
                id: getRandomNumber(10000).toString(),
                data: { ...data, label: `${data.type}: ${data.subRuleRef}`, type: 'outcome', score: 0, showDelete: true },
                position: { x: 250, y: nodes[nodes.length - 1].position.y },
                type: 'customNode'
            };
            newNodes.push(outcomeNode);

            const edge = {
                id: getRandomNumber(10000).toString(),
                source: selectedRule || data.ruleId,
                target: outcomeNode.id,
                type: 'smoothstep'
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
                    onScoreChange: handleScoreChange
                },
                position: { x: 250, y: outcomeNode.position.y },
                type: 'scoreNode'
            };
            newNodes.push(scoreNode);

            const scoreEdge = {
                id: getRandomNumber(10000).toString(),
                source: outcomeNode.id,
                target: scoreNode.id,
                type: 'smoothstep'
            };
            newEdges.push(scoreEdge);

            const scoreNodes = nodes.filter((n) => n.type === 'scoreNode');
            if (scoreNodes.length > 0) {
                const lastScoreNode = scoreNodes[scoreNodes.length - 1]; // TODO get close node;
                const operatorNode = {
                    ...nodeDefaults,
                    id: getRandomNumber(10000).toString(),
                    data: {
                        label: '+',
                        type: 'operator',
                        score: 0,
                        outcomeId: outcomeNode.id,
                        firstNode: outcomeNode.id,
                        secondNode: lastScoreNode.id,
                    },
                    position: { x: scoreNode.position.x - 100, y: scoreNode.position.y },
                    type: 'operatorNode',
                };
                newNodes.push(operatorNode);

                const operatorEdge1 = {
                    id: getRandomNumber(10000).toString(),
                    source: scoreNode.id,
                    target: operatorNode.id,
                    type: 'smoothstep',
                };
                newEdges.push(operatorEdge1);

                const operatorEdge2 = {
                    id: getRandomNumber(10000).toString(),
                    source: lastScoreNode.id,
                    target: operatorNode.id,
                    type: 'smoothstep',
                };
                newEdges.push(operatorEdge2);
            }

            setNodes([...nodes, ...newNodes]);
            setEdges([...edges, ...newEdges]);
            updateLayout([...nodes, ...newNodes], [...edges, ...newEdges]);
            setOutcomeOptions((prev) => prev.filter((outcome) => `${outcome.type}-${outcome.ruleId}-${outcome.subRuleRef}` !== `${data.type}-${data.ruleId}-${data.subRuleRef}`));
            setSelectedOutComes([...selectedOutcomes, { ...data, id: outcomeNode.id }]);
        }
    };


    const onNodeClick: NodeMouseHandler = (event: any, node: Node) => {
        if (event?.target?.tagName === 'path' || event?.target?.tagName === 'svg') {
            return;
        }
        event.preventDefault();
        setSelectedRuleIndex(node.data.ruleId);
        const rule = typology.ruleWithConfigs.find((r) => r.rule._key === node.data.ruleId);
        const selectedOutcomes = extractOutcomes(rule?.ruleConfigs || [], node.data.ruleId);
        setOutComes([...selectedOutcomes]);
        setOutcomeOptions([...selectedOutcomes]);
        setActiveKeys((prev) => [...prev, '3']);

    };

    const handleSelectRule = (id: string) => {
        setSelectedRuleIndex(id);
        const rule = typology.ruleWithConfigs.find((r) => r.rule._key === id);
        const selectedOutcomes = extractOutcomes(rule?.ruleConfigs || [], id);
        setOutComes([...selectedOutcomes]);
        setOutcomeOptions([...selectedOutcomes]);
        setActiveKeys((prev) => [...prev, '3']);

    }

    const updateLayout = React.useCallback((newNodes: any[], newEdges: any[]) => {
        const graph = new dagre.graphlib.Graph();
        graph.setGraph({ rankdir: 'LR' });
        graph.setDefaultEdgeLabel(() => ({}));

        newNodes.forEach(node => {
            graph.setNode(node.id, { width: nodeWidth, height: nodeHeight }); // Set width and height for each node
        });

        newEdges.forEach(edge => {
            graph.setEdge(edge.source, edge.target); // Add edges to the graph
        });

        dagre.layout(graph); // Apply Dagre layout algorithm

        // Update positions of nodes based on Dagre layout
        const layoutedNodes = newNodes.map(node => ({
            ...node,
            position: {
                x: graph.node(node.id).x - nodeWidth / 2,
                y: graph.node(node.id).y - nodeHeight / 2
            }
        }));
        setNodes(layoutedNodes);
    }, []);

    const fetchTypology = React.useCallback(() => {
        setError('');
        if (canReviewTypology) {
            setLoadingRules(true);
            getTypology(id as string)
                .then(({ data }) => {
                    setTypology(data as ITypology);
                    setRules(data?.ruleWithConfigs || []);
                    const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(data?.ruleWithConfigs || []);
                    setNodes((prev) => ([...prev, ...newNodes]));
                    setEdges((prev) => ([...prev, ...newEdges]));
                    updateLayout([...nodes, ...newNodes], [...edges, ...newEdges]);
                    setActiveKeys((prev) => [...prev, '2']);

                }).catch((e: any) => {
                    const message = e.response?.data?.message || e?.message || 'Something went wrong'
                    setError(message);
                }).finally(() => {
                    setLoadingRules(false);
                })
        }
    }, [canReviewTypology, id]);

    useEffect(() => {
        fetchTypology();
    }, []);

    if (!canReviewTypology) {
        return <AccessDeniedPage />
    }
  
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
        />
    </ReactFlowProvider>
}

export default ScorePage;