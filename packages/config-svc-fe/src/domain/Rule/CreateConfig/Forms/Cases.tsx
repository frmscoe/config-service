import { ArrowDownOutlined, ArrowUpOutlined, DeleteFilled, PlusCircleFilled } from "@ant-design/icons";
import { Input, Typography, Form, InputNumber, DatePicker, Select } from "antd";
import React from "react";
import { useCallback, useState } from "react";
import { Controller } from "react-hook-form";
import { useCommonTranslations } from "~/hooks";
import { changeToEpoch, convertMillisecondsToDHMS } from "~/utils";

interface IProps {
    control: any,
    caseFields: {
        append: any;
        remove: any;
        fields: any[];
        move: any;
        prepend: any;
        insert: any
    }
    formState: any;
    getValue: any;
}
const Cases: React.FunctionComponent<IProps> = ({ control, caseFields, formState, getValue }) => {
    const { t } = useCommonTranslations();
    const [draggedIndex, setDraggedIndex] = useState(null);

    const onDragStart = (e: any, index: any) => {
        e?.dataTransfer?.setData("index", index);
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e?.dataTransfer?.setData('text/plain', index);
    };

    const onDragOver = (e: any) => {
        e.preventDefault();
    };

    const onDrop = (e: any, newIndex: any) => {
        const oldIndex = parseInt(e.dataTransfer.getData("index"));
        const draggedField = caseFields.fields[oldIndex];
        const updatedFields = [...caseFields.fields];
        updatedFields.splice(oldIndex, 1);
        updatedFields.splice(newIndex, 0, draggedField);
        caseFields.move(oldIndex, newIndex);
        setDraggedIndex(null);

    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handlePrepend = React.useCallback((index: number) => {
        if (index === 0) {
            caseFields.prepend({ reason: '', value: null, dataType: getValue('dataType')})
        } else {
            caseFields.insert(index - 1, { reason: '', value: null, dataType: getValue('dataType')});
        }

    }, [caseFields.prepend, getValue, caseFields.insert])

    const handleAppend = React.useCallback((index?: number) => {
        if (index === undefined) {
            caseFields.append({ reason: '', value: null, dataType: getValue('dataType') })
        } else {
            caseFields.insert(index + 1, { reason: '', value: null, dataType: getValue('dataType') });
        }

    }, [caseFields.append, getValue, caseFields.insert])

    return (
        <Form layout='horizontal'
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 20 }}
        style={{ textAlign: 'start' }}
        >

            {caseFields.fields.map((field, index) => (
                <>
                 <div className="flex gap-2 justify-end">
                <DeleteFilled data-testid="minus-icon" style={{ fontSize: '1.2rem', color: 'red' }} color='red' onClick={() => caseFields.remove(index)} />

                <PlusCircleFilled className='my-1'
                            data-testid="prepend-button"
                            onClick={() => handlePrepend(index)}
                            style={{ fontSize: '1.2rem', cursor: 'pointer' }} />
                                                        <ArrowUpOutlined/>

                </div>
                <div key={field.id}
                    data-testid="case-field"
                    style={{
                        marginBottom: '10px',
                        padding: '2rem',
                        cursor: 'move',
                        backgroundColor: draggedIndex === index ? '#f0f0f0' : 'white',
                    }}
                    draggable
                    onDragStart={(e) => onDragStart(e, index)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className="border border-gray-400 p-0 mt-1 mb-2">
                    <Typography.Title level={4}>{t('createRuleConfigPage.caseForm.case')} .0{index + 1} </Typography.Title>
         
                    <Controller
                        name={`cases[${index}].value` as any}
                        control={control}
                        defaultValue=""
                        render={({ field }) => <Form.Item
                            label="Value"
                            className="py-0 mb-2"
                            labelAlign="left"
                            validateStatus={(formState?.errors?.cases && formState?.errors?.cases[index]?.value?.message) ? 'error' : ''}
                            help={(formState?.errors?.cases && formState?.errors?.cases[index]?.value?.message)}
                        >
                            <ValueField className="w-full" dataType={getValue('dataType') || 'text'} {...field} data-testid="value-input" placeholder={t('createRuleConfigPage.caseForm.value')} />
                        </Form.Item>}
                    />
                    <Form.Item label={t('createRuleConfigPage.caseForm.reason')}
                        validateStatus={(formState?.errors?.cases && formState?.errors?.cases[index]?.reason?.message) ? 'error' : ''}
                        help={(formState?.errors?.cases && formState?.errors?.cases[index]?.reason?.message)}
                        className="py-0 mb-2"
                        labelAlign="left"
                    >
                        <Controller
                            name={`cases[${index}].reason` as any}
                            control={control}
                            defaultValue=""
                            render={({ field }) => <Input {...field} data-testid="reason-input" placeholder={t('createRuleConfigPage.caseForm.reason')} />}
                        />
                    </Form.Item>
                   
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
            <Typography.Text type='danger'>{formState?.errors?.cases?.message}</Typography.Text>

            {caseFields.fields.length === 0 ? <Form.Item>
                <PlusCircleFilled className='flex mt-2'
                    data-testid="add-new-button"
                    onClick={() => handleAppend()}
                    style={{ fontSize: '1.3rem', cursor: 'pointer' }} />
            </Form.Item> : null}
        </Form>
    )
};


export const ValueField = ({ dataType = 'numeric', ...props }) => {
    const { t } = useCommonTranslations();
    const [dateType, setDateType] = useState('+');
    const [days, setDays] = useState<number | null>(null);
    const [hours, setHours] = useState<number | null>(null);
    const [minutes, setMinutes] = useState<number | null>(null);
    const [seconds, setSeconds] = useState<number | null>(null);
    const [epochTime, setEpochTime] = useState<number | null>(props.value || 0);

    const convertEpochTime = useCallback((time: number) => {
        return convertMillisecondsToDHMS(time);
    }, []);

    const handleEpochTimeChange = (time: number | null) => {
        setEpochTime(time);
        const timeObj = convertEpochTime(time as number);
        setHours(timeObj.hours <= 0 ? Math.abs(timeObj.hours) : timeObj.hours);
        setMinutes(timeObj.minutes <= 0 ? Math.abs(timeObj.minutes) : timeObj.minutes);
        setDays(timeObj.days <= 0 ? Math.abs(timeObj.days) : timeObj.days);
        setSeconds(timeObj.seconds <= 0 ? Math.abs(timeObj.seconds) : timeObj.seconds);
        props.onChange(time);
    }

    const handleDataTypeChange = (value: string) => {
        setDateType(value);
        if (value === '-') {
            props.onChange(-(epochTime || 0));
        } else {
            props.onChange(+(epochTime || 0));
        }
    };

    const handleDaysChange = (value: number | null) => {
        setDays(value);
        const time = changeToEpoch(value || 0, hours || 0, minutes || 0, seconds || 0);
        props.onChange(time);

    };

    const handleHoursChange = (value: number | null) => {
        if (value === 24) {
            // If hours reach 24, reset it to 0
            setHours(0);
        } else {
            setHours(value);
            const time = changeToEpoch(days || 0, (value || 0) >= 24 ? 0 : value || 0, minutes || 0, seconds || 0);
            props.onChange(time);
        }
    };

    const handleMinutesChange = (value: number | null) => {
        if (value === 60) {
            // If minutes reach 59, reset it to 0
            setMinutes(0);
        } else {
            setMinutes(value);
            const time = changeToEpoch(days || 0, hours || 0, (value || 0) >= 60 ? 0 : value || 0, seconds || 0);
            props.onChange(time);

        }
    };

    const handleSecondsChange = (value: number | null) => {
        if (value === 60) {
            // If seconds reach 59, reset it to 0
            setSeconds(0);
        } else {
            setSeconds(value);
            const time = changeToEpoch(days || 0, hours || 0, minutes || 0, (value || 0) >= 60 ? 0 : value || 0);
            props.onChange(time);

        }
    };


    if (dataType === 'NUMERIC' || dataType === 'CURRENCY') {
        return <InputNumber  {...props} />
    }

    if (dataType === 'CALENDER_DATE_TIME') {
        const value = typeof props.value != 'object' ? null : props.value;
        return <DatePicker needConfirm={false} showTime  {...props} value={value} format={(value) => {
            if (!value) {
                return '';
            }
            return value.toISOString();
        }} data-testid="value-input-date" />
    }

    if (dataType === 'TIME') {
        return (
            <>
                <InputNumber className="w-full mb-1" data-testid="epoch-input" value={props.value} onChange={handleEpochTimeChange} />

                <Form layout="vertical" className="grid-cols-5 grid gap-3  mb-2" 
                 style={{ textAlign: 'start' }}
                >
                    <Form.Item label="   "
                    
                    >
                        <Select data-testid="data-type" className="w-1/4" onChange={handleDataTypeChange}>
                            {[{ label: '+ve', value: '+' }, { label: '-ve', value: '-' }].map((sign,i) => (
                                <Select.Option key={i} value={sign.value} >
                                    {sign.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label={t('createRuleConfigPage.caseForm.days')}>
                        <InputNumber data-testid="days-input" min={0} value={days} onChange={handleDaysChange} />
                    </Form.Item>
                    <Form.Item label={t('createRuleConfigPage.caseForm.hours')}>
                        <InputNumber data-testid="hours-input" max={24} min={0} value={hours} onChange={handleHoursChange} />
                    </Form.Item>
                    <Form.Item label={t('createRuleConfigPage.caseForm.minutes')}>
                        <InputNumber data-testid="minutes-input" max={60} min={0} value={minutes} onChange={handleMinutesChange} />
                    </Form.Item>
                    <Form.Item label={t('createRuleConfigPage.caseForm.seconds')}>
                        <InputNumber max={60} data-testid="seconds-input" min={0} value={seconds} onChange={handleSecondsChange} />
                    </Form.Item>

                </Form>
            </>)
    }
    return <Input {...props} />
}

export default Cases