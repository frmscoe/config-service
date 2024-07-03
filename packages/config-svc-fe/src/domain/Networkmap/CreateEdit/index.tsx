import { useCallback, useEffect, useRef, useState } from "react";
import { Create } from "./Create";
import { IRule } from "~/domain/Rule/RuleDetailPage/service";
import usePrivileges from "~/hooks/usePrivileges";
import { useNodesState, useEdgesState, Position, addEdge, NodeMouseHandler, Node, ConnectionLineType, Edge } from "reactflow";
import { IRuleConfig } from "~/domain/Rule/RuleConfig/RuleConfigList/types";
import dagre from 'dagre';
import { GroupedTypology, createNetworkMap, getTypologies, getTypology, groupTypologies } from "./service";
import { Button, Modal, Result } from "antd";
import { ITypology, RuleWithConfig } from "../../Typology/Score/service";
import { IEvent } from "./Events";
import { getRandomNumber } from "~/utils/getRandomNumberHelper";
import { t } from "i18next";
import Link from "next/link";
import { useCommonTranslations } from "~/hooks";

export interface AttachedRules extends IRule {
    attachedConfigs: IRuleConfig[];
}
const nodeDefaults = {
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    type: 'customNode'
};
const nodeWidth = 172;
const nodeHeight = 36;
const initialEdges = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'smoothstep'
    },

    {
        id: 'e2-3',
        source: '2',
        target: '3',
        type: 'smoothstep'
    },
];
const initialNodes: Node[] = [];

