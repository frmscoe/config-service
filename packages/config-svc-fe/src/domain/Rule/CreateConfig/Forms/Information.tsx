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
        <Form layout="horizontal" onFinish={handleSubmit(onSubmit)}>
            <Form.Item
                label={t('createRuleConfigPage.informationForm.dataType')}
                validateStatus={formState?.errors?.dataType ? 'error' : ''}
                help={formState?.errors?.dataType && formState.errors?.dataType?.message}
            >
                <Controller
                    name="dataType"
                    control={control}
                    render={({ field }) => (
                        <Select data-testid="data-type" {...field} placeholder={t('createRuleConfigPage.informationForm.selectDataType')}>
                            {RULE_DATA_TYPES.map((state) => (
                                <Select.Option value={state.value}>
                                    {t(`ruleDataTypes.${state.key}`)}
                                </Select.Option>
                            ))}
                        </Select>
                    )}
                />
            </Form.Item>

            <Form.Item label={t('createRuleConfigPage.informationForm.description')}
                validateStatus={formState?.errors?.description ? 'error' : ''}
                help={formState?.errors?.description && formState.errors?.description?.message}
                className="my-10"
            >
                <Controller
                    name={'description'}
                    control={control}
                    defaultValue=""
                    render={({ field }) => <Input.TextArea data-testid="description-input" rows={5} {...field} placeholder={t('createRuleConfigPage.informationForm.description')} />}
                />
            </Form.Item>
            <Form.Item label={t('createRuleConfigPage.informationForm.version')}>
                <div className='flex gap-2'>
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
                                if(value && isBand.value) {
                                    setValue('isBand', false);
                                    setValue('category', 'isCase')
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
                                if(value && isCase.value) {
                                    setValue('isCase', false);
                                    setValue('category', 'isBand');
                                }

                            }}>{t('createRuleConfigPage.informationForm.bands')}</Checkbox>}
                    />}
                />
            </Form.Item>
        </Form>
    )
}

export default Information;
