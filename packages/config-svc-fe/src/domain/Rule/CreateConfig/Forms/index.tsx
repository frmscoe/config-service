import { yupResolver } from "@hookform/resolvers/yup";
import { Drawer, Collapse, Typography, Button, Alert, CollapseProps } from "antd";
import { useState, useMemo, Suspense, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as yup from 'yup';

import { useCommonTranslations } from "~/hooks";

import Bands from "./Bands";
import Cases from "./Cases";
import ExitConditions from "./ExitConditions";
import Information from "./Information";
import Parameters from "./Parameters";

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
    conditions: any[];
    setConditions: (conditions: any[]) => void;
    handleClose?: () => void,
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
    conditions,
    setConditions,
    handleClose = () => {},
    ...props

}) => {
    const { t } = useCommonTranslations();
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>('');

    //TODO fix validation when u switch from cases to bands

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
            bandMinimumCondition: yup.number().when(['isBand'], (val) => {
                const[isBand] = val;
                if(isBand) {
                    return yup.number().required()
                }
                return yup.number().optional();

            }),
            bandMaximumCondition: yup.number().when(['isBand'], (val) => {
                const[isBand] = val;
                if(isBand) {
                    return yup.number().required()
                }
                return yup.number().optional();

            }),
            bandMaxReason: yup.string().when(['isBand'], (val) => {
                const[isBand] = val;
                if(isBand) {
                    return yup.string().required()
                }
                return yup.string().optional();

            }),
            conditions: yup.array().of(
                yup.object().shape({
                    reason: yup.string().required(t('createRuleConfigPage.errors.reasonRequired')),
                    outcome: yup.boolean().required(t('createRuleConfigPage.errors.outcomeRequired')),
                })
            ).min(1, t('createRuleConfigPage.errors.minItems', { count: 1 })),
            bands: yup.array().of(
                yup.object().shape({
                    reason: yup.string().required(t('createRuleConfigPage.errors.reasonRequired')),
                    dataType: yup.string().optional(),
                    value: yup.mixed()
                    .when(['dataType', 'upperLimit'], (val: any) => {
                        const [dataType, upperLimit] = val;
                        switch (dataType) {
                            case 'NUMERIC':
                                return yup.number().typeError('Value should be a number').required('Value should be a number').max(yup.ref('upperLimit'), `Cannot be greater than max ${upperLimit}`);
                            case 'CALENDER_DATE_TIME':
                                return yup.number().required('Value should be date');
                            case 'TIME':
                                return yup.number().required('Value should be number');
                            default:
                                return yup.number().required('Value is required');
                        }
                    })
                })
            ).when('isBand', (isBand, schema) => {
                if (isBand[0]) {
                    return schema.min(1, t('createRuleConfigPage.errors.minItems', { count: 1 }))
                }
                return yup.array().notRequired();
            }),
            cases: yup.array().of(
                yup.object().shape({
                    reason: yup.string().required(t('createRuleConfigPage.errors.reasonRequired')),
                    dataType: yup.string().optional(),
                    value: yup.mixed()
                        .when(['dataType'], (val: any) => {
                            const [dataType] = val;
                            switch (dataType) {
                                case 'NUMERIC':
                                    return yup.number().typeError('Value should be a number').required('Value should be a number');
                                case 'CALENDER_DATE_TIME':
                                    return yup.object().required('Value should be date');
                                case 'TIME':
                                    return yup.number().required('Value should be number');
                                default:
                                    return yup.string().required('Value should be a string');
                            }
                        })

                })
            ).when('isCase', (isCase, schema) => {
                if (isCase[0]) {
                    return schema.min(1, t('createRuleConfigPage.errors.minItems', { count: 1 }))
                }
                return yup.array().notRequired();
            }),
            parameters: yup.array().of(
                yup.object().shape({
                    ParameterName: yup.string().required(t('createRuleConfigPage.errors.nameRequired')),
                    ParameterType: yup.string().required(t('createRuleConfigPage.errors.typeRequired')),
                    ParameterValue: yup.string().required(),
                })
            )
        });
    }, [t]);

    const { control, handleSubmit, formState, watch, setValue, reset, getValues,setError } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
        defaultValues: {
            bandMinimumCondition: -99999999999,
            bandMaximumCondition: 99999999999,
            isBand: false,
            isCase: false,
            dataType: 'NUMERIC',
        },
    });

    watch(['isBand', 'isCase', 'dataType', 'cases']);

    const dataType = watch('dataType');

    // Watch for changes in the 'dataType' field
    useEffect(() => {
        const cases = getValues('cases');
        const bands = getValues('bands');
        setValue('cases', (cases ? cases.map((c) => ({ ...c, dataType: dataType, value: null })) : []) as any);
        setValue('bands', (bands ? bands.map((c) => ({ ...c, dataType: dataType, value: null })) : []) as any);
        let defaultMinCondition =  -99999999999;
        let defaultMaxCondition =  99999999999;
        switch (dataType) {
            case 'NUMERIC':
                // Set default values for NUMERIC data type
                defaultMinCondition = -99999999999;
                defaultMaxCondition = 99999999999;
                break;
            case 'CALENDER_DATE_TIME':
                // Set default values for CALENDER_DATE_TIME data type
                defaultMinCondition = new Date('1900-01-01T00:00:00.000Z').getTime();
                defaultMaxCondition = new Date('2099-12-31 23:59:59').getTime();
                break;
            case 'TIME':
                // Set default values for TIME data type
                defaultMinCondition = -99999999999;
                defaultMaxCondition = 99999999999;
                break;
            // Add cases for other data types if needed
            default:
                break;
        }
    
        // Set default values in the form
        setValue('bandMinimumCondition', defaultMinCondition);
        setValue('bandMaximumCondition', defaultMaxCondition);

    }, [dataType]);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if(name === 'isBand' && value.isBand) {
                setSelectedCategory('band');                
            } 
            if(name === 'isCase' && value?.isCase) {
                setSelectedCategory('case');                
            }
            if (!value?.isBand && !value?.isCase) {
                setSelectedCategory('');
            }
        }

        )
        return () => subscription.unsubscribe()
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
        }
    }, [success]);

    const onSubmit = async (data: any) => {
        props.onSubmit(data);
    }
    const onClose = () => {
        setOpen(false);
        handleClose();        
    };
    const onChange = (vals: any) => {
        setActiveKey(vals);

    }

    const items = [
        {
            key: '1',
            label: <Typography.Title type={formState?.errors?.dataType ? 'danger' : 'secondary'} level={5}>{t('createRuleConfigPage.information')}</Typography.Title>,
            children: <Suspense>
                <Information
                    control={control}
                    handleSubmit={handleSubmit}
                    onSubmit={onSubmit}
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
            label: <Typography.Title type={formState.errors?.conditions?.message ? 'danger' : 'secondary'} level={5}>{t('createRuleConfigPage.exitConditions')}</Typography.Title>,
            children: <Suspense>
                <ExitConditions
                    conditions={conditions}
                    setConditions={setConditions}
                />
            </Suspense>

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

    ].filter((item) => item !== null);

    const panels = useMemo(() => {
        return items.filter((item) => item !== null) as CollapseProps['items'];
    }, [items]);

    return (
        <Drawer width={'50%'} title={t('createRuleConfigPage.title')} onClose={onClose} open={open}>
            <div className="h-full flex flex-col justify-between" data-testid="config-form">
                {serverError && <Alert className='mb-2' type="error" message="Error" description={serverError} closable closeIcon />
                }
                {success && <Alert className='mb-2' type="success" message="Success" description={success} closable closeIcon />
                }
                <div className='pb-14'>
                    <Collapse defaultActiveKey={['1']} onChange={onChange} activeKey={activeKeys} items={panels} />
                </div>
                <div className="mt-4 fixed bottom-0 flex w-1/2">
                    <Button type='default' block loading={loading} onClick={handleSubmit(onSubmit)} className='w-1 mb-2 bg-blue-500 text-white'>{t('createRuleConfigPage.save')}</Button>
                    <Button type='default' block loading={loading} onClick={onClose} className='mb-2 bg-red-500 text-white'>{t('createRuleConfigPage.exit')}</Button>
                </div>
            </div>

        </Drawer>
    )
}