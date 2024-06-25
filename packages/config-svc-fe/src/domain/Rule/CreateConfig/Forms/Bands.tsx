import { ArrowDownOutlined, ArrowUpOutlined, DeleteFilled, PlusCircleFilled } from "@ant-design/icons";
import { Input, Typography, Form, Slider, InputNumber, Select, DatePicker } from "antd";
import React from "react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import dayjs from "dayjs";
import { useCommonTranslations } from "~/hooks";
import { changeToEpoch, convertMillisecondsToDHMS } from "~/utils";


interface IProps {
    control: any,
    bandsFields: {
        append: any;
        remove: any;
        fields: any[];
        prepend: any;
        update: any;
        insert: any;
    }
    formState: any;
    getValue: any;
    setValue: any;
    setError: any
}

const Bands: React.FunctionComponent<IProps> = ({ control, bandsFields, formState, getValue, setValue = () => { }, setError = () => {} }) => {
    const { t } = useCommonTranslations();

    const [timeValues, setTimeValues] = useState<{ hours: number; minutes: number; seconds: number, days: number }[]>([]);

    const handleChangeValueField = React.useCallback((val: any, field: any, index: number) => {
            setError(`bands[${index}].value`, undefined);
            if(getValue('dataType') === 'CALENDER_DATE_TIME') {
                const bands = getValue('bands');
                const value: any = val ? new Date(val).getTime() : null;
                if(index === bands?.length - 1) {
                    const max = getValue('bandMaximumCondition');
                    if(value > max) {
                        setError(`bands[${index}].value`, {message: t('createRuleConfigPage.bandForm.maxConditionRangeError') + ` ${new Date(max).toUTCString()}` });
                    } else {
                        field.onChange(value);
                    }
                } else {
                    const nextCondition = bands[index+1];
                    if(val > nextCondition?.value) {
                        setError(`bands[${index}].value`, {message: t('createRuleConfigPage.bandForm.maxConditionRangeError') + ` ${new Date(nextCondition.value).toISOString()}`});
                    } else {
                        field.onChange(value);
                    }
                }
               
            } else {
                field.onChange(val);
            }
    }, [getValue, t])

    const handleBandMaxChange = (val: any) => {
        const bands = getValue('bands');
        const dataType = getValue('dataType');
        if (dataType === 'CALENDER_DATE_TIME') {
            const value: any = val ? new Date(val).getTime() : null;
            setValue(`bandMaximumCondition`, value);
            if (bands.length) {
                let currentUpperLimit = value - 1;
                const lastIndex = bands.length - 1;
                for (let i = lastIndex; i >= 0; i--) {
                    bandsFields.update(i, { ...bands[i], upperLimit: currentUpperLimit });
                    currentUpperLimit = currentUpperLimit - 1;
                }
            }
        } else {
            const value: any = val?.target?.value ? val?.target?.value : val;
            setValue(`bandMaximumCondition`, value);
            if (bands.length) {
                let currentUpperLimit = value - 1;
                const lastIndex = bands.length - 1;
                for (let i = lastIndex; i >= 0; i--) {
                    bandsFields.update(i, { ...bands[i], upperLimit: currentUpperLimit });
                    currentUpperLimit = currentUpperLimit - 1;
                }
            }
        }


    }

    const handleSlide = React.useCallback((index: number, value: number) => {
        const bands = getValue('bands');
        setValue(`bands[${index}].value`, value);
        if(getValue('dataType') === 'TIME') {
            const timeObj = convertMillisecondsToDHMS(value);
            setTimeValues((prevState: any) => {
                const updatedTimeValues = [...prevState];
                updatedTimeValues[index] = {
                    hours: timeObj.hours >= 24 ? 0 : Math.abs(timeObj.hours),
                    days: Math.abs(timeObj.days),
                    minutes: timeObj.minutes >= 60 ? 0 : Math.abs(timeObj.minutes),
                    seconds: timeObj.seconds >= 60 ? 0 : Math.abs(timeObj.seconds),
                };
                return updatedTimeValues;
            });
        }
      
        //handle set epoch time on slide
        if (bands?.length >= 1) {
            const bandsToUpdate = bands.slice(0, index);
            let currentUpperLimit = value - 1;
            const lastIndex = bandsToUpdate.length - 1;
            for (let i = lastIndex; i >= 0; i--) {
                bandsFields.update(i, { ...bandsToUpdate[i], upperLimit: currentUpperLimit });
                currentUpperLimit = currentUpperLimit - 1;
            }
        }
    }, [bandsFields.update, setValue, getValue]);

    const handleTimeChange = (field: string, value: number | null, fieldIndex: number) => {
        let finalValue = value;
        if (field === 'minutes' && (value || 0) > 59) {
            finalValue = 0;
        }
        if (field === 'seconds' && (value || 0) >= 59) {
            finalValue = 0;
        }

        if (field === 'hours' && (value || 0) >= 24) {
            finalValue = 0;
        }

        if (field === 'days') {
            finalValue = value;
        }
        setTimeValues(prevState => {
            const updatedTimeValues = prevState;
            updatedTimeValues[fieldIndex] = {
                ...updatedTimeValues[fieldIndex],
                [field]: finalValue
            };
            return updatedTimeValues;
        });
    };

    const handleRemoveField = (index: number) => {
        const bands = getValue('bands');
        if (!bands.length || index === 0) {
            bandsFields.remove(index);
        } else {
            const bandsToUpdate = bands.slice(0, index);
            let currentLimit = bands[index || 0]?.upperLimit || 0;
            for (let i = index; i >= 0; i--) {
                bandsFields.update(i, { ...bandsToUpdate[i], upperLimit: currentLimit + 1 });
                currentLimit = currentLimit - 1;
            }
            bandsFields.remove(index);
        }
        
        if(getValue('dataType') === 'TIME') {
           
            setTimeValues((prevState: any) => {
                const updatedTimeValues = [...prevState];
                updatedTimeValues[index] = {
                    hours: null,
                    days: null,
                    minutes: null,
                    seconds: null
                };
                return updatedTimeValues;
            });
        }
        bandsFields.remove(index);

    }

    const handleAppend = React.useCallback((index?: number) => {
        const bands = getValue('bands');
        if (index === undefined) {
            //if only no items no need to update any fields
            bandsFields.append({ reason: '', value: null, dataType: getValue('dataType'), upperLimit: getValue('bandMaximumCondition') - 1 });
        } else {
            if (index === bands.length - 1) {
                //if last item in the list
                const lastIndex = bands.length - 1;
                const lastBand = bands[lastIndex];
                bands.forEach((band: any, index: number) => {
                    bandsFields.update(index, { ...band, upperLimit: band.upperLimit - 1 });
                });
                bandsFields.append({ reason: '', value: null, dataType: getValue('dataType'), upperLimit: lastBand.upperLimit });
            } else {
                const bandsToUpdate = bands.slice(0, index + 1);
                bandsFields.insert(index + 1, { reason: '', value: null, dataType: getValue('dataType'), upperLimit: bands[index || 0]?.upperLimit || 0 });
                let currentLimit = bands[index || 0]?.upperLimit || 0;
                for (let i = index; i >= 0; i--) {
                    bandsFields.update(i, { ...bandsToUpdate[i], upperLimit: currentLimit - 1 });
                    currentLimit = currentLimit - 1;
                }

            }


        }
    }, [getValue, bandsFields.append, bandsFields.update])

    const handlePrepend = (index: number) => {
        if (index === 0) {
            //if u add the item at the top of the list
            const upperLimit = getValue(`bands[0].upperLimit`) - 1;
            bandsFields.prepend({ reason: '', value: null, dataType: getValue('dataType'), upperLimit });
        } else {
            const bands = getValue('bands');
            bandsFields.insert(index, { reason: '', value: null, dataType: getValue('dataType'), upperLimit: bands[index || 0]?.upperLimit || 0 });
            const bandsToUpdate = bands.slice(0, index);
            let currentLimit = bands[index || 0]?.upperLimit || 0;
            for (let i = index; i >= 0; i--) {
                bandsFields.update(i, { ...bandsToUpdate[i], upperLimit: currentLimit - 1 });
                currentLimit = currentLimit - 1;
            }

        }

    };


    return (
        <Form layout='horizontal' 
        // labelCol={{ span: 6 }}
        // wrapperCol={{ span: 20 }}
        style={{ textAlign: 'start' }}
        >
            <div className='flex gap-2'>
                <Form.Item label={t('createRuleConfigPage.bandForm.minimum')}
                
                
                >
                    <Controller
                    
                        name={'bandMinimumCondition'}
                        control={control}
                        defaultValue={0}
                        render={({ field }) => <ConditionField dataType={getValue('dataType')} className="w-full" {...field} type='number' placeholder={t('createRuleConfigPage.bandForm.minimum')} />}
                    />
                </Form.Item>

                <Form.Item label={t('createRuleConfigPage.bandForm.maximum')}>
                    <Controller
                        name={'bandMaximumCondition'}
                        control={control}
                        defaultValue={0}
                        render={({ field }) => <ConditionField dataType={getValue('dataType')} data-testid="bandMaximumConditionInput" className="w-full" {...field} type='number' onChange={handleBandMaxChange} placeholder={t('createRuleConfigPage.bandForm.maximum')} />}
                    />
                </Form.Item>
            </div>

            {bandsFields.fields.map((field, index) => (
                <>
                <div className="flex gap-2 justify-end">
                <DeleteFilled data-testid="minus-icon" style={{ fontSize: '1.2rem', color: 'red' }} color='red' onClick={() => handleRemoveField(index)} />

                <PlusCircleFilled className='my-2'
                            data-testid="prepend-button"
                            onClick={() => handlePrepend(index)}
                            style={{ fontSize: '1.2rem', cursor: 'pointer' }} />
                                                        <ArrowUpOutlined/>

                </div>
               
                <div className="border border-gray-400 mt-1 mb-2 grid grid-cols-12 gap-4 p-5">
                    <div key={field.id} data-testid="band-field" className="col-span-11">
                       
                        <Typography.Title level={4}>{t('createRuleConfigPage.bandForm.band')} .0{index + 1}</Typography.Title>

                        <Form.Item label={'UpperLimit'}
                            validateStatus={(formState?.errors?.bands && formState?.errors?.bands[index]?.value?.message) ? 'error' : ''}
                            help={(formState?.errors?.bands && formState?.errors?.bands[index]?.value?.message)}
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}
                            labelAlign="left"
                            className="py-0 my-2"

                        >
                            <Controller
                                name={'bandMaximumCondition'}
                                control={control}
                                render={({ field: max }) => {
                                    const maxLimit = getValue(`bands[${index}].upperLimit`);
                                    return <Controller
                                        name={`bands[${index}].value` as any}
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => <ValueField 
                                            data-testid="value-input" 
                                            max={maxLimit} index={index} 
                                            dataType={getValue('dataType') || 'text'} 
                                            timeValues={timeValues} 
                                            setTimeValues={setTimeValues}
                                            handleTimeChange={handleTimeChange} 
                                            getValue={getValue} 
                                            format="YYYY-MM-DD HH:mm:ss.SSS" 
                                            {...field} 
                                            onChange={(val) => handleChangeValueField(val, field, index)}
                                            />
                                        }
                                    />
                                }}
                            />
                        </Form.Item>
                        <Form.Item label={t('createRuleConfigPage.bandForm.reason')}
                            validateStatus={(formState?.errors?.bands && formState?.errors?.bands[index]?.reason?.message) ? 'error' : ''}
                            help={(formState?.errors?.bands && formState?.errors?.bands[index]?.reason?.message)}
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}
                            labelAlign="left"
                            className="py-0 my-2"
                        >
                            <Controller
                                name={`bands[${index}].reason` as any}
                                control={control}
                                defaultValue=""
                                render={({ field }) => <Input {...field} data-testid="reason-input" placeholder={t('createRuleConfigPage.bandForm.reason')} />}
                            />
                        </Form.Item>

                    </div>
                    {(getValue('dataType') === 'NUMERIC' || getValue('dataType') === 'TIME')  ?<Controller
                        name={'bandMinimumCondition'}
                        control={control}
                        render={({ field: min }) => <Controller
                            name={'bandMaximumCondition'}
                            control={control}
                            render={({ field: max }) => {
                                const maxLimit = getValue(`bands[${index}].upperLimit`);
                                return <Controller
                                    name={`bands[${index}].value` as any}
                                    control={control}
                                    render={({ field: limit }) => <div data-testid={`slider-wrapper-${index}`}>

                                        <Slider
                                        reverse
                                        vertical
                                        value={limit.value || 0}
                                        min={min.value}
                                        max={maxLimit}
                                        onChange={(val) => handleSlide(index, val)} />
                                    </div>
                                    }
                                />
                            }}
                        />}
                    /> : <div/>}

                  
                </div>
                <div className='flex justify-end mb-3'>
                        <PlusCircleFilled 
                            data-testid="append-button"
                            onClick={() => handleAppend(index)}
                            style={{ fontSize: '1.2rem', cursor: 'pointer' }} />
                            <ArrowDownOutlined/>
                    </div>
                </>
            ))}
            <Typography.Text type='danger'>{formState?.errors?.bands?.message}</Typography.Text>
            {bandsFields.fields.length === 0 ? <Form.Item className="flex mt-2 justify-end">
                <PlusCircleFilled className='my-0'
                    data-testid="add-button"
                    onClick={() => handleAppend()}
                    style={{ fontSize: '1.2rem', cursor: 'pointer'}} />
                    <ArrowUpOutlined  style={{ fontSize: '1rem'}}/>

            </Form.Item> : null}
            <div className="border border-gray-400 p-5 mt-1 mb-2">
                <Typography.Title level={4}>Max 0.{bandsFields.fields.length + 1}</Typography.Title>
                <Controller
                    name={'bandMaximumCondition'}
                    control={control}
                    render={({ field }) => <Typography.Paragraph>{t('createRuleConfigPage.bandForm.upperLimit')}
                        {' '} {getValue('dataType') === 'CALENDER_DATE_TIME' ? new Date(field.value).toUTCString() : field?.value}</Typography.Paragraph>}
                />
                <Form.Item label={t('createRuleConfigPage.bandForm.reason')}
                    validateStatus={(formState?.errors?.bands && formState?.errors?.bandMaxReason?.message) ? 'error' : ''}
                    help={(formState?.errors?.bands && formState?.errors?.bandMaxReason?.message)}
                >
                    <Controller
                        name={`bandMaxReason`}
                        control={control}
                        defaultValue=""
                        render={({ field }) => <Input {...field} data-testid="reason-input" placeholder={t('createRuleConfigPage.bandForm.reason')} />}
                    />
                </Form.Item>
            </div>
        </Form>
    )
};

