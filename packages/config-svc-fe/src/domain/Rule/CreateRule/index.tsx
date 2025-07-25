// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React, { useState } from 'react';
import CreateRule, { FormData } from './CreateRule';
import { createRule } from './service';
import { useCommonTranslations } from '~/hooks';
import { configStateMachine } from '../../../../machine/configStateMachine';
import { Modal, Button } from 'antd';

interface Props {
  open: boolean;
  setOpen(val: boolean): void;
  afterCreate(): void;
}

const CreateRulePage: React.FunctionComponent<Props> = (props) => {
  const { t } = useCommonTranslations();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const handleSubmit = async (data: FormData) => {
    try {
      setError('');
      setLoading(true);

      const initialStateValue = configStateMachine.initial;

      await createRule({
        cfg: '1.0.0', // Assuming default
        desc: data.description,
        state: initialStateValue,
        name: data.name,
        dataType: 'NUMERIC', // Assuming default
      });

      // --- CHANGES START HERE ---
      // 1. Close the main creation drawer/modal immediately after successful API call
      props.setOpen(false);
      // 2. Then, show the success modal
      setIsSuccessModalVisible(true);
      // 3. IMPORTANT: Do NOT call props.afterCreate() here. It will be called AFTER the success modal is closed.
      // --- CHANGES END HERE ---

    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || t('generalError'));
    } finally {
      setLoading(false);
    }
  };

  // Handler to close the success modal
  const handleSuccessModalClose = () => {
    setIsSuccessModalVisible(false); // Hide the success modal
    // --- CHANGES START HERE ---
    // Now, trigger the list refetch and pagination update AFTER the modal is closed
    props.afterCreate && props.afterCreate();
    // --- CHANGES END HERE ---
  };

  return (
    <>
      <CreateRule
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        success=""
        {...props}
      />

      <Modal
        title={t('createRulePage.success') || 'Success!'}
        open={isSuccessModalVisible}
        onOk={handleSuccessModalClose}
        onCancel={handleSuccessModalClose}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={handleSuccessModalClose}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            {t('createRulePage.ok') || 'OK'}
          </Button>,
        ]}
      >
        <p>{t('createRulePage.success')}</p>
      </Modal>
    </>
  );
};

export default CreateRulePage;