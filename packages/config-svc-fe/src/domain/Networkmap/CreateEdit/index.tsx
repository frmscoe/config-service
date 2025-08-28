// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { useCallback, useEffect, useRef, useState } from "react";
import { Create } from "./Create";
import usePrivileges from "~/hooks/usePrivileges";
import { useNodesState, useEdgesState, Position, addEdge, NodeMouseHandler, Node, ConnectionLineType, Edge } from "reactflow";
import dagre from 'dagre';
import { GroupedTypology, 
        createNetworkMap, 
        getTypologies, 
        getTypology, 
        groupTypologies, 
        getRuleById, 
        getRuleConfigById,
        IRule,
        IRuleConfig 
    } from "./service";
import { Button, Modal, Result, Input, Select, Space } from "antd";
import { ITypology, RuleWithConfig } from "../../Typology/Score/service";
import { IEvent } from "./Events";
import { getRandomNumber } from "~/utils/getRandomNumberHelper";
import Link from "next/link";
import { useCommonTranslations } from "~/hooks";
import { Api } from "~/client"
import { useRouter } from 'next/router';



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
const initialEdges = [];
const initialNodes: Node[] = [];


const NetworkMapPage = () => {
    const [rules, setRules] = useState<IRule[]>([]);
    const [ruleOptions, setRuleOptions] = useState<IRule[]>([]);
    const [modal, contextHolder] = Modal.useModal();
    const [loadingTypologies, setLoadingTypologies] = useState(false);
    const { canCreateNetworkMap, canViewTypologyList, canReviewTypology } = usePrivileges();
    const reactFlowWrapper = useRef<any>(null);
    const [selectedRule, setSelectedRuleIndex] = useState<null | string>(null);
    const [attachedRules, setAttachedRules] = useState<RuleWithConfig[]>([]);
    const [ruleDragIndex, setRuleDragIndex] = useState<number | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const [typologies, setTypologies] = useState<GroupedTypology[]>([]);
    const [typologyOptions, setTypologyOptions] = useState<GroupedTypology[]>([]);
    const [selectedTypology, setSelectedTypology] = useState<string | null>(null);
    const [events] = useState<{ label: string, disabled: boolean, value: string; color: string }[]>([{ label: 'PAIN.001', value: 'pain_001', disabled: false, color: 'gold' }, { label: 'PAIN.013', value: 'pain_013', disabled: false, color: 'magenta' }, { label: 'PACS.002', value: 'pacs_002', disabled: false, color: 'gold' }, { label: 'PACS.008', value: 'pacs_008', disabled: false, color: 'gold' }]);
    const [eventOptions, setEventOptions] = useState<IEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const [attacheEvents, setAttachedEvents] = useState([]);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [allExpanded, setAllExpanded] = useState(false);
    const [showVersions, setShowVersions] = useState(false);
    const [loadingAttached, setLoadingAttached] = useState(false);
    const{t} = useCommonTranslations();

    const [activeEventId, setActiveEventId] = useState<string | null>(null);
    const router = useRouter();




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

    


const { TextArea } = Input;
const { Option } = Select;

const checkNetworkMapNameExists = async (name: string) => {
  try {
    const { data } = await Api.get(`/network-map/name/${encodeURIComponent(name)}`);
    return !!data?._key; // Returns true if a network map with the name exists
  } catch (error) {
    // If 404 or not found, treat it as name not existing
    return false;
  }
};


const handleSave = async () => {
  const eventNode = nodes.find(n => n.type === 'eventNode');
  if (!eventNode) {
    modal.error({
      title: t('createEditNetworkMap.errorTitle'),
      content: 'No event node found on the canvas.',
      okButtonProps: { style: { backgroundColor: 'red' } }
    });
    return;
  }

  const connectedTypologyIds = edges
    .filter(e => e.source === eventNode.id)
    .map(e => e.target);

  if (!connectedTypologyIds.length) {
    modal.error({
      title: t('createEditNetworkMap.errorTitle'),
      content: 'Please attach at least one typology to the event.',
      okButtonProps: { style: { backgroundColor: 'red' } }
    });
    return;
  }

  const typologiesPayload = connectedTypologyIds.map(typologyId => {
    const typologyNode = nodes.find(n => n.id === typologyId);
    const matchingRules = attachedRules.filter(r => r.typologyId === typologyId);

    return {
      id: typologyNode?.data?._id,
      name: typologyNode?.data?.name,
      cfg: typologyNode?.data?.cfg,
      active: false,
      rulesWithConfigs: matchingRules.map(ruleEntry => ({
        rule: {
          _id: ruleEntry.rule._id,
          _key: ruleEntry.rule._key,
          name: ruleEntry.rule.name,
          cfg: ruleEntry.rule.cfg
        },
        ruleConfigs: ruleEntry.ruleConfigs.map(cfg => ({
          _id: cfg._id,
          _key: cfg._key,
          cfg: cfg.cfg
        }))
      }))
    };
  });

  let formData = { name: '', description: '', major: 1, minor: 0, patch: 0 };

  modal.confirm({
    title: 'Enter Network Map Details',
    content: (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="Network Map Name"
          onChange={e => formData.name = e.target.value}
        />
        <TextArea
          placeholder="Description"
          rows={3}
          onChange={e => formData.description = e.target.value}
        />
        <Space style={{ width: '100%' }}>
          <Select
            placeholder="Major"
            defaultValue={formData.major}
            style={{ flex: 1 }}
            onChange={val => formData.major = val}
          >
            {[...Array(10)].map((_, i) => (
              <Option key={i} value={i}>{i}</Option>
            ))}
          </Select>
          <Select
            placeholder="Minor"
            defaultValue={formData.minor}
            style={{ flex: 1 }}
            onChange={val => formData.minor = val}
          >
            {[...Array(10)].map((_, i) => (
              <Option key={i} value={i}>{i}</Option>
            ))}
          </Select>
          <Select
            placeholder="Patch"
            defaultValue={formData.patch}
            style={{ flex: 1 }}
            onChange={val => formData.patch = val}
          >
            {[...Array(10)].map((_, i) => (
              <Option key={i} value={i}>{i}</Option>
            ))}
          </Select>
        </Space>
      </Space>
    ),
    // onOk: async () => {
    //   const version = `${formData.major}.${formData.minor}.${formData.patch}`;
    //   const now = new Date().toISOString();

    //   const payload = {
    //     active: false,
    //     name: formData.name,
    //     description: formData.description,
    //     cfg: version,
    //     source: "user_created",
    //     createdAt: now,
    //     updatedAt: now,
    //     modifiedBy: "",
    //     ownerId: "",
    //     state: "01_DRAFT",
    //     events: [
    //       {
    //         eventId: eventNode.id,
    //         typologies: typologiesPayload
    //       }
    //     ]
    //   };
    onOk: async () => {
      const version = `${formData.major}.${formData.minor}.${formData.patch}`;
      const now = new Date().toISOString();

      const nameExists = await checkNetworkMapNameExists(formData.name);
      if (nameExists) {
        modal.error({
          title: 'Name Conflict',
          content: `A Network Map with the name "${formData.name}" already exists. Please choose another name.`,
          okButtonProps: { style: { backgroundColor: 'red' } }
        });
        return;
      }

      const payload = {
        active: false,
        name: formData.name,
        description: formData.description,
        cfg: version,
        source: "user_created",
        createdAt: now,
        updatedAt: now,
        modifiedBy: "",
        ownerId: "",
        state: "01_DRAFT",
        events: [
          {
            eventId: eventNode.id,
            typologies: typologiesPayload
          }
        ]
      };


      try {
        setSaveLoading(true);
        await createNetworkMap(payload);
        // modal.success({
        //   title: t('createEditNetworkMap.successTitle'),
        //   content: t('createEditNetworkMap.networkMapCreated'),
        //   okButtonProps: { style: { backgroundColor: 'red' } }
        // });
        modal.success({
          title: t('createEditNetworkMap.successTitle'),
          content: t('createEditNetworkMap.networkMapCreated'),
          okButtonProps: { style: { backgroundColor: 'red' } },
          onOk: () => {
            router.push('/network-map');
          }
        });

        // await createNetworkMap(payload);
        // router.push('/network-map');

      } catch (e: any) {
        modal.error({
          title: 'Error',
          content: e?.response?.data?.message || e?.message || t('createEditNetworkMap.errorMessage'),
          okButtonProps: { style: { backgroundColor: 'red' } }
        });
      } finally {
        setSaveLoading(false);
      }
    }
  });
};



    
    // Wrapped updateLayout in useCallback for stability
    const updateLayout = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
        const graph = new dagre.graphlib.Graph();
        graph.setGraph({ rankdir: 'LR' });
        graph.setDefaultEdgeLabel(() => ({}));

        currentNodes.forEach(node => {
            graph.setNode(node.id, { width: node.width || nodeWidth, height: node.height || nodeHeight });
        });

        currentEdges.forEach(edge => {
            // Only add visible edges to the layout calculation
            if (!edge.hidden) {
                graph.setEdge(edge.source, edge.target);
            }
        });

        dagre.layout(graph);

        const layoutedNodes = currentNodes.map(node => {
            // Only update position for visible nodes
            if (!node.hidden) {
                return {
                    ...node,
                    position: {
                        x: graph.node(node.id).x - (node.width || nodeWidth) / 2,
                        y: graph.node(node.id).y - (node.height || nodeHeight) / 2
                    }
                };
            }
            return node; // Return hidden nodes as is
        });
        setNodes(layoutedNodes);
    }, [setNodes]);


    const handleExpandEvent = useCallback((id: string) => {
        // Use a function passed to setNodes to get the latest state
        setNodes((prevNodes) => {
            let newNodes = prevNodes.map(node => {
                if (node.id === id) { // This is the event node being clicked
                    return { ...node, data: { ...node.data, expanded: !node.data.expanded } };
                }
                return node;
            });

            const eventNode = newNodes.find(n => n.id === id);
            if (!eventNode) return prevNodes;

            const isNowExpanded = eventNode.data?.expanded; // The state *after* the click

            // Identify connected typology nodes that have this eventId
            const connectedTypologyNodeIds = new Set(
                newNodes.filter(n => n.data?.eventId === id && n.type === 'typologyNode').map(n => n.id)
            );

            // Update visibility of typology nodes
            newNodes = newNodes.map(node => {
                if (connectedTypologyNodeIds.has(node.id)) {
                    // Hide if event node is now collapsed (!isNowExpanded)
                    // Show if event node is now expanded (isNowExpanded)
                    return { ...node, hidden: !isNowExpanded };
                }
                return node;
            });

            // Update visibility of edges
            setEdges((prevEdges) => {
                const updatedEdges = prevEdges.map(edge => {
                    // If the edge connects from the event node to a connected typology
                    if (edge.source === id && connectedTypologyNodeIds.has(edge.target)) {
                        // Hide if event node is now collapsed (!isNowExpanded)
                        // Show if event node is now expanded (isNowExpanded)
                        return { ...edge, hidden: !isNowExpanded };
                    }
                    return edge;
                });
                // Call updateLayout here with the fully updated nodes and edges for layout calculation
                // The `edges` dependency for this useCallback means it will always use the latest `edges` from the outer scope
                // when `handleExpandEvent` is created. So it's safe to pass `updatedEdges` directly.
                updateLayout(newNodes, updatedEdges); // Pass the computed new states to updateLayout
                return updatedEdges;
            });

            return newNodes; // Return the new nodes state for setNodes
        });
    }, [setNodes, setEdges, updateLayout]); // Add setNodes and setEdges to dependencies


    const handleExpandTypology = (id: string) => {
        setShowVersions(!showVersions);
    }

    

    const setRulesAndConfigs = useCallback(async (id: string) => { // Made async
        setLoadingAttached(true);
        try {
            const { data: typologyData } = await getTypology(id);

            // Initialize an array to hold the combined rule and config data
            const fetchedRulesWithConfigs: RuleWithConfig[] = [];

            // Iterate through the rules_rule_configs array from the typology data
            for (const ruleEntry of typologyData.rules_rule_configs || []) {
                const ruleId = ruleEntry.ruleId;
                const ruleConfigIds = ruleEntry.ruleConfigId || [];

                // Fetch the full rule details
                let ruleDetails: IRule | null = null;
                if (ruleId) {
                    try {
                        const { data: rule } = await getRuleById(ruleId);
                        ruleDetails = rule;
                    } catch (ruleError) {
                        console.error(`Error fetching rule ${ruleId}:`, ruleError);
                        // Decide how to handle individual rule fetch errors (e.g., skip, log, show specific error)
                    }
                }

                // Fetch all associated rule configurations in parallel
                const ruleConfigDetailsPromises = ruleConfigIds.map(async (configId) => {
                    try {
                        const { data: config } = await getRuleConfigById(configId);
                        return config;
                    } catch (configError) {
                        console.error(`Error fetching rule config ${configId}:`, configError);
                        return null; // Return null or handle error as needed
                    }
                });

                const ruleConfigDetails = (await Promise.all(ruleConfigDetailsPromises)).filter(Boolean) as IRuleConfig[]; // Filter out any nulls from failed fetches

                // If rule details are successfully fetched, add to the combined array
                if (ruleDetails) {
                    fetchedRulesWithConfigs.push({
                        ruleId: ruleDetails._id, // Use the full _id from the fetched rule
                        ruleConfigId: ruleConfigDetails.map(rc => rc._id), // Use full _id from fetched rule configs
                        rule: ruleDetails,
                        ruleConfigs: ruleConfigDetails,
                        typologyId: typologyData._key,
                        typology: typologyData,
                    });
                }
            }
            setAttachedRules(fetchedRulesWithConfigs);

        } catch (e) {
            console.error("Failed to get rules and configurations:", e);
            // modal.error({
            //     title: 'Error',
            //     content: "Couldn't get rules and configurations",
            //     okButtonProps: { style: { backgroundColor: 'red' } }
            // });
        } finally {
            setLoadingAttached(false);
        }
    }, [setAttachedRules, modal]); // Add modal to dependencies


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
            const nodeToUpdateIndex = prev.findIndex((n) => n.id === id);

            if (nodeToUpdateIndex !== -1) {
              let node = currentNodes[nodeToUpdateIndex];

              if (expanded) {
                // Collapse versions
                node.data = {
                  ...node.data,
                  expanded: false,
                };
                currentNodes[nodeToUpdateIndex] = node;

                // Remove version nodes
                currentNodes = currentNodes.filter(
                  (n) => n.data.typologyNodeId !== node.id
                );

                setNodes([...currentNodes]);

                setEdges((prevEdges) => {
                  return [...prevEdges.filter((e) => e.source !== node.id)];
                });

                updateLayout(
                  [...currentNodes],
                  [...edges.filter((e) => e.source !== node.id)]
                );

                return currentNodes;
              } else {
                // Expand versions
                node.data = {
                  ...node.data,
                  expanded: true,
                };
                currentNodes[nodeToUpdateIndex] = node;

                const newNodes: Node[] = [];
                const newEdges: Edge[] = [];

                (node.data?.versions || []).forEach((v: ITypology, i: number) => {
                  const dataId = getRandomNumber(10000).toString();

                  const versionNode: Node = {
                    id: dataId,
                    data: {
                      label: `Version ${v.cfg}`,
                      checked: node?.data?.lastCheckedId === v._key,
                      typologyNodeId: node.id,     // React Flow node ID
                      typologyId: v._key,          // Backend Typology ID (added!)
                      id: dataId,
                      handleCheck,
                      ...v,
                    },
                    ...nodeDefaults,
                    type: 'versionNode',
                    position: {
                      x: node.position.x + 500,
                      y: node.position.y + 50 * (i + 1),
                    },
                  };

                  const edge: Edge = {
                    id: getRandomNumber(1000).toString(),
                    source: node.id,
                    target: versionNode.id,
                    data: { type: 'versionNode' },
                  };

                  newNodes.push(versionNode);
                  newEdges.push(edge);
                });

                setEdges((prev) => [...prev, ...newEdges]);
                updateLayout([...currentNodes, ...newNodes], [...edges, ...newEdges]);
                return [...currentNodes.concat(newNodes)];
              }
            }

            return prev;
          });
        }, [edges, updateLayout]);

    const handleVersionClick = async (typologyId: string) => {
      try {
        setLoadingAttached(true);

        const { data } = await getTypology(typologyId);

        const ruleIds: string[] = [];
        const ruleConfigIds: string[] = [];

        (data.rules_rule_configs || []).forEach(entry => {
          if (entry.ruleId) ruleIds.push(entry.ruleId);
          if (Array.isArray(entry.ruleConfigId)) {
            ruleConfigIds.push(...entry.ruleConfigId);
          }
        });

        // Fetch all rules and configs in parallel
        const ruleResponses = await Promise.all(
          ruleIds.map(id =>
            Api.get(`/rule/${id}`).then(res => res.data).catch(() => null)
          )
        );

        const configResponses = await Promise.all(
          ruleConfigIds.map(id =>
            Api.get(`/rule-config/${id}`).then(res => res.data).catch(() => null)
          )
        );

        // Clean out any null responses
        const rules = ruleResponses.filter(Boolean);
        const configs = configResponses.filter(Boolean);

        // Group configs by ruleId
        const configMap: Record<string, RuleConfig[]> = {};
        for (const cfg of configs) {
          const ruleId = cfg.ruleId;
          if (!configMap[ruleId]) {
            configMap[ruleId] = [];
          }

          // Add ruleName for display
          const rule = rules.find(r => r._id === ruleId);
          configMap[ruleId].push({
            ...cfg,
            ruleName: rule?.name || 'UnknownRule'
          });
        }

        // Construct RuleWithConfig[]
        const ruleWithConfigList: RuleWithConfig[] = rules.map(rule => ({
          rule,
          ruleConfigs: configMap[rule._id] || [],
        }));

        // Set state
        setAttachedRules(ruleWithConfigList);
      } catch (err) {
        console.error("Failed to load version data:", err);
      } finally {
        setLoadingAttached(false);
      }
    };





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
            setEdges((eds) => addEdge({ ...params, type: ConnectionLineType.Default, animated: true }, eds)),
        []
    );


    useEffect(() => {
      setLoadingTypologies(true);
      getTypologies(1)
        .then(({ data }) => {
          const grouped = groupTypologies(data.data || []);
          setTypologies(grouped);
        })
        .catch((e) => {
          handleError(e.response?.data?.message || e.message);
        })
        .finally(() => {
          setLoadingTypologies(false);
        });
    }, []);

    

    const onNodeClick: NodeMouseHandler = useCallback(
      (_event, node) => {
        if (node.type === 'eventNode') {
          setActiveEventId(node.id);
          setNodes((prev) =>
            prev.map((n) =>
              n.id === node.id
                ? { ...n, data: { ...n.data, isActive: true } }
                : n.type === 'eventNode'
                  ? { ...n, data: { ...n.data, isActive: false } }
                  : n
            )
          );
        } else if (node.type === 'typologyNode' || node.type === 'versionNode') { // Assuming your typology version nodes have type 'typologyNode' or 'versionNode'
          const typologyId = node.id; // Or node.data.id, depending on where the typology ID is stored in your node object
          setRulesAndConfigs(typologyId);
          // You might also want to call handleExpandTypology here if clicking the node should also open the versions modal
          // handleExpandTypology(typologyId); // Uncomment if clicking a typology node should also open its versions view
        }
      },
      [
        setActiveEventId,
        setNodes,
        setRulesAndConfigs,
        // handleExpandTypology, // Include if you uncomment the line above
      ]
    );


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
        });
    }, [nodes, attachedRules, edges, typologies]);


    

    const onDrop = useCallback((event: any) => {
        event.preventDefault();
        setRuleDragIndex(null);

        const data = event.dataTransfer.getData('data');
        const draggedItem = JSON.parse(data);
        const draggedType = event.dataTransfer.getData('type');

        if (draggedType === 'typology') {
            // Automatically get the only event node on the canvas
            const onlyEventNode = nodes.find((n) => n.type === 'eventNode');
            if (!onlyEventNode) {
                modal.warning({
                    title: 'No Event Node Found',
                    content: 'Please add an event node before dragging a typology.',
                });
                return;
            }
            const eventId = onlyEventNode.id;

            const typologyId = draggedItem._key;

            const existingNode = nodes.find((n) => n.id === typologyId);
            if (existingNode) {
                const edgeExists = edges.some(
                    (e) => e.source === eventId && e.target === typologyId
                );

                if (!edgeExists) {
                    const newEdge: Edge = {
                        id: getRandomNumber(100000).toString(),
                        source: eventId,
                        target: typologyId,
                        type: 'smoothstep',
                        animated: false,
                    };

                    const updatedEdges = [...edges, newEdge];

                    const updatedNodes = nodes.map((node) => {
                        if (node.id === eventId) {
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    expanded: true,
                                    isActive: true,
                                },
                            };
                        }
                        return node;
                    });

                    setNodes(updatedNodes);
                    setEdges(updatedEdges);
                    updateLayout(updatedNodes, updatedEdges);
                }
                return;
            }

            const [lastNode] = nodes.filter((n) => n.type === 'typologyNode');
            const typologyNode = {
                ...nodeDefaults,
                id: typologyId,
                type: 'typologyNode',
                data: {
                    ...draggedItem,
                    label: draggedItem.name.slice(0, 25),
                    handleExpandVersions,
                    handleExpand: handleExpandTypology,
                    handleDelete,
                    eventId,
                },
                position: {
                    x: 1000,
                    y: lastNode ? (lastNode?.position?.y || 0) + 200 : 150,
                },
                width: 350,
                height: 350,
            };

            const typologyEdge: Edge = {
                id: getRandomNumber(10000).toString(),
                source: eventId,
                target: typologyId,
                type: 'smoothstep',
                animated: false,
            };

            let updatedNodes = [...nodes, typologyNode];
            let updatedEdges = [...edges, typologyEdge];

            updatedNodes = updatedNodes.map((node) => {
                if (node.id === eventId) {
                    return { ...node, data: { ...node.data, expanded: true, isActive: true } };
                }
                if (node.id === typologyNode.id) {
                    return { ...node, hidden: false };
                }
                return node;
            });

            updatedEdges = updatedEdges.map((edge) => {
                if (edge.source === typologyEdge.source && edge.target === typologyEdge.target) {
                    return { ...edge, hidden: false };
                }
                return edge;
            });

            setNodes(updatedNodes);
            setEdges(updatedEdges);
            updateLayout(updatedNodes, updatedEdges);

            setTypologyOptions((prev) => prev.filter((t) => t._key !== typologyId));
        }

        else if (draggedType === 'event') {
            const eventAlreadyExists = nodes.some((n) => n.type === 'eventNode');

            if (eventAlreadyExists) {
                modal.warning({
                    title: 'Event Already Exists',
                    content: 'Only one Event can be added to the canvas.',
                });
                return;
            }

            const [lastNode] = nodes.filter((n) => n.type === 'eventNode');
            const eventNode = {
                ...nodeDefaults,
                id: draggedItem.value,
                type: 'eventNode',
                data: {
                    ...draggedItem,
                    label: draggedItem.label.slice(0, 25),
                    handleExpand: handleExpandEvent,
                    handleDelete,
                    isActive: false,
                },
                position: {
                    x: 1000,
                    y: lastNode ? (lastNode?.position?.y || 0) + 200 : 150,
                },
                width: 172,
                height: 36,
            };

            const eventEdge: Edge = {
                id: getRandomNumber(10000).toString(),
                source: '1',
                target: eventNode.id,
                type: 'default',
                animated: false,
            };

            const updatedNodes = [...nodes, eventNode];
            const updatedEdges = [...edges, eventEdge];

            setNodes(updatedNodes);
            setEdges(updatedEdges);
            updateLayout(updatedNodes, updatedEdges);
        }

    }, [
        nodes,
        edges,
        updateLayout,
        setRuleDragIndex,
        handleExpandEvent,
        handleExpandTypology,
        handleDelete,
        handleExpandVersions,
        setNodes,
        setEdges,
        setTypologyOptions,
    ]);


    return <> <Create
        loadingTypologies={loadingTypologies}
        nodes={nodes}
        onConnect={onConnect}
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