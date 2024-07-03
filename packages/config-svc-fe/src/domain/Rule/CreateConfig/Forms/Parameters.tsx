import { ArrowDownOutlined, ArrowUpOutlined, DeleteFilled, PlusCircleFilled } from "@ant-design/icons"
import { Typography, Input, Select, Form, InputNumber } from "antd"
import React from "react";
import { FunctionComponent } from "react";
import { Controller } from "react-hook-form"
import { useCommonTranslations } from "~/hooks";

interface IProps {
    parameterFields: {
        fields: any[]
        append: any;
        remove: any;
        prepend: any
        insert: any;
    };
    formState: any;
    control: any;
}
export const Parameters: FunctionComponent<IProps> = ({ parameterFields, formState, control }) => {
    const { t } = useCommonTranslations();

    const handlePrepend = React.useCallback((index: number) => {
        if (index === 0) {
            parameterFields.prepend({ ParameterName: '', ParameterType: '', ParameterValue: '' })
        } else {
            parameterFields.insert(index, { ParameterName: '', ParameterType: '', ParameterValue: '' });
        }

    }, [parameterFields.prepend, parameterFields.insert])

    const handleAppend = React.useCallback((index?: number) => {
        if (index === undefined) {
            parameterFields.append({ ParameterName: '', ParameterType: '', ParameterValue: '' })
        } else {
            parameterFields.insert(index + 1, { ParameterName: '', ParameterType: '', ParameterValue: '' });
        }

    }, [parameterFields.append, parameterFields.insert])


    return (
        <Form layout='horizontal'>
            {parameterFields.fields.map((field, index) => (
                <div key={field.id || index}>
                    <div className="flex gap-2 justify-end">
                        <DeleteFilled data-testid="minus-icon" style={{ fontSize: '1.2rem', color: 'red' }} color='red' onClick={() => parameterFields.remove(index)} />

                        <PlusCircleFilled className='my-1'
                            data-testid={`prepend-button-${index}`}
                            onClick={() => handlePrepend(index)}
                            style={{ fontSize: '1.2rem', cursor: 'pointer' }} />
                        <ArrowUpOutlined />

                    </div>
                    <div key={field.id} data-testid="parameter-field" className="border border-gray-400 p-2 rounded-lg my-2">
                        <Typography.Title level={5}>{t('parameter')} {index + 1}</Typography.Title>
                        <Form.Item label={t('createRuleConfigPage.parametersForm.parameterName')}
                            validateStatus={(formState?.errors?.parameters && formState?.errors?.parameters[index]?.ParameterName?.message) ? 'error' : ''}
                            help={(formState?.errors?.parameters && formState?.errors?.parameters[index]?.ParameterName?.message)}
                        >
                            <Controller
                                name={`parameters[${index}].ParameterName` as any}
                                control={control}
                                defaultValue=""
                                render={({ field }) => <Input {...field} data-testid="parameterName-input" placeholder={t('createRuleConfigPage.parametersForm.parameterName')} />}
                            />
                        </Form.Item>

                        <Form.Item
                            label={t('createRuleConfigPage.parametersForm.parameterType')}
                            validateStatus={(formState?.errors?.parameters && formState?.errors?.parameters[index]?.ParameterType?.message) ? 'error' : ''}
                            help={(formState?.errors?.parameters && formState?.errors?.parameters[index]?.ParameterType?.message)}
                            htmlFor='dataType'
                        >
                            <Controller
                                name={`parameters[${index}].ParameterType` as any}
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} placeholder={t('createRuleConfigPage.parametersForm.selectParameterType')}>
                                        {['number', 'string'].map((type) => (
                                            <Select.Option value={type}>
                                                {type.toUpperCase()}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                            />
                        </Form.Item>

                        <Form.Item label={t('createRuleConfigPage.parametersForm.parameterValue')}
                            validateStatus={(formState?.errors?.parameters && formState?.errors?.parameters[index]?.ParameterValue?.message) ? 'error' : ''}
                            help={(formState?.errors?.parameters && formState?.errors?.parameters[index]?.ParameterValue?.message)}
                        >
                            <Controller
                                name={`parameters[${index}].ParameterType` as any}
                                control={control}
                                render={({ field: f }) => <Controller
                                    name={`parameters[${index}].ParameterValue` as any}
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => f?.value === 'number' ? <InputNumber inputMode="numeric" className="w-full" data-testid="parameterName-value" {...field} placeholder={t('createRuleConfigPage.parametersForm.parameterValue')} /> : <Input data-testid="parameterName-value" {...field} placeholder={t('createRuleConfigPage.parametersForm.parameterValue')} />}
                                />}
                            />
                        </Form.Item>
                    </div>
                    <div className='flex justify-end mb-3'>
                        <PlusCircleFilled
                            data-testid={`append-button-${index}`}
                            onClick={() => handleAppend(index)}
                            style={{ fontSize: '1.2rem', cursor: 'pointer' }} />
                        <ArrowDownOutlined />
                    </div>
                </div>
            ))}
            <Typography.Text type='danger'>{formState.errors?.parameters?.message}</Typography.Text>

            {!parameterFields.fields.length ? <Form.Item>
                <PlusCircleFilled className='my-5'
                    data-testid="add-button"
                    onClick={() => parameterFields.append({ ParameterName: '', ParameterType: '', ParameterValue: '' })}
                    style={{ fontSize: '1.5rem', cursor: 'pointer' }} />
            </Form.Item> : null}
        </Form>
    )
}
export default Parameters;