// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React, { useEffect } from 'react';
import { Drawer, Form, Input, Button, Alert, Modal } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCommonTranslations } from '~/hooks';
import { checkRuleDuplicate } from './service'; // <== make sure this is implemented

const { Item: FormItem } = Form;

export interface FormData {
  name: string;
  description: string;
  major?: number;
  minor?: number;
  patch?: number;
}

export interface Props {
  open: boolean;
  setOpen(val: boolean): void;
  onSubmit(data: FormData): void;
  error: string;
  success: string;
  loading: boolean;
}

const CreateRule: React.FunctionComponent<Props> = ({ open, setOpen, ...props }) => {
  const { t } = useCommonTranslations();

  const validationSchema = React.useMemo(() => {
    return yup.object().shape({
      name: yup
        .string()
        .required(t('createRulePage.errors.nameRequired'))
        .min(3, t('createRulePage.errors.nameLength')),
      description: yup
        .string()
        .required(t('createRulePage.errors.descriptionRequired'))
        .min(5, t('createRulePage.errors.descriptionLength')),
      major: yup.number().optional().integer(t('createRulePage.errors.majorInteger')).min(0, t('createRulePage.errors.patchMin')),
      minor: yup.number().optional().integer(t('createRulePage.errors.minorInteger')).min(0, t('createRulePage.errors.majorMin')),
      patch: yup.number().optional().integer(t('createRulePage.errors.patchInteger')).min(0, t('createRulePage.errors.minorMin')),
    });
  }, [t]);

  const {
    handleSubmit,
    control,
    formState: { errors },
    clearErrors,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data: FormData) => {
    const version = '1.0.0';

    const isDuplicate = await checkRuleDuplicate(data.name, version);
    if (isDuplicate) {
      Modal.warning({
          title: 'Duplicate Rule Detected',
          content: 'A rule with the same name and version already exists. Please choose a different name or version.',
          okButtonProps: {
            style: {
              backgroundColor: '#1677ff',  // Ant Design default primary blue
              color: '#fff',
              border: 'none',
            },
          },
        });
      return;
    }

    props.onSubmit(data);
  };

  useEffect(() => {
    if (props.success) {
      reset();
      clearErrors();
    }
  }, [props.success]);
  useEffect(() => {  
    if (open) {  
        reset();  
        clearErrors();  
    }  
}, [open, reset, clearErrors]);

  return (
    <Drawer
      title={t('createRulePage.create')}
      placement="right"
      closable={false}
      onClose={() => setOpen(false)}
      open={open}
      key="create-form"
      width="50%"
    >
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {/* Name */}
        <FormItem
          label={t('createRulePage.name')}
          htmlFor="name"
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input {...field} placeholder={t('createRulePage.name')} />}
          />
        </FormItem>

        {/* Description */}
        <FormItem
          htmlFor="description"
          label={t('createRulePage.description')}
          validateStatus={errors.description ? 'error' : ''}
          help={errors.description?.message}
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => <Input.TextArea {...field} placeholder={t('createRulePage.description')} />}
          />
        </FormItem>

        {/* Version Fields */}
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
                    defaultValue={0}
                    disabled
                    placeholder={t('createRulePage.patch')}
                    className={`w-full p-2 mt-2 border rounded ${errors.patch ? 'border-red-500' : 'border-gray-300'}`}
                  />
                )}
              />
              {errors.patch && <span className="text-red-500">{errors.patch.message}</span>}
            </div>
          </div>
        </div>

        {props.success && (
          <Alert
            className="mb-5"
            showIcon
            message="Success"
            description={props.success}
            closable
            type="success"
          />
        )}
        {props.error && (
          <Alert
            message="Error"
            description={props.error}
            className="mb-5"
            closable
            type="error"
            showIcon
          />
        )}

        {/* Submit + Exit */}
        <FormItem>
          <Button
            loading={props.loading}
            type="primary"
            htmlType="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 rounded mr-5"
          >
            {t('createRulePage.submit')}
          </Button>

          <Button
            loading={props.loading}
            onClick={() => setOpen(false)}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 rounded"
          >
            {t('createRulePage.exit')}
          </Button>
        </FormItem>
      </Form>
    </Drawer>
  );
};

export default CreateRule;
