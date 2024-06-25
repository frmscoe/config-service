import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Create } from "./Create";
import { IRule } from "~/domain/Rule/RuleDetailPage/service";
import { getRulesWithConfigs } from "~/domain/Rule/RuleConfig/RuleConfigList/service";
import usePrivileges from "~/hooks/usePrivileges";
import AccessDeniedPage from "~/components/common/AccessDenied";
import { useNodesState, useEdgesState, Position, addEdge, NodeMouseHandler, Node, ConnectionLineType } from "reactflow";
import { IRuleConfig } from "~/domain/Rule/RuleConfig/RuleConfigList/types";
import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { createNodesAndEdges, createTypology, updateLayout, updateTypology } from "./service";
import { Modal } from "antd";
import { useCommonTranslations } from "~/hooks";
import { Router, useRouter } from "next/router";
import { useParams } from "next/navigation";
import { getTypology } from "../Score/service";

export interface AttachedRules extends IRule {
    attachedConfigs: IRuleConfig[];
}
const nodeDefaults = {
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    type: 'customNode'
};


const initialNodes = [
    {
        id: '1',
        position: { x: 0, y: 150 },
        data: { label: 'Typology', showDelete: false },
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
const CreateEditTopologyPage = () => {

    const [rules, setRules] = useState<IRule[]>([]);
    const [ruleOptions, setRuleOptions] = useState<IRule[]>([]);
    const [modal, contextHolder] = Modal.useModal();
    const [page, setPage] = useState(1);
    const [loadingRules, setLoadingRules] = useState(true);
    const [error, setError] = useState('');
    const { canCreateTypology, canViewRuleWithConfigs, canEditTypology } = usePrivileges();
    const reactFlowWrapper = useRef<any>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedRule, setSelectedRuleIndex] = useState<null | string>(null);
    const [attachedRules, setAttachedRules] = useState<AttachedRules[]>([]);
    const [ruleDragIndex, setRuleDragIndex] = useState<number | null>(null);
    const [removedRules, setRemoveRules] = useState<IRule[] | IRuleConfig[]>([]);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const { t } = useCommonTranslations();
    const router = useRouter();
    const { id } = useParams();
    const isEditMode = useMemo(() => {
        return !!id;
    }, [id])

    const schema = useMemo(() => {
        return yup.object().shape({
            name: yup.string().required(),
            description: yup.string().required(),
            minor: yup.number().required(),
            major: yup.number().required(),
            patch: yup.number().required(),
        });
    }, []);

    const { control, handleSubmit, formState, watch, reset, trigger, getValues, setValue } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange'
    });

    const save = async (data: any, openScoreMode = false) => {
        const instanceLoading = modal.info({
            title: t('typologyCreatePage.saving'),
            content: t('typologyCreatePage.pleaseWait'),
            okButtonProps: {
                style: {
                    backgroundColor: 'red',
                }
            }
        })
        try {
            setSaveLoading(true);
            const obj = {
                state: '01-Draft',
                desc: data.description,
                cfg: `${data.major || 0}.${data.minor || 0}.${data.patch || 0}`,
                name: data.name,
                typologyCategoryUUID: [],
                rules_rule_configs: attachedRules.map((rule) => ({ ruleId: rule._id, ruleConfigId: rule.attachedConfigs.map((c) => (c._id)) })),
            }
            if (isEditMode) {
                //save changes and do nothing;
                const res = await updateTypology({
                    ...obj,
                }, id as string);
                const instanceSuccess = modal.success({
                    title: 'Success',
                    content: t('typologyCreatePage.typologyUpdated'),
                    okButtonProps: {
                        style: {
                            backgroundColor: 'red',
                        }
                    }
                });
                setSaved(true);

                instanceLoading.destroy();
                setTimeout(() => {
                    instanceSuccess.destroy();
                }, 3000);
                if (openScoreMode) {
                    router.push(`/typology/${res.data._key}/score`);
                } else {
                    if (res.data?._key) {
                        router.push(`/typology/edit/${res.data._key}`);
                    }
                }
            } else {
                const res = await createTypology(obj);
                reset();
                instanceLoading.destroy();
                const instanceSuccess = modal.success({
                    title: 'Success',
                    content: t('typologyCreatePage.typologyCreated'),
                    okButtonProps: {
                        style: {
                            backgroundColor: 'red',
                        }
                    }
                });
                setNodes([...initialNodes]);
                setEdges([...initialEdges]);
                setAttachedRules([]);
                setTimeout(() => {
                    instanceSuccess.destroy();
                }, 10000);
                setSaved(true);
                if (openScoreMode) {
                    router.push(`/typology/${res?.data?._key}/score`);
                } else {
                    router.push(`/typology/edit/${res?.data?._key}`);

                }
            }

        } catch (e: any) {
            instanceLoading.destroy();
            setError(e?.response?.data?.message || e?.message || 'Something went wrong');
            modal.error({
                title: 'Error',
                content: e?.response?.data?.message || e?.message || 'Something went wrong',
                okButtonProps: {
                    style: {
                        backgroundColor: 'red',
                    }
                }
            });
        } finally {
            setSaveLoading(false);
            instanceLoading.destroy();
        }

    }

    const onSubmit = async (data: any) => {
        await save(data);
    };

    const onConnect = useCallback(
        (params: any) =>
            setEdges((eds) =>
                addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)
            ),
        []
    );

    const onOpenScoreMode = () => {
        if (formState.isDirty || attachedRules.length) {
            modal.confirm({
                title: 'Save in Drafts',
                content: 'Would you like to save your changes as draft before switching to score view',
                cancelText: 'Dont Save',
                okText: 'Save Changes',
                okButtonProps: {
                    className: 'bg-green-500 text-white'
                },
                onOk: async () => {
                    await save(getValues(), true);
                }
            })
        } else {
            modal.info({
                title: 'No changes',
                content: 'No changes have been yet. Please add new changes before switching to scoring view',
                okButtonProps: {
                    className: 'bg-green-500 text-white'
                }
            })
        }
    }

    const fetchRuleWithConfigurations = useCallback(() => {
        setError('');
        setLoadingRules(true);
        getRulesWithConfigs({ page, limit: 100 })
            .then(({ data }) => {
                if (!isEditMode) {
                    setRules(data?.rules || []);
                } else {
                    handleSetEditData(data?.rules || [])
                }
            }).finally(() => {
                setLoadingRules(false)
            }).catch((e) => {
                setError(e.response?.data?.message || e?.message || 'Something went wrong getting configurations');
            })
    }, [page, isEditMode]);

    const onNodeClick: NodeMouseHandler = (_event, node) => {
        if (node.type === 'customNode' && node.data.type === 'rule') {
            setSelectedRuleIndex(node.id);
        }
    }

    const handleDelete = useCallback((id: string, type: string) => {
        setSelectedRuleIndex(null);
        const currentNodes = nodes;
        const newNodes = nodes.filter((n) => id !== n.id);
        setNodes([...newNodes]);
        const newEdges = edges.filter((r) => r.id !== id);
        setEdges([...newEdges]);
        if (type === 'rule') {
            const newEdges = edges.filter((r) => r.source !== id)
                .filter((r) => r.target !== id);
            setEdges([...newEdges]);
            const rule = rules.find((r) => r._key === id);
            setNodes([...newNodes.filter((n: any) => {
                if (n.type === 'rule') {
                    return true;
                }
                return (n?.data?.ruleId) !== id;
            })]);
            setAttachedRules((prev) => {
                const newAttached = prev.filter((r) => r._key !== id);
                return [...newAttached];
            });

            if (rule) {
                setRemoveRules((prev) => {
                    const nonExistRemovedConfigs = [];
                    const removedConfigs = currentNodes.filter((n: any) => n.data.ruleId === id);
                    const ruleExist = prev.find((r) => r._key === id);
                    if (!ruleExist) {
                        nonExistRemovedConfigs.push(rule);
                    }
                    removedConfigs.forEach((config) => {
                        const exist = prev.find((r) => r._key === config.id);
                        if (!exist) {
                            nonExistRemovedConfigs.push({ ...config.data, ruleName: rule.name });
                        }

                    })
                    return [
                        ...prev,
                        ...nonExistRemovedConfigs
                    ] as IRule[]
                });
                setRuleOptions((prev) => {
                    const ruleExists = prev.find((r) => r._key === rule._key);
                    if (ruleExists) {
                        return [
                            ...prev,
                        ]
                    }
                    return [
                        ...prev,
                        rule,
                    ]
                })
            }

        } else {
            const config = nodes.find((node) => node.id === id) as Node & { data: { ruleId: string } } | undefined;
            setEdges([...edges.filter((e) => e.target !== id)]);
            if (config) {
                const currentAttachedRules = attachedRules;
                const ruleIndex = currentAttachedRules.findIndex((rule) => rule._key === config?.data?.ruleId);
                if (ruleIndex !== -1) {
                    currentAttachedRules[ruleIndex].attachedConfigs = currentAttachedRules[ruleIndex].attachedConfigs.filter((c) => c._key !== config.id);
                    setAttachedRules([...currentAttachedRules]);
                }
                setRemoveRules((prev) => {
                    const exists = prev.find((r) => r._key === id);
                    if (exists) {
                        return prev;
                    }
                    return [
                        ...prev,
                        config.data
                    ] as any
                });
            }


        }
    }, [nodes, rules, attachedRules, edges]);

    const handleRuleNodeAdded = useCallback((rule: IRule, config: IRuleConfig) => {
        const attachedRulesIds = attachedRules.map((r) => r._key);
        const newOptions = rules.filter((r) => r._key !== rule._key);
        setRuleOptions([...newOptions.filter((r) => !attachedRulesIds.includes(r._key))]);
        const newAttachedRules = [...attachedRules, { ...rule, attachedConfigs: [] }];

        const currentAttachedRules = newAttachedRules;
        const updateRuleIndex = newAttachedRules.findIndex((r) => r._key === config.ruleId);
        if (updateRuleIndex !== -1) {
            currentAttachedRules[updateRuleIndex].attachedConfigs = [
                ...(currentAttachedRules[updateRuleIndex].attachedConfigs || []),
                config
            ]
        }
        setAttachedRules([...currentAttachedRules]);

    }, [attachedRules, rules,]);

    const onDrop = useCallback((event: any) => {
        event.preventDefault();
        setRuleDragIndex(null);
        const type = event.dataTransfer.getData('type');
        const data = event.dataTransfer.getData('data');
        if (type === 'rule') {
            const rule: IRule = JSON.parse(data);
            if (attachedRules.find((r) => r._key === rule._key)) {
                return;
            }
            if (nodes.length === 1) {
                const node = {
                    ...nodeDefaults,
                    id: rule._key,
                    data: { 
                        label: rule.name, 
                        ...rule, 
                        onDelete: handleDelete, 
                        type: 'rule', 
                        showDelete: true },
                    position: { x: 250, y: nodes[0]?.position?.y || 100 },
                    type: 'customNode'
                }
                const edge = {
                    id: rule._key,
                    source: '1',
                    target: node.id,
                    type: 'smoothstep'
                }
                setNodes([...nodes, node]);
                setEdges([...edges, edge]);
                updateLayout([...nodes, node], [...edges, edge]);
            } else {
                const node = {
                    ...nodeDefaults,
                    id: rule._key,
                    data: { label: rule.name, ...rule, onDelete: handleDelete, type: 'rule', showDelete: true },
                    position: { x: 250, y: nodes[nodes.length - 1].position.y + 50 },
                    type: 'customNode'
                }
                const edge = {
                    id: rule._key,
                    source: '1',
                    target: node.id,
                    type: 'smoothstep'
                }
                const layedOutNodes = updateLayout([...nodes, node], [...edges, edge]);
                setNodes([...layedOutNodes]);
                setEdges([...edges, edge]);
            }
            const attachedRulesIds = attachedRules.map((r) => r._key);
            const newOptions = rules.filter((r) => r._key !== rule._key);
            setRuleOptions([...newOptions.filter((r) => !attachedRulesIds.includes(r._key))]);
            setAttachedRules([...attachedRules, { ...rule, attachedConfigs: [] }]);

        } else {
            const config: IRuleConfig = JSON.parse(data);
            const parentNode: any = nodes.find((n: any) => n.id === config.ruleId && (n?.data?.type) === 'rule');
            //handle if rule for rule configuration has been added already;
            if (parentNode) {
                const nodeConfig = {
                    id: config._key,
                    position: { x: 500, y: 100 },
                    data: {
                        label: `${parentNode?.data?.name || ''}-config-${config.cfg || ''}`,
                        type: 'config',
                        onDelete: handleDelete,
                        showDelete: true,
                        ...config,
                    },
                    ...nodeDefaults,
                }

                const edge = {
                    id: config._key,
                    source: config.ruleId,
                    target: nodeConfig.id,
                    type: 'smoothstep'
                }
                setEdges([...edges, edge]);
                const layedOutNodes = updateLayout([...nodes, nodeConfig], [...edges, edge]);
                setNodes(layedOutNodes);
                const currentAttachedRules = attachedRules;
                const updateRuleIndex = attachedRules.findIndex((r) => r._key === config.ruleId);
                if (updateRuleIndex !== -1) {
                    currentAttachedRules[updateRuleIndex].attachedConfigs = [
                        ...(currentAttachedRules[updateRuleIndex].attachedConfigs || []),
                        config
                    ]
                    setAttachedRules([...currentAttachedRules]);
                }

            } else {
                //no parent node rule node
                const config: IRuleConfig = JSON.parse(data);
                const rule = rules.find((r) => r._key === config.ruleId);
                if (rule) {
                    const parentNode = {
                        id: rule._key,
                        position: { x: 250, y: 100 },
                        data: {
                            label: rule.name,
                            ...rule,
                            type: 'rule',
                            onDelete: handleDelete,
                            showDelete: true,
                        },
                        ...nodeDefaults
                    }
                    const parentEdge = {
                        id: parentNode.id,
                        source: '1',
                        target: parentNode.id,
                        type: 'smoothstep'
                    }
                    const configNode = {
                        id: config._key,
                        position: { x: 500, y: 100 },
                        data: {
                            label: `${parentNode?.data?.name || ''}-config-${config.cfg || ''}`,
                            ...config,
                            type: 'config',
                            onDelete: handleDelete,
                            showDelete: true,
                        },
                        ...nodeDefaults
                    }

                    const configEdge = {
                        id: configNode.id,
                        source: rule._key,
                        target: configNode.id,
                        type: 'smoothstep'
                    }
                    setEdges([...edges, parentEdge, configEdge]);
                    const layedOutNodes = updateLayout([...nodes, parentNode, configNode], [...edges, parentEdge, configEdge]);
                    setNodes(layedOutNodes);
                    handleRuleNodeAdded(rule, config);

                }

            }
        }
    }, [nodes, rules, attachedRules, edges, handleDelete]);

    const handleSetEditData = useCallback((rules: IRule[]) => {
        getTypology(id as string)
            .then(({ data }) => {
                setValue('name', data?.name || '', { shouldDirty: true, shouldTouch: true });
                setValue('description', data?.desc || '', { shouldDirty: true, shouldTouch: true });
                const [major, minor, patch] = (data?.cfg || '').split('.')
                setValue('major', !isNaN(Number(major)) ? Number(major) : 0, { shouldDirty: true, shouldTouch: true });
                setValue('minor', !isNaN(Number(minor)) ? Number(minor) : 0, { shouldDirty: true, shouldTouch: true });
                setValue('patch', !isNaN(Number(patch)) ? Number(patch) : 0, { shouldDirty: true, shouldTouch: true });
                let rulesArray: IRule[] = [];
                data?.ruleWithConfigs.forEach((d) => {
                    const rule = {
                        ...d.rule,
                        ruleConfigs: (d.ruleConfigs || []).map((c) => ({ ...c, ruleId: d.rule._key })) as any,
                    } as Partial<IRule>
                    rulesArray.push(rule as IRule);
                });
                const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(rulesArray, handleDelete);
                const layedOutNodes = updateLayout([...initialNodes, ...newNodes], [...initialEdges, ...newEdges]);
                setNodes([...layedOutNodes]);
                setEdges([...initialEdges, ...newEdges]);
                const options: IRule[] = [];
                rules.forEach((r) => {
                    const exists = rulesArray.find((rule) => rule._key === r._key);
                    if (!exists) {
                        options.push(r);
                    }
                });
                setRules(rules);
                setRuleOptions([...options]);
                setAttachedRules([...rulesArray.map((r) => ({ ...r, attachedConfigs: r.ruleConfigs }))])

            }).catch((e) => {
                setError(e.response?.data?.message || e?.message || 'Something went wrong getting configurations');
            }).finally(() => {
                setLoadingRules(false);
            })
    }, [id]);

    useEffect(() => {
        if (canViewRuleWithConfigs) {
            fetchRuleWithConfigurations();
        }
    }, [fetchRuleWithConfigurations, canViewRuleWithConfigs]);

    useEffect(() => {
        const handler = () => {
            if ((formState.isDirty || attachedRules.length)) {
                if(!saved && !isEditMode) {
                    const confirm = window.confirm('You have unsaved changes. Are you sure you want to navigate away');
                    if (!confirm) {
                        throw 'Please save changes to continue';
                    }
                }
            }
            setSaved(false);
        }
        Router.events.on('beforeHistoryChange', handler);
        return () => {
            Router.events.off("beforeHistoryChange", handler);
        };
    }, [formState.isDirty, attachedRules, saved, isEditMode]);

    if (!canCreateTypology) {
        return <AccessDeniedPage />
    }
    if (isEditMode && !canEditTypology) {
        return <AccessDeniedPage />
    }
    return <> <Create
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
        formState={formState}
        handleSubmit={handleSubmit}
        control={control}
        onSubmit={onSubmit}
        watch={watch}
        saveLoading={saveLoading}
        onOpenScoreMode={onOpenScoreMode}

    />
        {contextHolder}
    </>
}
export default CreateEditTopologyPage;


