import React, { useState } from 'react';
import { Upload, Button, Modal, Spin, message as antMessage } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { Api } from '~/client';
import usePrivileges from '~/hooks/usePrivileges';
import AccessDeniedPage from '~/components/common/AccessDenied';
import { useCommonTranslations } from '~/hooks';

const { Dragger } = Upload;

const lightBlueButtonStyle = {
  backgroundColor: '#add8e6',
  borderColor: '#add8e6',
  color: '#000',
};

const ImportTypology = () => {
  const [modalMessage, setModalMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ruleCreated, setRuleCreated] = useState(false);
  const { canImportRule } = usePrivileges();
  const { t } = useCommonTranslations();

  const handleFileUpload = async (file) => {
    setLoading(true);
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const json = JSON.parse(reader.result);
        const { typology_name, id, cfg, threshold, rules, expression } = json;

        if (!typology_name || !id || !cfg || !threshold || !rules || !expression) {
          throw new Error("Invalid Typology JSON file.");
        }

        const [name] = id.split('@');
        const desc = typology_name;
        const score = { threshold, rules, expression };

        // Check if typology already exists to prevent duplicates
        try {
          const existingTypologyRes = await Api.get(`/typology/name/${encodeURIComponent(name)}`);
          if (existingTypologyRes?.data?._id) {
            throw new Error(`A typology with the name "${name}" already exists.`);
          }
        } catch (err) {
          if (err.response?.status !== 404) {
            throw new Error(err.response?.data?.message || "Error: Typology Already Exists.");
          }
        }

        // Resolve or create rule IDs
        const ruleNames = [...new Set(rules.map(r => r.id.split('@')[0]))];
        const rules_rule_configs = [];

        for (const ruleName of ruleNames) {
          let ruleId = null;

          // STEP 1: Check for existing rule using the correct endpoint and data extraction
          try {
            const res = await Api.get(`/rule/name/${encodeURIComponent(ruleName)}`);
            // The API returns an array, so we need to access the first element
            if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
              ruleId = res.data[0]._id;
            }
          } catch (err) {
            // A 404 error here is expected if the rule doesn't exist.
            if (err.response?.status !== 404) {
              throw new Error(`Failed to check for rule "${ruleName}": ${err.response?.data?.message || 'Unknown error'}`);
            }
            // If it's a 404, we proceed to create the rule.
          }
          
          // STEP 2: If no existing ID was found, create the new rule
          if (!ruleId) {
            try {
              const createRes = await Api.post('/rule', {
                name: ruleName,
                cfg,
                desc: 'Imported via Typology',
              });
              ruleId = createRes?.data?._id;
            } catch (createErr) {
              // The API will throw an error here if the rule already exists,
              // but we are already handling that with the GET request.
              // This catch block handles other creation failures.
              throw new Error(`Failed to create rule "${ruleName}": ${createErr.response?.data?.message || 'Unknown error'}`);
            }
          }

          if (!ruleId) {
            throw new Error(`Failed to resolve or create rule "${ruleName}".`);
          }

          rules_rule_configs.push({
            ruleId,
            ruleConfigId: [],
          });
        }

        // Create the new typology
        const payload = {
          name,
          cfg,
          desc,
          typologyCategoryUUID: [],
          rules_rule_configs,
          referenceId: null,
          score,
        };

        await Api.post("/typology", payload);
        setLoading(false);
        showSuccessModal(`Typology "${name}" imported successfully.`);
      } catch (err) {
        setLoading(false);
        antMessage.error(err.message || 'An unknown error occurred during import.');
      }
    };

    reader.onerror = () => {
      setLoading(false);
      antMessage.error("Could not read the file.");
    };

    reader.readAsText(file);
    return false;
  };

  const showSuccessModal = (content) => {
    setModalMessage(content);
    setRuleCreated(true);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    setRuleCreated(false);
    setModalMessage(null);
  };

  if (!canImportRule) {
    return <AccessDeniedPage />;
  }

  return (
    <div className="import-rule-config">
      <h1>{t('importTypologyPage.ImportRuleConfigTitle')}</h1>
      <Dragger beforeUpload={handleFileUpload} showUploadList={false}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{t('importTypologyPage.uploadPrompt')}</p>
        <p className="ant-upload-hint">{t('importTypologyPage.uploadHint')}</p>
      </Dragger>

      {loading && <Spin size="large" />}

      <Modal
        title={t('importTypologyPage.ruleCreatedSuccess')}
        open={isModalVisible && ruleCreated}
        onCancel={handleOk}
        footer={[
          <Button key="ok" type="primary" style={lightBlueButtonStyle} onClick={handleOk}>
            {t('importTypologyPage.OK')}
          </Button>,
        ]}
      >
        <p>{modalMessage}</p>
      </Modal>
    </div>
  );
};

export default ImportTypology;