const NetworkMapPage = () => {
    const [rules, setRules] = useState<IRule[]>([]);
    const [ruleOptions, setRuleOptions] = useState<IRule[]>([]);
    const [modal, contextHolder] = Modal.useModal();
    const [loadingTypologies, setLoadingTypologies] = useState(true);
    const { canCreateNetworkMap, canViewTypologyList, canReviewTypology } = usePrivileges();
    const reactFlowWrapper = useRef<any>(null);
    const [selectedRule, setSelectedRuleIndex] = useState<null | string>(null);
    const [attachedRules, setAttachedRules] = useState<RuleWithConfig[]>([]);
    const [ruleDragIndex, setRuleDragIndex] = useState<number | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const [typologies, setTypologies] = useState<GroupedTypology[]>([]);
    const [typologyOptions, setTypologyOptions] = useState<GroupedTypology[]>([]);
    const [selectedTypology, setSelectedTypology] = useState<string | null>(null);
    const [events] = useState<{ label: string, disabled: boolean, value: string; color: string }[]>([{ label: 'PAIN.001', value: 'pain_001', disabled: false, color: 'gold' }, { label: 'PAIN.013', value: 'pain_013', disabled: false, color: 'magenta' }]);
    const [eventOptions, setEventOptions] = useState<IEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const [attacheEvents, setAttachedEvents] = useState([]);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [allExpanded, setAllExpanded] = useState(false);
    const [showVersions, setShowVersions] = useState(false);
    const [loadingAttached, setLoadingAttached] = useState(false);
    const{t} = useCommonTranslations();

    const handleError = (e: any) => {
        modal.error({
            title: t('createEditNetworkMap.errorTitle'), content: e?.response?.data?.message || e?.message || t('createEditNetworkMap.errorMessage'), 
            okButtonProps: {
                style: {
                    backgroundColor: 'red',
                }
            }
        });
    }

    const handleSave = async () => {
        if (!attachedRules.length) {
            modal.error({
                title: t('createEditNetworkMap.errorTitle'), content:  t('createEditNetworkMap.pleaseAddTypology'),
                okButtonProps: {
                    style: {
                        backgroundColor: 'red',
                    }
                }
            });

            return;
        }
        type ITypologyData = Partial<ITypology> & { active: boolean, id: string };
        type ITypologyDataExtended = ITypology & { typologyId: string; typology: ITypology }
        const obj: { [k: string]: ITypologyData } = {}
        attachedRules.forEach((option, i) => {
            const item = option as unknown as ITypologyDataExtended;
            if (obj[item.typologyId]) {
                const currentRules = obj[item.typologyId]?.ruleWithConfigs || [];
                const newList: RuleWithConfig[] = [];
                (item?.typology?.ruleWithConfigs || []).forEach((r) => {
                    const exists = (currentRules || []).find((option) => r.rule._key == option.rule._key);
                    if (!exists) {
                        newList.push(r);
                    }
                });
                obj[item.typologyId] = {
                    ...obj[item.typologyId],
                    ruleWithConfigs: [...currentRules, ...newList],
                }

            } else {
                obj[item.typologyId] = {
                    name: item.typology.name,
                    cfg: item.typology.cfg,
                    id: item.typology._key,
                    active: true,
                    ruleWithConfigs: item.typology.ruleWithConfigs,
                }
            }
        });

        const data = {
            active: false,
            cfg: "1.0.0",
            events: [
                {
                    eventId: 'PAN001',
                    typologies: Object.values(obj),
                }
            ]
        }
        try {
            setSaveLoading(true);
            await createNetworkMap(data);
            modal.success({
                title: t('createEditNetworkMap.successTitle'), content: t('createEditNetworkMap.networkMapCreated'),
                 okButtonProps: {
                    style: {
                        backgroundColor: 'red',
                    }
                }
            });
        } catch (e: any) {
            modal.error({
                title: 'Error', content: e?.response?.data?.message || e?.message || t('createEditNetworkMap.errorMessage'), 
                okButtonProps: {
                    style: {
                        backgroundColor: 'red',
                    }
                }
            });
        } finally {
            setSaveLoading(false);
        }
    }
    const handleExpandEvent = useCallback((id: string) => {
        setNodes((prev) => {
            let currentNodes = prev;
            const nodeToUpdateIndex = prev.findIndex((n) => n.id === id);
            if (nodeToUpdateIndex !== -1) {
                let node = currentNodes[nodeToUpdateIndex];
                if (node.data.expanded) {
                    node.data = {
                        ...node.data,
                        expanded: false,
                    }
                    currentNodes[nodeToUpdateIndex] = node;
                    currentNodes = currentNodes.filter((n) => n.data.eventId !== node.id);
                    setNodes([...currentNodes]);
                    setEdges([...edges.filter((e) => e.source !== node.id)]);
                    updateLayout([...currentNodes], [...edges.filter((e) => e.source !== node.id)]);
                    return currentNodes;

                } else {
                    node.data = {
                        ...node.data,
                        expanded: true,
                    }
                    currentNodes[nodeToUpdateIndex] = node;
                    const typologyNode = {

                        id: getRandomNumber(1000).toString(),
                        position: { x: 300, y: 200 },
                        width: 300,
                        height: 400,
                        data: {
                            label: 'Typology 2',
                            showDelete: false,
                            handleExpand: handleExpandEvent,
                            handleExpandVersions,
                            expanded: false,
                            eventId: '1',
                        },
                        ...nodeDefaults,
                        type: 'typologyNode',
                    }
                    const edge = {
                        id: getRandomNumber(1000).toString(),
                        source: node.id,
                        target: typologyNode.id,
                        type: 'smoothstep'
                    }

                    currentNodes.push(typologyNode);
                    setEdges([...edges, edge]);
                    updateLayout([...currentNodes], [...edges, edge]);
                    return [...currentNodes];
                }

            }
            return prev;
        });
    }, []);

    const handleExpandTypology = (id: string) => {
        setShowVersions(!showVersions);
    }

    const setRulesAndConfigs = (id: string) => {
        setLoadingAttached(true);
        if (canReviewTypology) {
            getTypology(id)
                .then(({ data }) => {
                    setAttachedRules((prev) => {
                        return [
                            ...prev,
                            ...((data.ruleWithConfigs || []).map((d: RuleWithConfig) => ({ ...d, typologyId: data._key, typology: data })))

                        ]
                    });
                }).catch((e) => {
                    modal.error({
                        title: 'Error', content: "Couldn't get rules and configurations",
                        okButtonProps: {
                            style: {
                                backgroundColor: 'red',
                            }
                        }
                    });
                }).finally(() => {
                    setLoadingAttached(false);
                });
        }

    }

    const removeRulesAndConfigs = (data: ITypology & { typologyId: string }) => {
        setAttachedRules((prev) => {
            return [...prev.filter((r) => r.typologyId !== data._key)];
        });
    }

    const expandAll = () => {
        if (nodes.length === 1) {
            return;
        }
        if (!allExpanded) {
            setAllExpanded(true);
            let currentNodes = nodes.map((n) => {
                if (n.type === 'typologyNode') {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            expanded: true,
                        }
                    }
                }
                return n;
            });
            const newNodes: Node[] = [];
            const newEdges: Edge[] = [];
            currentNodes.filter((n) => n.type === 'typologyNode').forEach((node) => {
                (node?.data?.versions || []).forEach((t: ITypology, i: number) => {
                    const typology = t;
                    if (typology) {
                        const dataId = (getRandomNumber(100000000) + i).toString();
                        const versionNode = {
                            id: dataId,
                            data: {
                                label: `Version ${typology.cfg}`,
                                checked: node?.data?.lastCheckedId === typology._key,
                                typologyNodeId: node.id,
                                id: dataId,
                                handleCheck,
                                ...typology,
                            },
                            ...nodeDefaults,
                            type: 'versionNode',
                            position: {
                                x: node.position.x + 500,
                                y: node.position.y + (50 * (i + 1))
                            },

                        }
                        const edge = {
                            id: getRandomNumber(1000).toString(),
                            source: node.id,
                            target: versionNode.id,
                            type: 'smoothstep',
                            data: { type: 'versionNode' }
                        }
                        newNodes.push(versionNode);
                        newEdges.push(edge);
                    }
                });

            });
            setEdges((prev) => {
                return [...prev, ...newEdges];
            });
            updateLayout([...currentNodes, ...newNodes], [...edges, ...newEdges]);
            setNodes([...currentNodes, ...newNodes]);
        } else {
            setAllExpanded(false);
            let currentNodes = nodes.map((n) => {
                if (n.type === 'typologyNode') {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            expanded: false,
                        }
                    }
                }
                return n;
            });
            currentNodes = currentNodes.filter((n) => n.type !== 'versionNode');
            const currentEdges = edges.filter((e) => e?.data?.type !== 'versionNode');
            setNodes([...currentNodes]);
            setEdges([...currentEdges]);
            updateLayout([...currentNodes], [...currentEdges]);
        };
    };

    const handleExpandVersions = useCallback((id: string, expanded: boolean) => {
        setNodes((prev) => {
            let currentNodes = prev;
            const nodeToUpdateIndex = prev.findIndex((n) => n.id == id);
            if (nodeToUpdateIndex !== -1) {
                let node = currentNodes[nodeToUpdateIndex];
                if (expanded) {
                    node.data = {
                        ...node.data,
                        expanded: false,
                    }
                    currentNodes[nodeToUpdateIndex] = node;
                    currentNodes = currentNodes.filter((n) => n.data.typologyNodeId !== node.id);
                    setNodes([...currentNodes]);
                    setEdges((prevEdges) => {
                        return [...prevEdges.filter((e) => e.source !== node.id)]
                    });
                    updateLayout([...currentNodes], [...edges.filter((e) => e.source !== node.id)]);
                    return currentNodes;

                } else {
                    node.data = {
                        ...node.data,
                        expanded: true,
                    }
                    currentNodes[nodeToUpdateIndex] = node;
                    const newNodes: Node[] = [];
                    const newEdges: Edge[] = [];
                    (node.data?.versions || []).forEach((v: ITypology, i: number) => { //List of versions
                        const dataId = getRandomNumber(10000).toString();
                        const versionNode = {
                            id: dataId,
                            data: {
                                label: `Version ${v.cfg}`,
                                checked: node?.data?.lastCheckedId === v._key,
                                typologyNodeId: node.id,
                                id: dataId,
                                handleCheck,
                                ...v
                            },
                            ...nodeDefaults,
                            type: 'versionNode',
                            position: {
                                x: node.position.x + 500,
                                y: node.position.y + (50 * (i + 1))
                            },

                        }
                        const edge = {
                            id: getRandomNumber(1000).toString(),
                            source: node.id,
                            target: versionNode.id,
                            type: 'smoothstep',
                            data: { type: 'versionNode' }
                        }
                        newNodes.push(versionNode);
                        newEdges.push(edge);
                    });
                    setEdges((prev) => {
                        return [...prev, ...newEdges];
                    });
                    updateLayout([...currentNodes, ...newNodes], [...edges, ...newEdges]);
                    return [...currentNodes.concat(newNodes)];
                }
            }
            return prev;
        });


    }, []);

    const handleCheck = (data: any, checked: boolean) => {
        setNodes((prev) => {
            let currentNodes = prev;
            const parentNodeIndex = prev.findIndex((n) => n.id === data.typologyNodeId);
            const index = prev.findIndex((n) => n.id === data.id);
            currentNodes = currentNodes.map((n) => {
                if (n.data?.typologyNodeId === data.typologyNodeId) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            checked: false,
                        }
                    }
                }
                return n;
            });
            if (index !== -1) {
                currentNodes[index].data = {
                    ...currentNodes[index].data,
                    checked
                }
                if (checked) {
                    setRulesAndConfigs(data._key);
                    currentNodes[parentNodeIndex].data = {
                        ...currentNodes[parentNodeIndex].data,
                        lastCheckedId: data._key
                    }
                } else {
                    removeRulesAndConfigs(data);
                    currentNodes[parentNodeIndex].data = {
                        ...currentNodes[parentNodeIndex].data,
                        lastCheckedId: null,
                    }
                }
                return [...currentNodes];
            }
            return [...prev];
        })
    }

    const onConnect = useCallback(
        (params: any) =>
            setEdges((eds) =>
                addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)
            ),
        []
    );

    useEffect(() => {
        const newNodes = [...initialNodes, {
            id: '1',
            position: { x: 0, y: 150 },
            data: {
                label: 'Event', showDelete: false, expanded: false, handleExpand:
                    handleExpandEvent
            },
            ...nodeDefaults,
            type: 'eventNode'

        },
        ]
        setNodes([...newNodes]);
    }, [initialNodes]);

    useEffect(() => {
        if (canViewTypologyList) {
            setLoadingTypologies(true);
            getTypologies(1)
                .then(({ data }) => {
                    const grouped = groupTypologies(data.data || []);
                    setTypologies(grouped);
                }).catch((e) => {
                    handleError(e.response?.data?.message || e.message);
                }).finally(() => {
                    setLoadingTypologies(false)
                });
        }

    }, [canViewTypologyList]);

    const onNodeClick: NodeMouseHandler = (_event, node) => {
        if (node.type === 'customNode' && node.data.type === 'rule') {
            setSelectedRuleIndex(node.id);
        }
    }

    const handleDelete = useCallback((id: string, data: ITypology & { lastCheckedId: string }) => {
        setSelectedRuleIndex(null);

        setNodes((prev) => {
            const newNodes = prev.filter((n) => id !== n.id)
                .filter((n) => n.data.typologyNodeId !== id);
            return newNodes;
        });

        setEdges((prev) => {
            const newEdges = prev.filter((r) => r.target !== id)
                .filter((r) => r.source !== id);
            return newEdges;
        });
        const currentNode = typologies.find((n) => n._key === id);

        setTypologyOptions((prev) => {
            if (currentNode) {
                return [
                    ...prev,
                    currentNode,
                ]
            }
            return prev;

        });

        setAttachedRules((prev) => {
            return prev.filter((t) => t.typologyId !== data.lastCheckedId);
        })
    }, [nodes, attachedRules, edges, typologies]);


    const updateLayout = (nodes: any[], edges: any[]) => {
        const graph = new dagre.graphlib.Graph();
        graph.setGraph({ rankdir: 'LR' });
        graph.setDefaultEdgeLabel(() => ({}));

        nodes.forEach(node => {
            graph.setNode(node.id, { width: node.width || nodeWidth, height: node.height || nodeHeight }); // Set width and height for each node
        });

        edges.forEach(edge => {
            graph.setEdge(edge.source, edge.target); // Add edges to the graph
        });

        dagre.layout(graph); // Apply Dagre layout algorithm

        // Update positions of nodes based on Dagre layout
        const layoutedNodes = nodes.map(node => ({
            ...node,
            position: {
                x: graph.node(node.id).x - (node.width || nodeWidth) / 2,
                y: graph.node(node.id).y - (node.height || nodeHeight) / 2
            }
        }));
        setNodes(layoutedNodes);
    }

    const onDrop = useCallback((event: any) => {
        event.preventDefault();
        setRuleDragIndex(null);
        const data = event.dataTransfer.getData('data');
        const typology = JSON.parse(data);
        const [lastNode] = nodes.filter((n) => n.type === 'typologyNode');
        const typologyNode = {
            ...nodeDefaults,
            id: typology._key,
            type: 'typologyNode',
            data: {
                ...typology,
                label: typology.name.slice(0, 25),
                handleExpandVersions,
                handleExpand: handleExpandTypology,
                handleDelete,
            },
            position: {
                x: 1000,
                y: lastNode ? (lastNode?.position?.y || 0) + (-300 * nodes.length) : -800
            },
            width: 350,
            height: 350,
        };
        const typologyEdge = {
            id: getRandomNumber(10000).toString(),
            source: '1',
            target: typologyNode.id,
            type: 'smoothstep',

        };
        setNodes([...nodes, typologyNode]);
        setEdges([...edges, typologyEdge]);
        updateLayout([...nodes, typologyNode], [...edges, typologyEdge]);
        setTypologyOptions((prev) => {
            return [...prev.filter((t) => t._key !== typology._key)]
        });
    }, [nodes, rules, attachedRules, edges, handleDelete, typologies]);

    if (!canCreateNetworkMap || !canReviewTypology || !canViewTypologyList) {
        const message = !canCreateNetworkMap ?
           t('createEditNetworkMap.accessDeniedMessage') :
            !canViewTypologyList ?
                t('createEditNetworkMap.typologyListPermissionError') :
                t('createEditNetworkMap.typologyDetailsPermissionError')
        return <Result
            data-testid="access-denied"
            status="403"
            title="403"
            subTitle={message}
            extra={<Button type="default" ><Link href={'/'}>{t('createEditNetworkMap.backToHomePage')}</Link></Button>}
        />
    }
    return <> <Create
        loadingTypologies={loadingTypologies}
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
        onNodeClick={onNodeClick}
        saveLoading={saveLoading}

        typologies={typologies}
        typologyOptions={typologyOptions}
        setTypologyOptions={setTypologyOptions}
        selectedTypology={selectedTypology}
        setSelectedTypology={setSelectedTypology}
        showVersions={showVersions}
        setShowVersions={setShowVersions}

        events={events}
        eventOptions={eventOptions}
        setEventOptions={setEventOptions}
        selectEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        attachedEvents={attacheEvents}
        expandAll={expandAll}
        loadingAttached={loadingAttached}
        handleSave={handleSave}
    />
        {contextHolder}
    </>
}
export default NetworkMapPage;