export interface ValueProps {
    dataType: string;
    handleTimeChange: (...args: any) => void;
    timeValues: Array<{ hours: number; minutes: number; seconds: number, days: number }>;
    index: number;
    setTimeValues: any;
    onChange: (val: any) => void;
    max: number;
    value: any;
    getValue: any;
    format?: any;
    min?: number;
}
export const ValueField: React.FunctionComponent<ValueProps> = ({ dataType = 'numeric', handleTimeChange = () => { }, timeValues = [], ...props }) => {
    const { hours = 0, days = 0, minutes = 0, seconds = 0 } = timeValues[props.index] || {};
    const { t } = useCommonTranslations();

    const handleDataTypeChange = (val: string) => {
        if (val === '-') {
            props.onChange(Math.abs(props.value) * -1);
        } else {
            props.onChange(Math.abs(props.value));
        }
    }
    const handleChangeTime = (key: string, val: number) => {
        handleTimeChange(key, val, props.index);
        if (key === 'minutes') {
            const epoch = changeToEpoch(days, hours, (val || 0) >= 59 ? 0 : val, seconds);
            props.onChange(epoch);

        }
        if (key === 'seconds') {
            const epoch = changeToEpoch(days, hours, minutes, (val || 0) >= 59 ? 0 : val);
            props.onChange(epoch);

        }

        if (key === 'hours') {
            const epoch = changeToEpoch(days, (val || 0) >= 24 ? 0 : val, minutes, seconds);
            props.onChange(epoch);
        }

        if (key === 'days') {
            const epoch = changeToEpoch(val, hours, minutes, seconds);
            props.onChange(epoch);
        }

    }
    const handleEpochTimeChange = (time: number) => {
        props.onChange(time);
        const timeObj = convertMillisecondsToDHMS(time);
        props.setTimeValues((prevState: any) => {
            const updatedTimeValues = [...prevState];
            updatedTimeValues[props.index] = {
                hours: timeObj.hours,
                days: timeObj.days,
                minutes: timeObj.minutes,
                seconds: timeObj.seconds
            };
            return updatedTimeValues;
        });

    }

    if (dataType === 'TIME') {
        const formatter = (value: any) => `${value}`.replace(/^(-?)(\d+)((\.\d{0,3})?).*$/, '$1$2$3');
        // To parse the input to number
        const parser = (value: any) => value.replace(/\$\s?|(,*)/g, '');
        return <>
            <InputNumber className="w-full" data-testid="epoch-input" value={props.value} onChange={handleEpochTimeChange as any} />

            <Form layout="vertical" className="flex flex-wrap mt-3 mb-2 w-full"
           
            >
                <Form.Item label="   ">
                    <Select data-testid="data-type" className="w-12" onChange={handleDataTypeChange}>
                        {[{ label: '+ve', value: '+' }, { label: '-ve', value: '-' }].map((sign) => (
                            <Select.Option value={sign.value} >
                                {sign.value}ve
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label={t('createRuleConfigPage.bandForm.days')} className="mx-1">
                    <InputNumber data-testid="days-input"  value={days} onChange={(val) => handleChangeTime('days', val as number)} />
                </Form.Item>
                <Form.Item label={t('createRuleConfigPage.bandForm.hours')}className="mx-1">
                    <InputNumber data-testid="hours-input"  max={24} min={0} value={hours} onChange={(val) => handleChangeTime('hours', val as number)} />
                </Form.Item>
                <Form.Item label={t('createRuleConfigPage.bandForm.minutes')} className="mx-1">
                    <InputNumber data-testid="minutes-input"  max={60} min={0} value={minutes} onChange={(val) => handleChangeTime('minutes', val as number)} />
                </Form.Item>
                <Form.Item label={t('createRuleConfigPage.bandForm.seconds')} className="mx-1">
                    <InputNumber   
                        formatter={formatter}
                        parser={parser} max={60} 
                        data-testid="seconds-input"  
                        min={0} value={seconds} 
                        onChange={(val) => handleChangeTime('seconds', val as number)} />
                </Form.Item>
            </Form>
        </>
    }
    if (dataType === 'NUMERIC' || dataType === 'CURRENCY') {
        return <InputNumber className="w-full"  {...props} />
    }
    if (dataType === 'CALENDER_DATE_TIME') {
        const value = typeof props.value != 'number' ? null : props.value;
        const max = typeof props.max != 'number' ? null : props.max;
        return <DatePicker 
            maxDate={max ? dayjs(max) : undefined} 
            format="YYYY-MM-DD HH:mm" className="w-full" 
            needConfirm={false} 
            showTime={{ format: 'HH:mm:ss.SSS', millisecondStep: 1 }}  
            {...props} 
            value={value ? dayjs(value) : null}
            data-testid="value-input-date" 
        />
    }
    return <InputNumber className="w-full" {...props} />

}

const ConditionField: React.FunctionComponent<any> = ({ dataType, ...props }) => {
    if (dataType === 'CALENDER_DATE_TIME') {
        const max = typeof props.max != 'number' ? null : props.max;
        const value = typeof props.value != 'number' ? null : props.value;
        return <DatePicker maxDate={max ? dayjs(max) : undefined} allowClear={false} className="w-full" needConfirm={false} showTime={{ format: 'HH:mm:ss.SSS', millisecondStep: 1 }}  {...props} value={value ? dayjs(value) : null} format="YYYY-MM-DD HH:mm:ss.SSS" data-testid="value-input-date" />
    }
    return <InputNumber className="w-full"  {...props} />

}
export default Bands