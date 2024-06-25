import { Checkbox, Form, Input, Select } from "antd";
import { Controller } from "react-hook-form";
import { RULE_DATA_TYPES } from "~/constants";
import { useCommonTranslations } from "~/hooks";

interface IProps {
    formState: any,
    handleSubmit: any,
    onSubmit: any,
    control: any,
    setValue: any,
}

export const Information: React.FunctionComponent<IProps> = ({ formState, handleSubmit, onSubmit, control, setValue }) => {
    const { t } = useCommonTranslations();
    return (
        <Form layout="horizontal" onFinish={handleSubmit(onSubmit)}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 20 }}
        style={{ textAlign: 'start' }} 

        >
            <Form.Item
                label={t('createRuleConfigPage.informationForm.dataType')}
                validateStatus={formState?.errors?.dataType ? 'error' : ''}
                help={formState?.errors?.dataType && formState.errors?.dataType?.message}
                className="py-0 mb-4"
                labelAlign="left"
                
            >
                <Controller
                    name="dataType"
                    control={control}
                    render={({ field }) => (
                        <Select data-testid="data-type" {...field} 
                            placeholder={t('createRuleConfigPage.informationForm.selectDataType')}>
                            {RULE_DATA_TYPES.map((state) => (
                                <Select.Option value={state.value}>
                                    {t(`ruleDataTypes.${state.key}`)}
                                </Select.Option>
                            ))}
                        </Select>
                    )}
                />
            </Form.Item>

            <Form.Item 
                label={t('createRuleConfigPage.informationForm.description')}
                validateStatus={formState?.errors?.description ? 'error' : ''}
                help={formState?.errors?.description && formState.errors?.description?.message}
                className="py-0 mb-4"
                labelAlign="left"

            >
                <Controller
                    name={'description'}
                    control={control}
                    defaultValue=""
                    render={({ field }) => <Input.TextArea data-testid="description-input" rows={5} {...field} placeholder={t('createRuleConfigPage.informationForm.description')} />}
                />
            </Form.Item>
            <Form.Item
                label={t('createRuleConfigPage.informationForm.version')}
                className="py-0 mb-0"
                labelAlign="left"

            >
                <div className='flex gap-2'>
                    <Form.Item
                        className="w-1/2 flex-grow"
                        validateStatus={(formState?.errors?.major && formState?.errors?.major?.message || formState?.errors?.patch && formState?.errors?.patch?.message) ? 'error' : ''}
                        help={(formState?.errors?.major && formState?.errors?.major?.message)}
                    >
                        <Controller
                            name={'major'}
                            control={control}
                            render={({ field }) => (
                                <Select data-testid="major-select"  {...field} placeholder={'Major'} >
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
                                        <Select.Option value={val} key={val}>
                                            {val}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        />

                    </Form.Item>
                    <Form.Item
                        className="w-1/2 flex-grow"
                        validateStatus={(formState?.errors?.minor && formState?.errors?.minor?.message || formState?.errors?.patch && formState?.errors?.patch?.message) ? 'error' : ''}
                        help={(formState?.errors?.minor && formState?.errors?.minor?.message)}
                    >
                        <Controller
                            name={'minor'}
                            control={control}
                            render={({ field }) => (
                                <Select data-testid="minor-select"  {...field} placeholder={'Minor'} >
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
                                        <Select.Option value={val} key={val}>
                                            {val}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        />

                    </Form.Item>

                    <Form.Item
                        className="w-1/2 flex-grow"
                        validateStatus={(formState?.errors?.patch && formState?.errors?.patch?.message || formState?.errors?.patch && formState?.errors?.patch?.message) ? 'error' : ''}
                        help={(formState?.errors?.patch && formState?.errors?.patch?.message)}
                    >
                        <Controller
                            name={'patch'}
                            control={control}
                            render={({ field }) => (
                                <Select data-testid="patch-select"  {...field} placeholder={'Patch'}>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
                                        <Select.Option value={val} key={val}>
                                            {val}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        />

                    </Form.Item>
                </div>

            </Form.Item>

            <Form.Item label={t('createRuleConfigPage.informationForm.category')}
                validateStatus={(formState?.errors?.category && formState?.errors?.category?.message) ? 'error' : ''}
                help={(formState?.errors?.category && formState?.errors?.category?.message)}
                className="py-0 mb-3 -mt-4"
                labelAlign="left"

            >
                <Controller
                    name={'isCase'}
                    control={control}
                    render={({ field }) => <Controller
                        name="isBand"
                        control={control}
                        render={({ field: isBand }) => <Checkbox {...field}
                            data-testid="case-checkbox"
                            value={field.value}
                            checked={field.value}
                            onChange={() => {
                                const value = !field.value
                                field.onChange(value);
                                setValue('category', value ? 'isCase' : '');
                                if(value && isBand.value) {
                                    setValue('isBand', false);
                                }
                            }}>{t('createRuleConfigPage.informationForm.cases')}</Checkbox>}
                    />}
                />

                <Controller
                    name={'isBand'}
                    control={control}
                    render={({ field }) => <Controller
                        name="isCase"
                        control={control}
                        render={({ field: isCase }) => <Checkbox  {...field}
                            value={field.value}
                            checked={field.value}
                            data-testid="band-checkbox"
                            onChange={(e) => {
                                const value = !field.value;
                                field.onChange(value);
                                setValue('category', value ? 'isBand' : '');
                                if(value && isCase.value) {
                                    setValue('isCase', false);
                                }

                            }}>{t('createRuleConfigPage.informationForm.bands')}</Checkbox>}
                    />}
                />
            </Form.Item>
        </Form>
    )
}

export default Information;
