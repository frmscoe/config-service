// <!-- SPDX-License-Identifier: Apache-2.0 -->

import { yupResolver } from "@hookform/resolvers/yup";
import { Drawer, Collapse, Typography, Button, Alert, CollapseProps, Spin } from "antd";
import { useState, useMemo, Suspense, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as yup from 'yup';
import dayjs from 'dayjs';


import { useCommonTranslations } from "~/hooks";
import { getExitConditions, getUserProfile } from "src/domain/Rule/CreateConfig/service";

import Bands from "./Bands";
import Cases from "./Cases";
import ExitConditions from "./ExitConditions";
import Information from "./Information";
import Parameters from "./Parameters";
import RuleDetails from "./RuleDetails";
import AccessDeniedPage from "~/components/common/AccessDenied";
import { useParams, useSearchParams } from "next/navigation";
import { postRuleConfig } from "../service";
import usePrivileges from "~/hooks/usePrivileges";
// import { DEFAULT_EXIT_CONDITIONS } from "~/constants";


interface FormProps {
    open: boolean;
    setOpen(val: boolean): void;
    onSubmit(data: any): void
    loading: boolean;
    setLoading: (val: boolean) => void,
    success: string;
    serverError: string;
    activeKeys: string[];
    setActiveKey: (keys: string[]) => void;
    handleClose?: () => void,
    rule: {
        name: string;
        desc: string;
        ownerId: string;
        updatedBy: string;
        updatedAt: string;
        state: string;
        dependencies?: string[];
        cfg: string;
        dataType: string;
        approverId: string;
        createdAt: string;
    } | null;
}


export const ConfigForm: React.FunctionComponent<FormProps> = ({
    open,
    setOpen,
    loading,
    setLoading,
    serverError,
    success,
    activeKeys,
    setActiveKey,
    handleClose = () => { },
    onSubmit,
    ...props

}) => {
    const { rule } = props;
    const { t } = useCommonTranslations();
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>('');

    const [availableExitConditionsForDisplay, setAvailableExitConditionsForDisplay] = useState<any[]>([]);
    const [systemDefaults, setSystemDefaults] = useState<any[]>([]);
    const [userPersonalDefaults, setUserPersonalDefaults] = useState<any[]>([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [dataError, setDataError] = useState<string | null>(null);

    // Fetch exit conditions on component mount
    useEffect(() => {
        const fetchConditions = async () => {
            setDataLoading(true);
            setDataError(null);
            try {
                const fetchedConditions = await getExitConditions();
                setAvailableExitConditionsForDisplay(fetchedConditions);
                // System defaults are typically static or fetched from a specific endpoint.
                // For now, we'll assume a subset or all fetched conditions can be system defaults.
                // If your API provides explicit 'isSystemDefault' flag, filter by that.
                setSystemDefaults(fetchedConditions.filter((cond: any) => cond.isSystemDefault));

                const userProfile = await getUserProfile();
                if (userProfile && userProfile.personalExitConditions) {
                    setUserPersonalDefaults(userProfile.personalExitConditions);
                } else {
                    // Filter fetched conditions to include only those marked as user defaults
                    // This assumes getUserProfile doesn't directly return them, but they're part of all conditions
                    // Adjust this logic based on your actual API response structure for user defaults
                    setUserPersonalDefaults(fetchedConditions.filter((cond: any) => cond.isUserDefault));
                }

                console.log("ConfigForm: Fetched availableExitConditionsForDisplay:", fetchedConditions);
                console.log("ConfigForm: Set systemDefaults:", systemDefaults); // This log will show previous state due to closure, updated state available on next render
                console.log("ConfigForm: Set userPersonalDefaults:", userPersonalDefaults); // Same here
            } catch (error: any) {
                console.error("ConfigForm: Failed to fetch exit conditions:", error);
                setDataError(error?.response?.data?.message || error?.message || 'Failed to load exit conditions.');
            } finally {
                setDataLoading(false);
            }
        };
        fetchConditions();
    }, []);


    const schema = useMemo(() => {
        return yup.object().shape({
            major: yup.number().required(t('createRulePage.errors.majorRequired')),
            minor: yup.number().required(t('createRuleConfigPage.errors.minorRequired')),
            patch: yup.number().required(t('createRuleConfigPage.errors.patchRequired')),
            isBand: yup.boolean().required(t('createRuleConfigPage.errors.bandRequired')),
            isCase: yup.boolean().required(t('createRuleConfigPage.errors.caseRequired')),
            category: yup.string().required(t('createRuleConfigPage.errors.categoryRequired')),
            description: yup.string().required(t('createRuleConfigPage.errors.reasonRequired')),
            dataType: yup.string().required(t('createRuleConfigPage.errors.dataTypeRequired')),
            bandMinimumCondition: yup.number().when(['isBand'], (val: [boolean]) => {
                const [isBand] = val;
                if (isBand) {
                    return yup.number().required(t('createRuleConfigPage.errors.bandMinRequired'));
                }
                return yup.number().optional();
            }),
            bandMaximumCondition: yup.number().when(['isBand'], (val: [boolean]) => {
                const [isBand] = val;
                if (isBand) {
                    return yup.number().required(t('createRuleConfigPage.errors.bandMaxRequired'));
                }
                return yup.number().optional();
            }),
            bandMaxReason: yup.string().when(['isBand'], (val: [boolean]) => {
                const [isBand] = val;
                if (isBand) {
                    return yup.string().required(t('createRuleConfigPage.errors.bandMaxReasonRequired'));
                }
                return yup.string().optional();
            }),
            // Updated schema for exitConditions to expect id and reason
            // exitConditions: yup.array().of(
            //     yup.object().shape({
            //         id: yup.string().required(t('createRuleConfigPage.errors.idRequired') || 'ID is required'), // ID is now expected and required
            //         reason: yup.string().required(t('createRuleConfigPage.errors.reasonRequired')),
            //         // 'outcome' field removed as per user's request to send only id and reason
            //     })
            // ).min(1, t('createRuleConfigPage.errors.minItems', { count: 1 })),
            exitConditions: yup.array().of(
              yup.object().shape({
                id: yup.string().required(t('createRuleConfigPage.errors.idRequired') || 'ID is required'),
                reason: yup.string().required(t('createRuleConfigPage.errors.reasonRequired')),
              })
            ).optional(),

            bands: yup.array().of(
                yup.object().shape({
                    reason: yup.string().required(t('createRuleConfigPage.errors.reasonRequired')),
                    dataType: yup.string().optional(),
                    value: yup.mixed()
                        .when(['dataType', 'upperLimit'], (val: [string, number]) => {
                            const [dataType, upperLimit] = val;
                            switch (dataType) {
                                case 'NUMERIC':
                                    return yup.number().typeError(t('createRuleConfigPage.errors.valueNumber')).required(t('createRuleConfigPage.errors.valueRequired'))
                                        .max(yup.ref('upperLimit'), `${t('createRuleConfigPage.errors.cannotBeGreaterThanMax')} ${upperLimit}`);
                                case 'CALENDER_DATE_TIME':
                                    return yup.number().required(t('createRuleConfigPage.errors.valueDate'));
                                case 'TIME':
                                    return yup.number().required(t('createRuleConfigPage.errors.valueNumber'));
                                default:
                                    return yup.number().required(t('createRuleConfigPage.errors.valueRequired'));
                            }
                        })
                })
            ).when('isBand', (isBand, schema) => {
                if (isBand[0]) {
                    return schema.min(1, t('createRuleConfigPage.errors.minItems', { count: 1 }));
                }
                return yup.array().notRequired();
            }),
            cases: yup.array().of(
                yup.object().shape({
                    reason: yup.string().required(t('createRuleConfigPage.errors.reasonRequired')),
                    dataType: yup.string().optional(),
                    value: yup.mixed()
                        .when(['dataType'], (val: [string]) => {
                            const [dataType] = val;
                            switch (dataType) {
                                case 'NUMERIC':
                                    return yup.number().typeError(t('createRuleConfigPage.errors.valueNumber')).required(t('createRuleConfigPage.errors.valueNumber'));
                                case 'CALENDER_DATE_TIME':
                                    return yup.object().required(t('createRuleConfigPage.errors.valueDate'));
                                case 'TIME':
                                    return yup.number().required(t('createRuleConfigPage.errors.valueNumber'));
                                default:
                                    return yup.string().required(t('createRuleConfigPage.errors.valueString'));
                            }
                        }),
                    subRuleRef: yup.string().required(t('createRuleConfigPage.errors.subRuleRefRequired'))

                })
            ).when('isCase', (isCase, schema) => {
                if (isCase[0]) {
                    return schema.min(1, t('createRuleConfigPage.errors.minItems', { count: 1 }));
                }
                return yup.array().notRequired();
            }),
            parameters: yup.array().of(
                yup.object().shape({
                    ParameterName: yup.string().required(t('createRuleConfigPage.errors.nameRequired')),
                    ParameterType: yup.string().required(t('createRuleConfigPage.errors.typeRequired')),
                    ParameterValue: yup.string().required(t('createRuleConfigPage.errors.valueRequired')),
                })
            )
        });
    }, [t]);

    const { control, handleSubmit, formState, watch, setValue, reset, getValues, setError } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
        defaultValues: {
            bandMinimumCondition: -99999999999,
            bandMaximumCondition: 99999999999,
            isBand: false,
            isCase: false,
            dataType: 'NUMERIC',
            // Initialize arrays for fields
            exitConditions: [], // Ensure this matches the schema name
            bands: [],
            cases: [],
            parameters: [],
        },
    });

    // LOG: Log formState errors whenever they change
    useEffect(() => {
        if (formState.errors && Object.keys(formState.errors).length > 0) {
            console.error("ConfigForm: React Hook Form Errors:", formState.errors);
        } else {
            console.log("ConfigForm: No React Hook Form errors.");
        }
    }, [formState.errors]);

    watch(['isBand', 'isCase', 'dataType', 'cases']);

    const dataType = watch('dataType');

    useEffect(() => {
        const cases = getValues('cases');
        const bands = getValues('bands');

        setValue('cases', (cases ? cases.map((c: any) => ({ ...c, dataType: dataType, value: null })) : []) as any);
        setValue('bands', (bands ? bands.map((c: any) => ({ ...c, dataType: dataType, value: null })) : []) as any);

        let defaultMinCondition: number | Date = -99999999999;
        let defaultMaxCondition: number | Date = 99999999999;

        switch (dataType) {
            case 'NUMERIC':
            case 'CURRENCY':
                defaultMinCondition = -99999999999;
                defaultMaxCondition = 99999999999;
                break;
            case 'CALENDER_DATE_TIME':
                defaultMinCondition = new Date('1900-01-01T00:00:00.000Z').getTime();
                defaultMaxCondition = new Date('2099-12-31T23:59:59.000Z').getTime();
                break;
            case 'TIME':
                defaultMinCondition = 0;
                defaultMaxCondition = 24 * 60 * 60 * 1000 - 1;
                break;
            default:
                break;
        }

        setValue('bandMinimumCondition', defaultMinCondition);
        setValue('bandMaximumCondition', defaultMaxCondition);

    }, [dataType, getValues, setValue]);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === 'isBand' && value.isBand) {
                setSelectedCategory('band');
            }
            if (name === 'isCase' && value?.isCase) {
                setSelectedCategory('case');
            }
            if (!value?.isBand && !value?.isCase) {
                setSelectedCategory('');
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const bandsFields = useFieldArray({
        control,
        name: 'bands',
    });

    const caseFields = useFieldArray({
        control,
        name: 'cases',
    });

    const parameterFields = useFieldArray({
        control,
        name: 'parameters',
    });

    useEffect(() => {
        if (success) {
            reset();
            parameterFields.replace([]);
            bandsFields.replace([]);
            caseFields.replace([]);
            console.log("ConfigForm: Form reset due to success.");
        }
    }, [success, reset, parameterFields, bandsFields, caseFields]);

    const handleFormSubmission = async (data: any) => {
        console.log("ConfigForm: Submitting Data:", data);
        // data.exitConditions will already be in the format {id, reason} from ExitConditions.tsx
        // If your backend expects a different format or additional fields, map them here.
        // For example, if 'outcome' is still needed for the API but not in the form:
        // const exitConditionsForAPI = data.exitConditions.map((cond: any) => ({ ...cond, outcome: true }));

        const obj = {
            // ... (other fields)
            exitConditions: data.exitConditions || [], // This will already be {id, reason} as set by ExitConditions component
            // ...
            major: data.major,
            minor: data.minor,
            patch: data.patch,
            isBand: data.isBand,
            isCase: data.isCase,
            category: data.category,
            description: data.description,
            dataType: data.dataType,
            bandMinimumCondition: data.bandMinimumCondition,
            bandMaximumCondition: data.bandMaximumCondition,
            bandMaxReason: data.bandMaxReason,
            bands: data.bands ? data.bands.map((cs: any, index: number) => {
                if (cs.dataType === 'CALENDER_DATE_TIME') {
                    return {
                        subRuleRef: `0.${index + 1}`,
                        reason: cs.reason,
                        value: cs.value ? new Date(cs.value).toISOString() : cs.value,
                    }
                }
                return {
                    subRuleRef: `0.${index + 1}`,
                    reason: cs.reason,
                    value: cs.value,
                }
            }) : [],
            cases: data.cases ? data.cases.map((cs: any, index: number) => {
                if (cs.dataType === 'CALENDER_DATE_TIME') {
                    return {
                        subRuleRef: `0.${index + 1}`,
                        reason: cs.reason,
                        value: cs.value ? new Date(cs.value).toISOString() : cs.value,
                    }
                }
                return {
                    subRuleRef: `0.${index + 1}`,
                    reason: cs.reason,
                    value: cs.value,
                }
            }) : [],
            parameters: data.parameters || [],
        };
        onSubmit(obj); // Pass the transformed data to the parent onSubmit
    };

    const onClose = () => {
        if (formState.isDirty) {
            const confirmExit = window.confirm("You have unsaved changes. Are you sure you want to exit?");
            if (!confirmExit) return;
        }

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        document.querySelectorAll('.ant-select-dropdown, .ant-picker-dropdown').forEach((el) => {
            (el as HTMLElement).style.display = 'none';
        });

        reset();
        parameterFields.replace([]);
        bandsFields.replace([]);
        caseFields.replace([]);
        console.log("ConfigForm: Form closed and reset.");

        setOpen(false);
        handleClose();
    };

    const onChange = (vals: string | string[]) => {
        setActiveKey(Array.isArray(vals) ? vals : [vals]);
        console.log("ConfigForm: Collapse active keys changed to:", activeKeys);
    };

    const items: CollapseProps['items'] = [
        {
            key: '0',
            label: <Typography.Title level={5}>{t('createRuleConfigPage.ruleDetails')}</Typography.Title>,
            children: (
                <Suspense fallback={null}>
                    {rule && (
                        <RuleDetails
                            rule={{
                                name: rule.name,
                                description: rule.desc,
                                cfg: rule.cfg,
                                dataType: rule.dataType,
                                createdBy: rule.ownerId,
                                modifiedBy: rule.updatedBy,
                                approvedBy: rule.approverId,
                                createdAt: dayjs(rule.createdAt).format('YYYY-MM-DD HH:mm'),
                                updatedAt: dayjs(rule.updatedAt).format('YYYY-MM-DD HH:mm'),
                                dependencies: rule.dependencies || [],
                                status: rule.state.replace('01_', '').toLowerCase(),
                            }}
                        />
                    )}
                </Suspense>
            )
        },
        {
            key: '1',
            label: <Typography.Title type={formState?.errors?.dataType ? 'danger' : 'secondary'} level={5}>{t('createRuleConfigPage.information')}</Typography.Title>,
            children: <Suspense>
                <Information
                    control={control}
                    handleSubmit={handleSubmit}
                    onSubmit={handleFormSubmission}
                    formState={formState}
                    setValue={setValue}
                />
            </Suspense>
        },
        {
            key: '2',
            label: <Typography.Title level={5} type={formState.errors?.parameters?.message ? 'danger' : 'secondary'} >{t('createRuleConfigPage.parameters')}</Typography.Title>,
            children: <Suspense>
                <Parameters
                    formState={formState}
                    parameterFields={parameterFields}
                    control={control}
                />
            </Suspense>
        },
        {
            key: '3',
            label: <Typography.Title type={formState.errors?.exitConditions?.message ? 'danger' : 'secondary'} level={5}>{t('createRuleConfigPage.exitConditions')}</Typography.Title>,
            children: (
                <Suspense fallback={<Spin size="small" />}>
                    {dataError ? (
                        <Alert message="Error" description={dataError} type="error" showIcon />
                    ) : (
                        <ExitConditions
                            control={control}
                            setValue={setValue}
                            availableExitConditionsForDisplay={availableExitConditionsForDisplay}
                            systemDefaults={systemDefaults}
                            userPersonalDefaults={userPersonalDefaults}
                        />
                    )}
                </Suspense>
            )
        },
        !selectedCategory ? null : selectedCategory === 'band' ? {
            key: '4',
            label: <Typography.Title type={formState.errors?.bands?.message ? 'danger' : 'secondary'} level={5}>{t('createRuleConfigPage.band')}</Typography.Title>,
            children: <Suspense>
                <Bands
                    bandsFields={bandsFields}
                    formState={formState}
                    control={control}
                    getValue={getValues}
                    setValue={setValue}
                    setError={setError}
                />
            </Suspense>
        } : {
            key: '5',
            label: <Typography.Title level={5} type={formState.errors?.cases?.message ? 'danger' : 'secondary'} >{t('createRuleConfigPage.cases')}</Typography.Title>,
            children: <Suspense>
                <Cases
                    caseFields={caseFields}
                    formState={formState}
                    control={control}
                    getValue={getValues}
                />
            </Suspense>
        }

    ].filter((item) => item !== null) as CollapseProps['items'];

    const panels = useMemo(() => {
        return items.filter((item) => item !== null) as CollapseProps['items'];
    }, [items]);

    const { canCreateRuleConfig } = usePrivileges();
    // if (!canCreateRuleConfig) {
    //     console.warn("ConfigForm: User does not have privileges to create rule config.");
    //     return <AccessDeniedPage />;
    // }

    if (dataLoading) {
        console.log("ConfigForm: Data is loading...");
        return (
            <Drawer width={'50%'} title={t('createRuleConfigPage.title')} onClose={onClose} open={open}>
                <div className="flex items-center justify-center h-full">
                    <Spin size="large" />
                </div>
            </Drawer>
        );
    }

    if (dataError) {
        console.error("ConfigForm: Data loading error:", dataError);
        return (
            <Drawer width={'50%'} title={t('createRuleConfigPage.title')} onClose={onClose} open={open}>
                <div className="flex items-center justify-center h-full">
                    <Alert
                        message="Error loading form"
                        description={dataError}
                        type="error"
                        showIcon
                    />
                </div>
            </Drawer>
        );
    }

    console.log("ConfigForm: Component rendering successfully.");
    return (
        <Drawer width={'50%'} title={t('createRuleConfigPage.title')} onClose={onClose} open={open}>
            <div className="h-full flex flex-col justify-between" data-testid="config-form">
                {serverError && <Alert className='mb-2' type="error" message="Error" description={serverError} closable closeIcon />
                }
                {success && <Alert className='mb-2' type="success" message="Success" description={success} closable closeIcon />
                }
                <div className='pb-14'>
                    <Collapse defaultActiveKey={['1']} onChange={onChange} activeKey={activeKeys} items={panels} accordion={true} />
                </div>
                <div className="mt-4 fixed bottom-0 flex w-1/2">
                    <Button type='default' block loading={loading} onClick={handleSubmit(handleFormSubmission)} className='w-1 mb-2 bg-blue-500 text-white'>{t('createRuleConfigPage.save')}</Button>
                    <Button type='default' block loading={loading} onClick={onClose} className='mb-2 bg-red-500 text-white'>{t('createRuleConfigPage.exit')}</Button>
                </div>
            </div>
        </Drawer>
    );
};