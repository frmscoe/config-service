import React, { useEffect } from 'react';
import { Drawer, Form, Input, Button, Select, Alert } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCommonTranslations } from '~/hooks';
import { IRule } from '../RuleDetailPage/service';


const { Item: FormItem } = Form;

export interface FormData {
    name: string;
    description: string;
    major?: number;
    minor?: number;
    patch?: number;
    changeType?: string;
    state?: string;

}

export interface Props {
    open: boolean;
    setOpen(val: boolean): void;
    setSelectedRule(rule: IRule | null): void;
    onSubmit(data: FormData): void;
    error: string;
    success: string;
    loading: boolean;
    rule: IRule | null;
}

const EditRule: React.FunctionComponent<Props> = ({ open, setOpen, ...props }) => {
    const { t } = useCommonTranslations();

    const validationSchema = React.useMemo(() => {
        return yup.object().shape({
            name: yup.string().required(t('createRulePage.errors.nameRequired')).min(3, t('createRulePage.errors.nameLength')),
            description: yup.string().required(t('createRulePage.errors.descriptionRequired')).min(5, t('createRulePage.errors.descriptionLength')),
            major: yup.number().optional().integer(t('createRulePage.errors.majorInteger')).min(0, t('createRulePage.errors.patchMin')),
            minor: yup.number().optional().integer(t('createRulePage.errors.minorInteger')).min(0, t('createRulePage.errors.majorMin')),
            patch: yup.number().optional().integer(t('createRulePage.errors.patchInteger')).min(0, t('createRulePage.errors.minorMin')),
            changeType: yup.string().when(['state'], (val) => {
                const [state] = val;
                if (state === '01_DRAFT') {
                    return yup.string().optional()
                }
                return yup.string().required();

            }),
            state: yup.string().required(),
        });
    }, [t])


    const { handleSubmit, control, formState: { errors },
        clearErrors, reset, setValue } = useForm<FormData>({
            resolver: yupResolver<FormData>(validationSchema),
        });

    const onSubmit = (data: FormData) => {
        props.onSubmit(data);
    };

    useEffect(() => {
        if (props.success) {
            reset();
            clearErrors();
        }
    }, [props.success])

    useEffect(() => {
        if (props.rule?._key) {
            setValue("name", props.rule.name);
            setValue("description", props.rule.desc);
            const [major, minor, patch] = props.rule.cfg.split('.');
            setValue("major", major ? Number(major) : 0);
            setValue("minor", minor ? Number(minor) : 0);
            setValue("patch", patch ? Number(patch) : 0);
            setValue("state", props.rule.state);
        }
    }, [props.rule]);


    return (
        <>
            <Drawer
                title={props.rule?.state === '01_DRAFT' ? 'Edit' : 'Create'}
                placement={'right'}
                closable={false}
                onClose={() => setOpen(false)}
                open={open}
                key={'create-form'}
                width={'50%'}
            >
                <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                    {/* Name field */}
                    <FormItem
                        label={t('createRulePage.name')}
                        htmlFor='name'
                        validateStatus={errors.name ? 'error' : ''}
                        help={errors.name && errors.name.message}
                    >
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => <Input {...field} placeholder={t('createRulePage.name')} />}
                        />
                    </FormItem>

                    {/* Description field */}
                    <FormItem
                        htmlFor='description'
                        label={t('createRulePage.description')}
                        validateStatus={errors.description ? 'error' : ''}
                        help={errors.description && errors.description.message}
                    >
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => <Input.TextArea {...field} placeholder={t('createRulePage.description')} />}
                        />
                    </FormItem>

                    {props.rule?.state !== '01_DRAFT' ? <Form.Item
                        className="w-1/2 flex-grow"
                        validateStatus={(errors?.changeType && errors?.changeType?.message || errors?.changeType && errors?.changeType?.message) ? 'error' : ''}
                        help={(errors?.changeType && errors?.changeType?.message)}
                    >
                        <label className="block text-gray-700 mb-3">Change Type</label>

                        <Controller
                            name={'changeType'}
                            control={control}
                            render={({ field }) => (
                                <Select data-testid="change-type-select"  {...field} placeholder={'Type of Change'} >
                                    {["major", "minor", "patch"].map((val) => (
                                        <Select.Option  data-testid={`${val}-change-type`} value={val} key={val}>
                                            {val.toUpperCase()}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        />

                    </Form.Item> : null}


                    <div className="mb-4">
                        <label className="block text-gray-700 mb-3">(Version)</label>
                        <div className="flex space-x-4">
                            {/* Major Version Field */}
                            <div className="w-1/3">
                                <label className="block text-gray-700">{t('createRulePage.major')}</label>
                                <Controller
                                    name="major"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            min={0}
                                            defaultValue={1}
                                            disabled
                                            placeholder={t('createRulePage.major')}
                                            className={`w-full p-2 mt-2 border rounded ${errors.major ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                    )}
                                />
                                {errors.major && <span className="text-red-500">{errors.major.message}</span>}
                            </div>

                            {/* Minor Version Field */}
                            <div className="w-1/3">
                                <label className="block text-gray-700">{t('createRulePage.minor')}</label>
                                <Controller
                                    name="minor"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            min={0}
                                            defaultValue={0}
                                            disabled

                                            placeholder={t('createRulePage.minor')}
                                            className={`w-full p-2 mt-2 border rounded ${errors.minor ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                    )}
                                />
                                {errors.minor && <span className="text-red-500">{errors.minor.message}</span>}
                            </div>

                            {/* Patch Version Field */}
                            <div className="w-1/3">
                                <label className="block text-gray-700">{t('createRulePage.patch')}</label>
                                <Controller
                                    name="patch"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            min={0}
                                            placeholder="Patch"
                                            defaultValue={0}
                                            disabled
                                            className={`w-full p-2 mt-2 border rounded ${errors.patch ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                    )}
                                />
                                {errors.patch && <span className="text-red-500">{errors.patch.message}</span>}
                            </div>
                        </div>
                    </div>

                    {props.success && <Alert
                        className='mb-5' showIcon
                        message="Success"
                        description={props.success}
                        closable
                        type="success" />}
                    {props.error && <Alert
                        message="Error"
                        description={props.error}
                        className='mb-5'
                        closable
                        type="error"
                        showIcon
                    />}

                    {/* Submit button */}
                    <FormItem>
                        <Button loading={props.loading} type="primary" htmlType="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 rounded mr-5  ">
                            {t('createRulePage.submit')}
                        </Button>

                        <Button loading={props.loading} onClick={() => {
                            setOpen(false);
                            props.setSelectedRule(null);
                        }}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 rounded">
                            {t('createRulePage.exit')}
                        </Button>
                    </FormItem>
                </Form>
            </Drawer>
        </>
    );
};

export default EditRule;