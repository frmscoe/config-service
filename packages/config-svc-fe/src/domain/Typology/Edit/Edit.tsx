// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Create } from "~/domain/Typology/Create/Create";
import { IRule } from "~/domain/Rule/RuleDetailPage/service";
import { getRulesWithConfigs } from "~/domain/Rule/RuleConfig/RuleConfigList/service";
import usePrivileges from "~/hooks/usePrivileges";
import { useNodesState, useEdgesState, Position, addEdge, NodeMouseHandler, Node, MiniMap, Controls } from "reactflow";
import { IRuleConfig } from "~/domain/Rule/RuleConfig/RuleConfigList/types";
import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { createTypology, updateTypology, transitionTypologyState } from "./service"; // Import transitionTypologyState
import { createNodesAndEdges, hasChanged, updateLayout, parseConfigVersion } from "./helpers";

import { Modal, Select, Form, Button, Row, Col, notification } from "antd"; // Added notification
import { useCommonTranslations } from "~/hooks";
import { useRouter } from "next/router";
import { ITypology, StateEnum } from "src/domain/Typology/types";
import { canTransition } from "../../../../machine/guards";
import { Rules } from "../Create/Rules";
import TypologyForm from "../Create/Typology-Form";
import { Flow } from "../Create/Flow";
import { RulesAttached } from "../Create/Rules-Attached";
import { RulesConfigurationsAttached } from "../Create/Rules-Attached";
import { Structure } from "../Create/Structure";
import TypologyDetails from "../Create/Typology-Details";


const { Option } = Select;

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
        type: 'customNode',
        position: { x: 0, y: 150 },
        data: { label: 'Typology', showDelete: false },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
    },
];


const initialEdges = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
    },
];

interface EditTypologyUIProps {
    typology: ITypology | null; // Null for new creation, populated for edit
    fetchTypology: () => void; // Callback to re-fetch typology data after save
}

