// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, Button, Select, Alert, Modal } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCommonTranslations } from '~/hooks';
import { IRule } from '../RuleDetailPage/service';
import { createRule } from '../CreateRule/service';
import { getRules } from '../RuleDetailPage/service';


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
    onSubmit(data: FormData): Promise<void>; // CHANGE: Make it return a Promise
    error: string;
    loading: boolean;
    rule: IRule | null;
    // Removed afterCreate prop from here as Edit.tsx doesn't directly trigger list refresh.
    // It only needs to know when its submission is done to close itself.
}

const EditRule: React.FunctionComponent<Props> = ({ open, setOpen, ...props }) => {
    const { t } = useCommonTranslations();
    const [versionModalVisible, setVersionModalVisible] = useState(false);

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

    // CHANGE: Make onSubmit async and await props.onSubmit.
    // Close drawer only after successful submission (or handle error via props.error)
    const onSubmit = async (data: FormData) => {
        try {
            await props.onSubmit(data); // Await the async operation from the parent
            // If the above line completes without throwing an error, it means
            // the rule was successfully updated/created in EditRulePage (index.tsx)
            // and EditRulePage has set its success modal state.
            handleDrawerClose(); // Now close the EditRule drawer
        } catch (e) {
            // Error handling is managed by the parent via props.error,
            // so we don't need to re-throw or set local error state here.
            // Just prevent the drawer from closing if there's an error.
            console.error("Submission failed in EditRule form:", e);
        }
    };

    useEffect(() => {
        if (!open) {
            reset();
            clearErrors();
        }
    }, [open, reset, clearErrors]);

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
    }, [props.rule, setValue]);

    const handleDrawerClose = () => {
        setOpen(false);
        props.setSelectedRule(null);
    };

    const calculateNextVersion = (currentVersion: string, type: 'major' | 'minor' | 'patch') => {
      const [major, minor, patch] = currentVersion.split('.').map(Number);
      switch (type) {
        case 'major': return `${major + 1}.0.0`;
        case 'minor': return `${major}.${minor + 1}.0`;
        case 'patch': return `${major}.${minor}.${patch + 1}`;
        default: return currentVersion;
      }
    };



    const handleClone = async (versionType: 'major' | 'minor' | 'patch') => {
      if (!props.rule) return;

      try {
        const allRules = await getRules({ page: 1, limit: 99999 }).then(res => res.data.rules);

        // Get all rules with the same name
        const sameNameRules = allRules.filter(r => r.name === props.rule!.name);
        const existingVersions = sameNameRules.map(r => r.cfg);

        // Compute the next version based on selected change type
        const newVersion = calculateNextVersion(props.rule.cfg, versionType);

        // Check if that version already exists for this rule name
        if (existingVersions.includes(newVersion)) {
          Modal.error({
            title: 'Version Already Exists',
            content: `Version ${newVersion} already exists for rule "${props.rule.name}". Please go to that version and clone it instead.`,
          });
          return;
        }

        // Proceed to clone
        await createRule({
          cfg: newVersion,
          desc: props.rule.desc,
          name: props.rule.name,
          state: '01_DRAFT',
          dataType: 'NUMERIC'
        });

        Modal.success({
          title: 'Cloned Successfully',
          content: `Rule cloned as version ${newVersion}`,
          onOk: () => {
            setOpen(false);
            props.setSelectedRule(null);
            props.afterEdit?.();
          }
        });

      } catch (err) {
        Modal.error({
          title: 'Clone Failed',
          content: err?.response?.data?.message || err?.message || 'Something went wrong'
        });
      }
    };



    return (
        <>
            <Drawer
                title={props.rule?.state === '01_DRAFT' ? 'Edit' : 'Create'}
                placement={'right'}
                closable={false}
                onClose={handleDrawerClose}
                open={open}
                key={'edit-form'}
                width={'50%'}
            >
                <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
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

                    {props.error && <Alert
                        message="Error"
                        description={props.error}
                        className='mb-5'
                        closable
                        type="error"
                        showIcon
                    />}

                    <FormItem>
                        <Button loading={props.loading} type="primary" htmlType="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 rounded mr-5  ">
                            {t('createRulePage.submit')}
                        </Button>


                        <Button
                          type="default"
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 rounded"
                          onClick={() => setVersionModalVisible(true)}
                        >
                          Clone
                        </Button>



                        <Button loading={props.loading} onClick={handleDrawerClose}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 rounded">
                            {t('createRulePage.exit')}
                        </Button>

                    </FormItem>
                </Form>
            </Drawer>

            <Modal
              title="Select Version Type"
              open={versionModalVisible}
              footer={null}
              onCancel={() => setVersionModalVisible(false)}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['major', 'minor', 'patch'].map(type => (
                  <Button
                    key={type}
                    onClick={() => {
                      setVersionModalVisible(false); // Close modal
                      handleClone(type as 'major' | 'minor' | 'patch'); // Trigger clone
                    }}
                  >
                    {type.toUpperCase()}
                  </Button>
                ))}
              </div>
            </Modal>

        </>
    );
};

export default EditRule;