// Renamed to Edit, to be the UI component corresponding to ReviewTypology.tsx
export const Edit: React.FunctionComponent<EditTypologyUIProps> = ({ typology: initialTypologyData, fetchTypology }) => {

    const router = useRouter(); // Using useRouter for navigation inside component

    const [rules, setRules] = useState<IRule[]>([]); // This state holds all available rules with their configs
    const [ruleOptions, setRuleOptions] = useState<IRule[]>([]);
    const [modal, contextHolder] = Modal.useModal();
    const [page, setPage] = useState(1);
    const [loadingRules, setLoadingRules] = useState(true); // Still needed for rules dropdown
    const { privileges, canCreateTypology, canViewRuleWithConfigs, canEditTypology } = usePrivileges();
    const reactFlowWrapper = useRef<any>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedRule, setSelectedRuleIndex] = useState<null | string>(null);
    const [attachedRules, setAttachedRules] = useState<AttachedRules[]>([]);
    const [ruleDragIndex, setRuleDragIndex] = useState<number | null>(null);
    const [removedRules, setRemoveRules] = useState<IRule[] | IRuleConfig[]>([]);
    const [saveLoading, setSaveLoading] = useState(false);
    const [transitionLoading, setTransitionLoading] = useState(false); // New loading state for transitions
    const [saved, setSaved] = useState(false); // Indicates if current state matches last saved state
    const savedJustNowRef = useRef(false); // Flag to bypass navigation confirm immediately after a save
    const [editData, setEditData] = useState<ITypology & { attachedRules: AttachedRules[] }>(
        initialTypologyData ? { ...initialTypologyData, attachedRules: [] as AttachedRules[] } as ITypology & { attachedRules: AttachedRules[] } : { attachedRules: [] } as unknown as ITypology & { attachedRules: AttachedRules[]}
    );
    const { t } = useCommonTranslations();

    const isEditMode = useMemo(() => {
        return !!initialTypologyData?._key;
    }, [initialTypologyData]);


    const schema = useMemo(() => {
        return yup.object().shape({
            name: yup.string().required(),
            description: yup.string().required(),
            minor: yup.number().required().min(0, 'Minor version must be non-negative').integer('Minor version must be an integer'),
            major: yup.number().required().min(0, 'Major version must be non-negative').integer('Major version must be an integer'),
            patch: yup.number().required().min(0, 'Patch version must be non-negative').integer('Patch version must be an integer'),
        });
    }, [0]); // Empty dependency array means this memoized value is created once


    const { control, handleSubmit, formState, watch, reset, trigger, getValues, setValue } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            description: '',
            major: 0,
            minor: 0,
            patch: 0,
        }
    });


    // Fetch all available rules for the Rules sidebar FIRST
    useEffect(() => {
        setLoadingRules(true);
        getRulesWithConfigs({ page, limit: 100 })
            .then(({ data }) => {
                const fetchedRules = data?.rules || [];
                console.log("Edit.tsx: Rules fetched from API (setRules):", fetchedRules);
                setRules(fetchedRules);
                // In create mode, all fetched rules are available as options.
                if (!initialTypologyData) {
                    setRuleOptions(fetchedRules);
                }
            }).finally(() => {
                setLoadingRules(false);
            }).catch((e) => {
                modal.error({
                    title: 'Error fetching rules',
                    content: e.response?.data?.message || e.message || 'Something went wrong getting rule configurations',
                });
                setRules([]);
                setRuleOptions([]);
            });
    }, [page, initialTypologyData, modal]);

    // Effect to initialize form and React Flow graph when initialTypologyData changes (e.e.g, on first load)
    useEffect(() => {
        if (initialTypologyData && rules.length > 0) { // Only proceed if typology data and rules are available
            console.log("Edit.tsx: initialTypologyData received (for layout effect):", initialTypologyData);
            console.log("Edit.tsx: `rules` state in layout effect:", rules);

            const { major, minor, patch } = parseConfigVersion(initialTypologyData.cfg);
            reset({
                name: initialTypologyData.name || '',
                description: initialTypologyData.desc || '',
                major: major,
                minor: minor,
                patch: patch,
            });

            const rulesWithFullDetails: AttachedRules[] = initialTypologyData.rules_rule_configs
                ? initialTypologyData.rules_rule_configs.map(typologyRuleEntry => {
                    const fullRule = rules.find(r => r._id === typologyRuleEntry.ruleId);

                    if (fullRule) {
                        const attachedConfigs: IRuleConfig[] = typologyRuleEntry.ruleConfigId
                            ? typologyRuleEntry.ruleConfigId.map(configId => {
                                const fullConfig = fullRule.ruleConfigs?.find(rc => rc._id === configId);
                                return fullConfig || { _id: configId, _key: configId.split('/')[1], cfg: 'N/A', name: configId.split('/')[1] || 'Unnamed Config', ruleId: typologyRuleEntry.ruleId } as IRuleConfig;
                            })
                            : [];

                        return {
                            ...fullRule,
                            name: fullRule.name || fullRule._key?.split('/')[1] || 'Unnamed Rule',
                            attachedConfigs: attachedConfigs
                        } as AttachedRules;
                    }
                    console.warn(`Edit.tsx: Rule not found in 'rules' state during initial layout for ID: ${typologyRuleEntry.ruleId}`);
                    return null;
                }).filter(Boolean) as AttachedRules[]
                : [];

            console.log("Edit.tsx: rulesWithFullDetails (derived for nodes, before creating nodes):", rulesWithFullDetails);

            setAttachedRules(rulesWithFullDetails);
            setEditData({ ...initialTypologyData, attachedRules: rulesWithFullDetails });

            const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(rulesWithFullDetails, handleDelete);
            setNodes([...initialNodes, ...newNodes]);
            setEdges([...initialEdges, ...newEdges]);

            const layedOutNodes = updateLayout([...initialNodes, ...newNodes], [...initialEdges, ...newEdges]);
            console.log("Edit.tsx: layedOutNodes after updateLayout:", layedOutNodes);
            setNodes(layedOutNodes);

            setRuleOptions(rules.filter(r => !rulesWithFullDetails.some(ar => ar._key === r._key)));

        } else if (!isEditMode && rules.length > 0) {
            reset();
            setNodes([...initialNodes]);
            setEdges([...initialEdges]);
            setAttachedRules([]);
            setRuleOptions([...rules]);
            setEditData({ attachedRules: [] } as unknown as ITypology & { attachedRules: AttachedRules[] });
        }
        setSaved(true);
    }, [initialTypologyData, reset, setNodes, setEdges, setAttachedRules, setEditData, setRuleOptions, rules, handleDelete, initialNodes, initialEdges, isEditMode]);


    const save = async (data: any, versionBumpType?: 'major' | 'minor' | 'patch') => {
        const instanceLoading = modal.info({
            title: t('typologyCreatePage.saving'),
            content: t('typologyCreatePage.pleaseWait'),
            okButtonProps: { style: { backgroundColor: 'red' } }
        });
        try {
            setSaveLoading(true);
            const typologyState: ITypology['state'] = StateEnum['01_DRAFT'];

            console.log("Save function: attachedRules before mapping for payload (JSON.stringify):", JSON.stringify(attachedRules, null, 2)); // CRITICAL DEEPER DEBUG LOG
            // Add a defensive filter(Boolean) here to remove any null/undefined entries before mapping
            const rulesRuleConfigs = attachedRules.filter(Boolean).map((rule, index) => {
                // This check should now ideally be caught by filter(Boolean) but keeping for explicit safety
                if (!rule) {
                    console.error(`Save function: ERROR - Found null/undefined rule at index ${index} in attachedRules array after filter.`);
                    throw new Error("Attempted to save a null/undefined rule in attached rules. Please reload the page.");
                }
                // Keep this check as rule._id is crucial for database storage
                if (typeof rule._id === 'undefined' || rule._id === null) {
                    console.error(`Save function: ERROR - Rule at index ${index} is missing '_id':`, rule);
                    throw new Error(`Attempted to save a rule without an ID (at index ${index}). Please check console for details.`);
                }

                const configIds = rule.attachedConfigs?.filter(Boolean).map((c, configIndex) => { // Also filter configs defensively
                    if (!c || typeof c._id === 'undefined' || c._id === null) {
                         console.error(`Save function: ERROR - Found undefined or ID-less config at index ${configIndex} for rule ID '${rule._id}':`, c);
                         throw new Error(`Config for rule '${rule.name || rule._id}' at index ${configIndex} is invalid. Cannot save.`);
                    }
                    return c._id;
                }) || [];

                return {
                    ruleId: rule._id,
                    // REMOVED: name: rule.name,
                    // REMOVED: description: rule.description,
                    // REMOVED: cfg: rule.cfg,
                    ruleConfigId: configIds // Renamed 'rules_rule_configs' to 'ruleConfigId' to match the sample
                };
            });
            console.log("Save function: rulesRuleConfigs for API payload:", rulesRuleConfigs);

            const baseTypologyObj = {
                desc: data.description,
                name: data.name,
                typologyCategoryUUID: [],
                rules_rule_configs: rulesRuleConfigs, // Use the prepared rulesRuleConfigs
            };

            let res: { data: ITypology };

            if (isEditMode && initialTypologyData?._key) {
                // CORRECTED: Changed state names to match configStateMachine.ts
                const requiresNewVersion = ['20_APPROVED', '30_DEPLOYED', '12_WITHDRAWN', '32_RETIRED', '90_ABANDONED', '91_ARCHIVED'].includes(initialTypologyData.state);

                if (requiresNewVersion) {
                    if (!initialTypologyData || typeof initialTypologyData.cfg === 'undefined' || initialTypologyData.cfg === null) {
                        console.error("Save Error: initialTypologyData or its cfg is missing for version bump.", { initialTypologyData });
                        throw new Error('Missing typology data or version information (cfg) to perform a version bump. Please ensure the typology is loaded correctly.');
                    }
                    console.log("Saving: initialTypologyData.cfg for version bump:", initialTypologyData.cfg);
                    const currentVersion = parseConfigVersion(initialTypologyData.cfg);

                    let newMajor = currentVersion.major;
                    let newMinor = 0;
                    let newPatch = 0;

                    if (versionBumpType === 'major') {
                        newMajor += 1;
                        newMinor = 0;
                        newPatch = 0;
                    } else if (versionBumpType === 'minor') {
                        newMinor += 1;
                        newPatch = 0;
                    } else {
                        newPatch += 1;
                    }

                    const newCfg = `${newMajor}.${newMinor}.${newPatch}`;

                    res = await createTypology({
                        ...baseTypologyObj,
                        state: typologyState, // This will be 01_DRAFT for the new version
                        cfg: newCfg,
                    });

                    // Redirect to typology list after successful version bump save
                    router.push(`/typology`);


                } else {
                    // This block handles updates for '01-Draft', '10-Pending Review', '11-Rejected', or '12-Withdrawn'
                    const currentCfg = `${data.major || 0}.${data.minor || 0}.${data.patch || 0}`;

                    res = await updateTypology({
                        ...baseTypologyObj,
                        cfg: currentCfg,
                        // Do NOT send state here, the transition API will handle it separately
                    }, initialTypologyData._key);

                    // Explicitly transition to 01_DRAFT using the transition API
                    // This is the key change to meet the requirement
                    await transitionTypologyState(initialTypologyData._key, StateEnum['01_DRAFT']);

                    // Redirect to typology list after successful draft update
                    router.push(`/typology`);
                }

                if (!res?.data) {
                  instanceLoading.destroy();
                  // notification.error({
                  //   message: 'Error',
                  //   description: 'Save failed: No data returned from server.',
                  //   placement: 'topRight',
                  // });
                  return;
                }
                // The following state updates and notifications might still cause an issue
                // if the redirect hasn't fully taken effect, but typically the page unmounts.
                // Keeping them for now, but if errors persist *after* redirect, they might be candidates.
                const savedTypologyCfg = res.data?.cfg || '0.0.0';
                const { major, minor, patch } = parseConfigVersion(savedTypologyCfg);
                reset({
                    name: res.data.name,
                    description: res.data.desc,
                    major: major,
                    minor: minor,
                    patch: patch,
                });

                const updatedAttachedRules: AttachedRules[] = res.data.rules_rule_configs ? res.data.rules_rule_configs.map(rc => {
                    const fullRule = rules.find(r => r._id === rc.ruleId);
                    if (fullRule) {
                        const updatedConfigs: IRuleConfig[] = rc.ruleConfigId ? rc.ruleConfigId.map(cId => {
                            const fullConfig = fullRule.ruleConfigs?.find(cfg => cfg._id === cId);
                            return fullConfig || { _id: cId, _key: cId.split('/')[1], cfg: 'N/A', name: cId.split('/')[1] || 'Unnamed Config', ruleId: rc.ruleId } as IRuleConfig;
                        }) : [];
                        return { ...fullRule, name: fullRule.name || fullRule._key?.split('/')[1] || 'Unnamed Rule', attachedConfigs: updatedConfigs } as AttachedRules;
                    }
                    console.warn(`Edit.tsx: Rule not found in 'rules' state for ID during update processing: ${rc.ruleId}`);
                    return null;
                }).filter(Boolean) as AttachedRules[] : [];

                setAttachedRules(updatedAttachedRules);
                setEditData({ ...res.data, attachedRules: updatedAttachedRules } as ITypology & { attachedRules: AttachedRules[] });

                instanceLoading.destroy();
                const instanceSuccess = notification.success({ // Changed modal.success to notification.success
                    message: 'Success',
                    description: t('typologyCreatePage.typologyUpdated'),
                    placement: 'topRight' // Added placement for better visibility
                });
                setSaved(true);
                savedJustNowRef.current = true;
                setTimeout(() => { savedJustNowRef.current = false; }, 500);
                setTimeout(() => { instanceSuccess.destroy(); }, 3000); // Notification might not have a destroy, consider duration
            } else { // Create mode
                const currentCfg = `${data.major || 0}.${data.minor || 0}.${data.patch || 0}`;
                res = await createTypology({
                    ...baseTypologyObj,
                    state: typologyState,
                    cfg: currentCfg,
                });
                reset();
                instanceLoading.destroy();
                const instanceSuccess = notification.success({ // Changed modal.success to notification.success
                    message: 'Success',
                    description: t('typologyCreatePage.typologyCreated'),
                    placement: 'topRight' // Added placement for better visibility
                });
                setNodes([...initialNodes]);
                setEdges([...initialEdges]);
                setAttachedRules([]);
                setTimeout(() => { instanceSuccess.destroy(); }, 10000); // Notification might not have a destroy, consider duration
                setSaved(true);
                savedJustNowRef.current = true;
                setTimeout(() => { savedJustNowRef.current = false; }, 500);

                router.push(`/typology`);
            }

        } catch (e: any) {
            instanceLoading.destroy();
            notification.error({ // Changed modal.error to notification.error
                message: 'Error',
                description: e.message || 'Something went wrong during save.',
                placement: 'topRight'
            });
            savedJustNowRef.current = false;
        } finally {
            setSaveLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        const isValid = await trigger();
        if (!isValid) {
            console.error('Form validation failed. Please check inputs.');
            return;
        }

        if (isEditMode) {
            // CORRECTED: Changed state names to match configStateMachine.ts
            const requiresVersionBump = ['20_APPROVED', '30_DEPLOYED', '12_WITHDRAWN', '32_RETIRED', '90_ABANDONED', '91_ARCHIVED'].includes(editData.state);

            if (requiresVersionBump) {
                let versionFormInstance: any;

                modal.confirm({
                    title: 'Choose Version Update Type',
                    content: (
                        <Form layout="vertical" ref={(form) => versionFormInstance = form}>
                            <Form.Item
                                name="versionType"
                                label="Version Type"
                                rules={[{ required: true, message: 'Please select a version type!' }]}
                            >
                                <Select placeholder="Select version type">
                                    <Option value="major">Major</Option>
                                    <Option value="minor">Minor</Option>
                                    <Option value="patch">Patch</Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    ),
                    onOk: async () => {
                        try {
                            const values = await versionFormInstance.validateFields();
                            const selectedVersionBump: 'major' | 'minor' | 'patch' = values.versionType;
                            await save(data, selectedVersionBump);
                        } catch (errorInfo) {
                            console.error('Failed to validate version selection in modal:', errorInfo);
                        }
                    },
                    onCancel: () => {
                    },
                    okText: 'Confirm',
                    cancelText: 'Cancel',
                    // MODIFIED: Added style for blue background and text-white for text color
                    okButtonProps: { style: { backgroundColor: '#1890ff' }, className: 'text-white' }
                });
            } else {
                await save(data);
            }
        } else {
            await save(data);
        }
    };

    // New function to handle cloning
    const onClone = async () => {
        if (!initialTypologyData || !initialTypologyData._key) {
            notification.error({
                message: 'Error',
                description: 'Cannot clone: Original typology data is missing.',
                placement: 'topRight'
            });
            return;
        }

        let versionFormInstance: any; // Ant Design Form instance for modal validation

        modal.confirm({
            title: 'Choose Version for Clone',
            content: (
                <Form layout="vertical" ref={(form) => versionFormInstance = form}>
                    <Form.Item
                        name="versionType"
                        label="New Version Type Increment"
                        rules={[{ required: true, message: 'Please select a version type for the clone!' }]}
                    >
                        <Select placeholder="Select version type to increment">
                            <Option value="major">Major</Option>
                            <Option value="minor">Minor</Option>
                            <Option value="patch">Patch</Option>
                        </Select>
                    </Form.Item>
                </Form>
            ),
            okText: 'Clone',
            cancelText: 'Cancel',
            okButtonProps: { style: { backgroundColor: '#1890ff' }, className: 'text-white' },
            onOk: async () => {
                const instanceLoading = modal.info({
                    title: 'Cloning Typology',
                    content: 'Please wait while the typology is being cloned...',
                    okButtonProps: { style: { display: 'none' } } // Hide OK button during loading
                });
                try {
                    const values = await versionFormInstance.validateFields();
                    const selectedVersionBump: 'major' | 'minor' | 'patch' = values.versionType;

                    const currentVersion = parseConfigVersion(initialTypologyData?.cfg); // Added optional chaining
                    let newMajor = currentVersion.major;
                    let newMinor = 0;
                    let newPatch = 0;

                    if (selectedVersionBump === 'major') {
                        newMajor += 1;
                        newMinor = 0;
                        newPatch = 0;
                    } else if (selectedVersionBump === 'minor') {
                        newMinor += 1;
                        newPatch = 0;
                    } else { // patch
                        newPatch += 1;
                    }

                    const newCfg = `${newMajor}.${newMinor}.${newPatch}`;

                    // Transform attachedRules into rules_rule_configs format for the payload
                    const rulesRuleConfigs = attachedRules.filter(Boolean).map((rule) => {
                        const configIds = rule.attachedConfigs?.filter(Boolean).map(c => c._id) || [];
                        return {
                            ruleId: rule._id,
                            ruleConfigId: configIds
                        };
                    });

                    const clonedTypologyData = {
                        name: initialTypologyData?.name || '', // Provide default empty string
                        desc: initialTypologyData?.desc || '',   // Provide default empty string
                        typologyCategoryUUID: initialTypologyData?.typologyCategoryUUID || [], // Provide default empty array
                        rules_rule_configs: rulesRuleConfigs,
                        state: StateEnum['01_DRAFT'], // Ensure cloned typology is in 01-Draft state
                        cfg: newCfg,
                    };

                    const res = await createTypology(clonedTypologyData);
                    instanceLoading.destroy();
                    notification.success({
                        message: 'Success',
                        description: `Typology cloned successfully!`, // Added optional chaining and default
                        placement: 'topRight'
                    });

                    // Redirect to the typology list page
                    router.push(`/typology`);

                } catch (errorInfo: any) {
                    instanceLoading.destroy();
                    console.error('Failed to clone typology:', errorInfo);
                    notification.error({
                        message: 'Cloning Error', // (6) This matches the user's reported error message
                        description: errorInfo.response?.data?.message || errorInfo.message || 'Something went wrong during cloning.',
                        placement: 'topRight'
                    });
                }
            },
            onCancel: () => {
                // Do nothing on cancel
            }
        });
    };


    // New function to handle state transitions
    const onTransitionState = async (newState: ITypology['state']) => {
        if (!initialTypologyData?._key) {
            notification.error({
                message: 'Error',
                description: 'Cannot transition state: Typology ID is missing.',
                placement: 'topRight'
            });
            return;
        }

        // Optional: Check for unsaved changes before transitioning, if desired
        const changesExist = hasChanged(editData, getValues(), attachedRules);
        if (changesExist) {
            modal.confirm({
                title: 'Unsaved Changes',
                content: 'You have unsaved changes. Please save them before transitioning the typology state.',
                okText: 'Save & Proceed',
                cancelText: 'Cancel',
                okButtonProps: { className: 'bg-green-500 text-white' }, // This one has custom styling
                onOk: async () => {
                    await onSubmit(getValues()); // Attempt to save first
                    if (savedJustNowRef.current) { // Check if save was successful
                        await performTransition(newState);
                    } else {
                        notification.error({
                            message: 'Save Failed',
                            description: 'Please correct errors and save before attempting to transition.',
                            placement: 'topRight'
                        });
                    }
                }
            });
            return;
        }

        await performTransition(newState);
    };

    const performTransition = async (newState: ITypology['state']) => {
        const instanceLoading = modal.info({
            title: `Transitioning to ${newState}`,
            content: t('typologyCreatePage.pleaseWait'),
            okButtonProps: { style: { backgroundColor: 'red' } }
        });
        setTransitionLoading(true);
        try {
            if (!initialTypologyData?._key) {
                throw new Error("Typology ID not available for state transition.");
            }
            await transitionTypologyState(initialTypologyData._key, newState);
            instanceLoading.destroy();
            notification.success({
                message: 'Success',
                description: `Typology successfully transitioned to ${newState}!`,
                placement: 'topRight'
            });
            fetchTypology(); // Re-fetch typology to update UI with new state
        } catch (e: any) {
            instanceLoading.destroy();
            notification.error({
                message: 'Transition Error',
                description: e.response?.data?.message || e.message || 'Something went wrong during state transition.',
                placement: 'topRight'
            });
        } finally {
            setTransitionLoading(false);
        }
    };


    const onConnect = useCallback(
        (params: any) =>
            setEdges((eds) =>
                addEdge({ ...params, animated: false }, eds)
            ),
        [setEdges]
    );

    const onOpenScoreMode = useCallback(() => {
        const changesExist = hasChanged(editData, getValues(), attachedRules);

        if (changesExist) {
            modal.confirm({
                title: 'Save in Drafts',
                content: 'Would you like to save your changes as draft before switching to score view?',
                cancelText: 'Don\'t Save',
                okText: 'Save Changes',
                okButtonProps: { className: 'bg-green-500 text-white' },
                onOk: async () => {
                    await onSubmit(getValues());
                    if (savedJustNowRef.current) {
                        const targetKey = editData?._key || initialTypologyData?._key;
                        if (targetKey) {
                            router.push(`/typology/${targetKey}/score`);
                        }
                    } else {
                        notification.error({ // Changed modal.error to notification.error
                            message: 'Save Failed',
                            description: 'Please correct any errors and save before proceeding to score view.',
                            placement: 'topRight'
                        });
                    }
                },
                onCancel: () => {
                    if (isEditMode && initialTypologyData?._key) {
                        router.push(`/typology/${initialTypologyData._key}/score`);
                    } else {
                        notification.info({ // Changed modal.info to notification.info
                                    message: 'Cannot Proceed',
                                    description: 'Please save the typology first to enter score view.',
                                    placement: 'topRight'
                                });
                    }
                }
            });
        } else {
            if (isEditMode && initialTypologyData?._key) {
                router.push(`/typology/${initialTypologyData._key}/score`);
            } else {
                notification.info({ // Changed modal.info to notification.info
                            message: 'No changes',
                            description: 'No changes have been yet. Please add new changes or save the typology before switching to scoring view',
                            placement: 'topRight'
                        });
            }
        }
    }, [isEditMode, editData, getValues, attachedRules, formState.isDirty, modal, onSubmit, savedJustNowRef, initialTypologyData, router]);


    const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
        if (node.type === 'customNode' && node.data.type === 'rule') {
            setSelectedRuleIndex(node.id);
        }
    }, []);

    const handleDelete = useCallback((id: string, type: string) => {
        setSelectedRuleIndex(null);
        setNodes((prevNodes) => prevNodes.filter((n) => id !== n.id));

        if (type === 'rule') {
            setEdges((prevEdges) => prevEdges.filter((r) => r.source !== id && r.target !== id));
            setNodes((prevNodes) => prevNodes.filter((n: any) => n.id === '1' || n.type === 'rule' || (n?.data?.ruleId) !== id));
            setEdges((prevEdges) => prevEdges.filter((e: any) => e.source !== id && e.target !== id));

            const ruleToRemove = attachedRules.find((r) => r._key === id);
            setAttachedRules((prev) => prev.filter((r) => r._key !== id));

            if (ruleToRemove) {
                const ruleForOptions: IRule = {
                    ...ruleToRemove,
                    name: ruleToRemove.name || ruleToRemove._key?.split('/')[1] || 'Unnamed Rule',
                    ruleConfigs: ruleToRemove.attachedConfigs
                };
                setRuleOptions((prev) => {
                    const ruleExistsInOptions = prev.some((r) => r._key === ruleForOptions._key);
                    return ruleExistsInOptions ? prev : [...prev, ruleForOptions];
                });

                setRemoveRules((prev) => {
                    const existingRemoved = new Set(prev.map(r => r._key));
                    const newRemovedItems: (IRule | IRuleConfig)[] = [];
                    if (!existingRemoved.has(ruleToRemove._key)) {
                        newRemovedItems.push(ruleToRemove);
                    }
                    ruleToRemove.attachedConfigs.forEach(config => {
                        if (!existingRemoved.has(config._key)) {
                            newRemovedItems.push(config);
                        }
                    });
                    return [...prev, ...newRemovedItems];
                });
            }

        } else { // Handle deletion of a config node
            setEdges((prevEdges) => prevEdges.filter((e) => e.target !== id));

            const configToRemove = nodes.find((node) => node.id === id) as Node & { data: IRuleConfig } | undefined;
            if (configToRemove && configToRemove.data.ruleId) {
                setAttachedRules((prevAttached) => {
                    const updatedAttached = prevAttached.map((rule) => {
                        if (rule._key === configToRemove.data.ruleId.split('/')[1]) {
                            return {
                                ...rule,
                                attachedConfigs: rule.attachedConfigs.filter((c) => c._key !== configToRemove.id),
                            };
                        }
                        return rule;
                    });
                    return updatedAttached;
                });

                setRemoveRules((prev) => {
                    const exists = prev.some((r) => r._key === id);
                    return exists ? prev : [...prev, configToRemove.data];
                });
            }
        }
    }, [nodes, rules, attachedRules, edges, setEdges, setNodes, setSelectedRuleIndex, setAttachedRules, setRemoveRules, setRuleOptions]);


    const handleRuleNodeAdded = useCallback((rule: IRule, config: IRuleConfig) => {
        // Add validation
        if (!rule || !rule._id || !rule._key) {
            console.error("Invalid rule object in handleRuleNodeAdded:", rule);
            return;
        }

        // Ensure config is valid
        if (!config || !config._id || !config._key) {
            console.error("Invalid config object in handleRuleNodeAdded:", config);
            return;
        }

        // Rest of your existing logic...
        console.log("Adding rule with ensured name:", {
            ...rule,
            name: rule.name || rule._key?.split('/')[1] || 'Unnamed Rule'
        });

        setRuleOptions(prev => prev.filter(r => r._key !== rule._key));
        setAttachedRules(prev => {
            // Your existing logic with added safety
            const existingIndex = prev.findIndex(r => r._key === rule._key);
            if (existingIndex !== -1) {
                // Clone and update
                const updated = [...prev];
                if (!updated[existingIndex].attachedConfigs.some(c => c._key === config._key)) {
                    updated[existingIndex].attachedConfigs = [...updated[existingIndex].attachedConfigs, config];
                }
                return updated;
            }
            return [...prev, {
                ...rule,
                name: rule.name || rule._key?.split('/')[1] || 'Unnamed Rule',
                attachedConfigs: [config]
            }];
        });
    }, [setRuleOptions, setAttachedRules]);

    const onDrop = useCallback((event: any) => {
        event.preventDefault();
        setRuleDragIndex(null);

        const type = event.dataTransfer.getData('type');
        const data = event.dataTransfer.getData('data');

        console.log("onDrop: STARTED. Dropped item type:", type);
        console.log("onDrop: Dropped item data string:", data);
        console.log("onDrop: Current `rules` state (before find):", rules);

        try {
            if (type === 'rule') {
                const rule: IRule = JSON.parse(data);
                if (attachedRules.find((r) => r._key === rule._key)) {
                    console.warn("onDrop: Rule already on canvas, ignoring drop.");
                    return;
                }

                const ruleLabel = rule.name || rule._key?.split('/')[1] || 'Unnamed Rule';
                console.log("onDrop: Adding rule node. Label:", ruleLabel, "Rule object:", rule);

                const ruleIndex = attachedRules.length;
                const node = {
                    id: rule._key,
                    position: { x: 250, y: 150 + (ruleIndex * 150) },
                    data: {
                        label: ruleLabel,
                        ...rule,
                        type: 'rule',
                        onDelete: handleDelete,
                        showDelete: true
                    },
                    type: 'customNode',
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left
                };

                const edge = {
                    id: `edge-1-${rule._key}`,
                    source: '1',
                    target: rule._key,
                    type: 'smoothstep',
                    animated: false
                };

                setNodes((nds) => [...nds, node]);
                setEdges((eds) => [...eds, edge]);
                setAttachedRules((prev) => [...prev, { ...rule, attachedConfigs: [] }]);
                setRuleOptions((prev) => prev.filter((r) => r._key !== rule._key));

            } else if (type === 'config') {
                const config: IRuleConfig = JSON.parse(data);
                console.log("onDrop: Handling config drop. Config object:", config);
                const rawRuleIdFromConfig = config.ruleId; // This is the GUID from the dragged item
                // FIXED: Explicitly format ruleId to match the "_id" format in the 'rules' state
                const searchRuleId = rawRuleIdFromConfig?.startsWith('rule/') ? rawRuleIdFromConfig : `rule/${rawRuleIdFromConfig}`;
                console.log("onDrop: Searching for rule with formatted ID:", searchRuleId);

                // FIXED: Use the correctly formatted searchRuleId for finding the full rule
                const fullRuleForHandle = rules.find(r => r._id === searchRuleId);
                console.log("onDrop: Result of `rules.find` for config's formatted ruleId:", fullRuleForHandle);

                if (!fullRuleForHandle) {
                     modal.error({
                        title: 'Error Adding Rule/Config',
                        content: 'Could not find the associated rule details for this configuration. Please ensure rules are loaded and try again. If dragging config, drag its parent rule first.',
                     });
                     console.error("onDrop: FAILED to find full rule in `rules` state for config:", searchRuleId);
                     return;
                }

                const parentRuleKey = fullRuleForHandle._key; // Use _key from the found fullRule
                const parentRuleNode = nodes.find((n) => n.id === parentRuleKey && n.data.type === 'rule');
                console.log("onDrop: Parent rule node found on canvas:", parentRuleNode);

                if (parentRuleNode) {
                    const attachedRuleEntry = attachedRules.find((r) => r._key === parentRuleKey);
                    const configIndex = attachedRuleEntry?.attachedConfigs.length || 0;
                    console.log("onDrop: Parent rule found on canvas. Config index for stacking:", configIndex);

                    const ruleName = parentRuleNode.data.label || 'Unnamed Rule';
                    const configLabel = config.cfg || config._key?.split('/')[1] || 'Unnamed Config';

                    const configNode = {
                        id: config._key,
                        position: {
                            x: parentRuleNode.position.x + 300,
                            y: parentRuleNode.position.y + (configIndex * 60)
                        },
                        data: {
                            label: `${ruleName} - ${configLabel}`,
                            ...config,
                            type: 'config',
                            onDelete: handleDelete,
                            showDelete: true
                        },
                        type: 'customNode',
                        sourcePosition: Position.Right,
                        targetPosition: Position.Left
                    };

                    const edge = {
                        id: `edge-${parentRuleNode.id}-${config._key}`,
                        source: parentRuleNode.id,
                        target: config._key,
                        type: 'smoothstep',
                        animated: false
                    };

                    setNodes((nds) => [...nds, configNode]);
                    setEdges((eds) => [...eds, edge]);
                    handleRuleNodeAdded(fullRuleForHandle, config);
                } else {
                    console.log("onDrop: Parent rule node NOT on canvas. Adding both rule and config.");

                    const newRuleLabel = fullRuleForHandle.name || fullRuleForHandle._key?.split('/')[1] || 'Unnamed Rule';
                    const newConfigLabel = config.cfg || config._key?.split('/')[1] || 'Unnamed Config';

                    const newRuleNode = {
                        id: fullRuleForHandle._key,
                        position: { x: 250, y: 150 + (attachedRules.length * 150) },
                        data: {
                            label: newRuleLabel,
                            ...fullRuleForHandle,
                            type: 'rule',
                            onDelete: handleDelete,
                            showDelete: true
                        },
                        type: 'customNode',
                        sourcePosition: Position.Right,
                        targetPosition: Position.Left
                    };

                    const newConfigNode = {
                        id: config._key,
                        position: {
                            x: newRuleNode.position.x + 300,
                            y: newRuleNode.position.y
                        },
                        data: {
                            label: `${newRuleLabel} - ${newConfigLabel}`,
                            ...config,
                            type: 'config',
                            onDelete: handleDelete,
                            showDelete: true
                        },
                        type: 'customNode',
                        sourcePosition: Position.Right,
                        targetPosition: Position.Left
                    };

                    const edge1 = {
                        id: `edge-1-${fullRuleForHandle._key}`,
                        source: '1',
                        target: fullRuleForHandle._key,
                        type: 'smoothstep',
                        animated: false
                    };

                    const edge2 = {
                        id: `edge-${fullRuleForHandle._key}-${config._key}`,
                        source: fullRuleForHandle._key,
                        target: config._key,
                        type: 'smoothstep',
                        animated: false
                      };

                    setNodes((nds) => [...nds, newRuleNode, newConfigNode]);
                    setEdges((eds) => [...eds, edge1, edge2]);
                    handleRuleNodeAdded(fullRuleForHandle, config);
                }
            } else {
                 console.warn("onDrop: Unknown type dropped:", type);
            }
        } catch (error) {
            console.error("onDrop: Error during drop handling:", error, "Raw data:", data);
            modal.error({
                title: 'Drop Error',
                content: `An error occurred while adding the item: ${(error as Error).message}. Check console for details.`,
            });
        } finally {
            console.log("onDrop: FINISHED.");
        }
    }, [attachedRules, rules, nodes, setNodes, setEdges, handleDelete, handleRuleNodeAdded, setRuleDragIndex, modal]);


    useEffect(() => {
        const changesDetected = hasChanged(editData, getValues(), attachedRules);
        if (changesDetected && saved) {
            setSaved(false);
        }
    }, [formState.isDirty, attachedRules, isEditMode, editData, getValues, saved]);

    return (
        <>
            <div className='pr-2' style={{ minHeight: '80vh' }}>
                <div className='flex justify-end w-full mb-2 gap-2'>
                    {isEditMode && initialTypologyData && canTransition(privileges, 'TYPOLOGY', initialTypologyData.state, 'REVIEW') && (
                        <Button disabled={saveLoading || transitionLoading} onClick={onOpenScoreMode}>
                            {t('typologyScorePage.openScoringView')}
                        </Button>
                    )}
                    <Button onClick={onClone}>
                        Clone
                    </Button>
                    <Button loading={saveLoading} onClick={handleSubmit(onSubmit)} className='text-white' style={{ backgroundColor: '#56b453' }}>
                        {t('save')}
                    </Button>
                </div>
                <Row className='h-full w-full'>
                    <Col span={5}>
                        <Rules
                            attachedRules={attachedRules}
                            selectedRule={selectedRule}
                            setSelectedRuleIndex={setSelectedRuleIndex}
                            rules={rules}
                            ruleOptions={ruleOptions}
                            setRuleOptions={setRuleOptions}
                            ruleDragIndex={ruleDragIndex}
                            setRuleDragIndex={setRuleDragIndex}
                            recentlyRemoveRules={removedRules}
                        />
                    </Col>
                    <Col span={14}>
                        <div style={{ height: '100%' }}>
                            <Flow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onConnect={onConnect}
                                onEdgesChange={onEdgesChange}
                                onDrop={onDrop}
                                flowRef={reactFlowWrapper}
                                handleDelete={handleDelete}
                                onNodeClick={onNodeClick}
                            >
                                <MiniMap />
                                <Controls />
                            </Flow>
                        </div>
                    </Col>
                    <Col span={5}>
                        <div className='shadow-md h-full flex flex-col'>
                            <TypologyForm
                                formState={formState}
                                control={control}
                                handleSubmit={handleSubmit}
                                onSubmit={onSubmit}
                                watch={watch}
                                saveLoading={saveLoading}
                                nameInitial={initialTypologyData?.name}
                                descriptionInitial={initialTypologyData?.desc}
                                majorInitial={parseConfigVersion(initialTypologyData?.cfg).major}
                                minorInitial={parseConfigVersion(initialTypologyData?.cfg).minor}
                                patchInitial={parseConfigVersion(initialTypologyData?.cfg).patch}
                            />
                            <TypologyDetails attachedRules={attachedRules} watch={watch} />
                            <RulesAttached rulesAttached={attachedRules} />
                            <RulesConfigurationsAttached rulesAttached={attachedRules} />
                            <Structure rulesAttached={attachedRules} />
                        </div>
                    </Col>
                </Row>
            </div>
            {contextHolder}
        </>
    );
};

export default Edit;