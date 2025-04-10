// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React, { useState } from 'react';
import { Upload, message as antMessage, Select, Button, Modal, Spin, Radio } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Api } from '~/client';
import usePrivileges from '~/hooks/usePrivileges';
import AccessDeniedPage from '~/components/common/AccessDenied';
import { useCommonTranslations } from '~/hooks';
import { stringify } from 'querystring';

const { Option } = Select;
const { Dragger } = Upload;

const lightBlueButtonStyle = {
  backgroundColor: '#add8e6',
  borderColor: '#add8e6',
  color: '#000',
};

const cancelButtonStyle = {
  backgroundColor: '#ff4d4f', 
  borderColor: '#ff4d4f', 
  color: '#fff', 
};

const ImportRuleConfig: React.FC = () => {
  const [jsonContent, setJsonContent] = useState<any>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [dataType, setDataType] = useState<string>('CURRENCY');
  const [showDataTypeSelection, setShowDataTypeSelection] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isIntermediateModalVisible, setIsIntermediateModalVisible] = useState<boolean>(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState<boolean>(false);
  const [isVersionModalVisible, setIsVersionModalVisible] = useState<boolean>(false);
  const [ruleExists, setRuleExists] = useState<boolean>(false);
  const [configExists, setConfigExists] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [versionUpdateType, setVersionUpdateType] = useState<string>('patch');
  const [ruleCreated, setRuleCreated] = useState<boolean>(false);
  const [existingRuleVersion, setExistingRuleVersion] = useState<string | null>(null);
  const [existingRuleId, setExistingRuleId] = useState<string | null>(null);
  const { canImportRule } = usePrivileges();
  const { t } = useCommonTranslations();
  const [band, setband] = useState([]);
  const [cases, setcases] = useState([]);
  const [exitConditions, setExitConditions] = useState([]);
  const [isSavingModalVisible, setIsSavingModalVisible] = useState(false);
  const [isCreatingConfigVisible, setIsCreatingConfigVisible] = useState(false);

  const handleFileUpload = (file: any) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const fileContent = JSON.parse(reader.result as string);
        setJsonContent(fileContent);
        const bandsFromJson = fileContent.config.bands || [];
        const casesFromJson = fileContent.config.cases || [];
        const exitConditionsFromJson = fileContent.config.exitConditions || [];

        setband(bandsFromJson);
        setcases(casesFromJson);
        setExitConditions(exitConditionsFromJson);
        checkForExistingRule(fileContent);
      } catch (error) {
        showErrorModal(t('importRulePage.errorParsingJson'));
      }
    };
    reader.readAsText(file);
    return false;
  };

  const showErrorModal = (content: string) => {
    setModalMessage(content);
    setIsErrorModalVisible(true);
  };

  const checkForExistingRule = async (fileContent: any) => {
    setLoading(true);
    try {
      let ruleName = fileContent.id.split('@')[0];
      ruleName = String(ruleName).trim();
      if (ruleName === '') {
        showErrorModal(t('importRulePage.invalidRuleName'));
        setLoading(false);
        return;
      }
      if (fileContent.desc === '') {
        showErrorModal(t('importRulePage.invalidRuleDescription'));
        setLoading(false);
        return;
      }
      if (fileContent.cfg === '') {
        showErrorModal(t('importRulePage.invalidConfig'));
        setLoading(false);
        return;
      }
      const response = await Api.get(`rule/name/${ruleName}`);
      if (response.data && response.data.length > 0) { // Checking if data array has elements
        setRuleExists(true);
        setExistingRuleVersion(response.data[0].cfg); // Assuming version is stored in the first object of the data array
        setExistingRuleId(response.data[0]._id); // Store the rule ID
        setModalMessage(t('importRulePage.existingRuleFound'));
        setIsModalVisible(true);
      } else {
        setRuleExists(false);
        setModalMessage(t('importRulePage.noExistingRuleFound'));
        setIsModalVisible(true);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setRuleExists(false);
        setModalMessage(t('importRulePage.noExistingRuleFound'));
        setIsModalVisible(true);
      } else {
        console.error('Error checking for existing rule:', error);
        showErrorModal(error?.response?.data?.message || t('importRulePage.errorCreatingRule'));
      }
    } finally {
      setLoading(false);
    }
  };

  const checkForExistingConfig = async (ruleName: string) => {
    setLoading(true);
    try {
      const response = await Api.get(`rule/rule-and-its-configs/${ruleName}`);
      if (response.data && response.data.ruleConfigs && response.data.ruleConfigs.length > 0) {
        setConfigExists(true);
        setModalMessage(t('importRulePage.existingConfigFound'));
        setIsIntermediateModalVisible(true);
      } else {
        setConfigExists(false);
        setModalMessage(t('importRulePage.noExistingConfigFound'));
        setIsIntermediateModalVisible(true);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setConfigExists(false);
        setModalMessage(t('importRulePage.noExistingConfigFound'));
        setIsIntermediateModalVisible(true);
      } else {
        console.error('Error checking for existing configuration:', error);
        showErrorModal(error?.response?.data?.message || t('importRulePage.errorCheckingConfig'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseExistingRule = async () => {
    setModalMessage(null);
    setIsModalVisible(false);
    await checkForExistingConfig(jsonContent.id.split('@')[0]);
  };

  const handleYesCreateNewRule = () => {
    setModalMessage(null);
    setShowDataTypeSelection(true);
    setIsModalVisible(false);
  };

  const handleYesCreateNewConfig = async () => {
    setModalMessage(null);
    setIsIntermediateModalVisible(false);
    setShowDataTypeSelection(false);
    setIsCreatingConfigVisible(true); // Show creating config modal
    await createNewConfig();
  };

  const handleYesUpdateRuleAndConfig = () => {
    setShowDataTypeSelection(false);
    setIsIntermediateModalVisible(false);
    setIsVersionModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsIntermediateModalVisible(false);
    setIsErrorModalVisible(false);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    setIsIntermediateModalVisible(false);
    setIsErrorModalVisible(false);
    setShowDataTypeSelection(false);
    setIsSavingModalVisible(false);
    setIsCreatingConfigVisible(false); // Hide creating config modal
  };

  const handleDataTypeChange = (value: string) => {
    setDataType(value);
  };

  const handleDataTypeSubmit = async () => {
    setIsSavingModalVisible(true);  // Show saving modal
    try {
      await createNewRuleWithVersionUpdate(false);
    } catch (error) {
      console.error('Error while creating new rule:', error);
      // Handle error (e.g., show error message)
    } finally {
      setIsSavingModalVisible(false);  // Hide saving modal
      setShowDataTypeSelection(false); // Close the data type selection modal
    }
  };

  const handleVersionChange = (e: any) => {
    setVersionUpdateType(e.target.value);
  };

  const handleVersionSubmit = async () => {
    await createNewConfig(true);
    setIsVersionModalVisible(false);
  };

  const createNewConfig = async (isVersionUpdate = false) => {
    setLoading(true);
    setModalMessage(t('importRulePage.addingConfig'));
    try {
      let newVersion = jsonContent.cfg;

      if (isVersionUpdate && existingRuleVersion) {
        const versionParts = existingRuleVersion.split('.');
        let major = parseInt(versionParts[0]);
        let minor = parseInt(versionParts[1]);
        let patch = parseInt(versionParts[2]);

        if (versionUpdateType === 'major') {
          major += 1;
          minor = 0;
          patch = 0;
        } else if (versionUpdateType === 'minor') {
          minor += 1;
          patch = 0;
        } else if (versionUpdateType === 'patch') {
          patch += 1;
        }

        newVersion = `${major}.${minor}.${patch}`;
      }

      const response = await Api.post('rule-config', {
        cfg: newVersion,
        desc: jsonContent.desc,
        ruleId: existingRuleId,
        config: {
          parameters: [
            {
              ParameterName: stringify(jsonContent.config.parameters.ParameterName),
              ParameterValue: jsonContent.config.parameters.ParameterValue,
              ParameterType: stringify(jsonContent.config.parameters.ParameterType)
            }
          ],
          exitConditions: exitConditions,
          bands: band,
          cases: cases,
        }
      });

      if (response.status === 201) {
        setRuleCreated(true);
        setModalMessage(t('importRulePage.configCreatedSuccess'));
      }
    } catch (error: any) {
      console.error('Error creating new config:', error);
      showErrorModal(t('importRulePage.errorCreatingConfig'));
    } finally {
      setLoading(false);
      setIsCreatingConfigVisible(false); // Hide creating config modal
      setIsModalVisible(true);
    }
  };

  const createNewRuleWithVersionUpdate = async (isVersionUpdate: boolean) => {
    let ruleName = jsonContent.id.split('@')[0];
    ruleName = String(ruleName).trim();
    setLoading(true);
    setModalMessage(t('importRulePage.addingRule'));
    try {
      let newVersion = jsonContent.cfg;

      if (isVersionUpdate && existingRuleVersion) {
        const versionParts = existingRuleVersion.split('.');
        let major = parseInt(versionParts[0]);
        let minor = parseInt(versionParts[1]);
        let patch = parseInt(versionParts[2]);

        if (versionUpdateType === 'major') {
          major += 1;
          minor = 0;
          patch = 0;
        } else if (versionUpdateType === 'minor') {
          minor += 1;
          patch = 0;
        } else if (versionUpdateType === 'patch') {
          patch += 1;
        }

        newVersion = `${major}.${minor}.${patch}`;
      }

      const response = await Api.post('rule/import', {
        rule_cfg: newVersion,
        name: ruleName,
        dataType: dataType,
        rule_desc: jsonContent.desc,
        source: 'USER_IMPORTED',
        rule_config_cfg: jsonContent.cfg,
        rule_config_desc: jsonContent.desc,
        ruleId: ruleName,
        version: newVersion,
        configVersion: '1.0.0',
        config: {
          parameters: [
            {
              ParameterName: stringify(jsonContent.config.parameters.ParameterName),
              ParameterValue: jsonContent.config.parameters.ParameterValue,
              ParameterType: stringify(jsonContent.config.parameters.ParameterType)
            }
          ],
          exitConditions: exitConditions,
          bands: band,
          cases: cases,
        }
      });
      if (response.status === 201) {
        setRuleCreated(true);
        setModalMessage(t('importRulePage.ruleCreatedSuccess'));
      }
    } catch (error: any) {
      console.error('Error creating new rule:', error);
      showErrorModal(t('importRulePage.errorCreatingRule'));
    } finally {
      setLoading(false);
      setIsModalVisible(true);
    }
  };

  if (!canImportRule) {
    return <AccessDeniedPage />;
  }

  return (
    <div className="import-rule-config">
      <h1>{t('importRulePage.ImportRuleConfigTitle')}</h1>
      <Dragger beforeUpload={handleFileUpload} showUploadList={false}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{t('importRulePage.uploadPrompt')}</p>
        <p className="ant-upload-hint">{t('importRulePage.uploadHint')}</p>
      </Dragger>

      {loading && <Spin size="large" />}

      <Modal
        title={t('importRulePage.existingRuleModalTitle')}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          ruleExists ? (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button key="useExistingRule" type="primary" style={lightBlueButtonStyle} onClick={handleUseExistingRule}>
                {t('importRulePage.useExistingRule')}
              </Button>
              <Button key="createNewRule" type="primary" style={lightBlueButtonStyle} onClick={handleYesCreateNewRule}>
                {t('importRulePage.createNewRule')}
              </Button>
              <Button key="cancelImport" style={cancelButtonStyle} onClick={handleCancel}>
                {t('importRulePage.cancelImport')}
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button key="createNewRule" type="primary" style={lightBlueButtonStyle} onClick={handleYesCreateNewRule}>
                {t('importRulePage.createNewRule')}
              </Button>
              <Button key="cancelImport" style={cancelButtonStyle} onClick={handleCancel}>
                {t('importRulePage.cancelImport')}
              </Button>
            </div>
          )
        ]}
      >
        <p>{modalMessage}</p>
      </Modal>

      <Modal
        title={t('importRulePage.existingConfigModalTitle')}
        open={isIntermediateModalVisible}
        onCancel={handleCancel}
        footer={[
          configExists ? (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button key="updateConfig" type="primary" style={lightBlueButtonStyle} onClick={handleYesUpdateRuleAndConfig}>
                {t('importRulePage.updateConfig')}
              </Button>
              <Button key="createNewConfig" type="primary" style={lightBlueButtonStyle} onClick={handleYesCreateNewConfig}>
                {t('importRulePage.createNewConfig')}
              </Button>
              <Button key="cancelImport" style={cancelButtonStyle} onClick={handleCancel}>
                {t('importRulePage.cancelImport')}
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button key="createNewConfig" type="primary" style={lightBlueButtonStyle} onClick={handleYesCreateNewConfig}>
                {t('importRulePage.createNewConfig')}
              </Button>
              <Button key="cancelImport" style={cancelButtonStyle} onClick={handleCancel}>
                {t('importRulePage.cancelImport')}
              </Button>
            </div>
          )
        ]}
      >
        <p>{modalMessage}</p>
      </Modal>

      <Modal
        title={t('importRulePage.pleaseSelectDataType')}
        open={showDataTypeSelection}
        onCancel={() => setShowDataTypeSelection(false)}
        footer={[
          <Button key="submit" type="primary" style={lightBlueButtonStyle} onClick={handleDataTypeSubmit}>
            {t('importRulePage.OK')}
          </Button>,
        ]}
      >
        <Select defaultValue="CURRENCY" onChange={handleDataTypeChange}>
          <Option value="CURRENCY">{t('importRulePage.dataTypes.currency')}</Option>
          <Option value="NUMERIC">{t('importRulePage.dataTypes.number')}</Option>
          <Option value="TIME">{t('importRulePage.dataTypes.time')}</Option>
          <Option value="CALENDAR_DATE_TIME">{t('importRulePage.dataTypes.calendarDateTime')}</Option>
          <Option value="TEXT">{t('importRulePage.dataTypes.text')}</Option>
        </Select>
      </Modal>

      <Modal
        title={t('importRulePage.savingRuleToDatabase')}
        open={isSavingModalVisible}
        footer={null} // No buttons in this modal
      >
        <Spin size="large" /> {/* Show a spinner while saving */}
      </Modal>

      <Modal
        title={t('importRulePage.creatingRuleConfig')}
        open={isCreatingConfigVisible}
        footer={null} // No buttons in this modal
      >
        <Spin size="large" /> {/* Show a spinner while creating config */}
      </Modal>

      <Modal
        title={t('importRulePage.versionUpdateTitle')}
        open={isVersionModalVisible}
        onCancel={() => setIsVersionModalVisible(false)}
        footer={[
          <Button key="submit" type="primary" style={lightBlueButtonStyle} onClick={handleVersionSubmit}>
            {t('importRulePage.enterMissingData')}
          </Button>,
        ]}
      >
        <Radio.Group onChange={handleVersionChange} value={versionUpdateType}>
          <Radio value="major">{t('importRulePage.majorChange')}</Radio>
          <Radio value="minor">{t('importRulePage.minorChange')}</Radio>
          <Radio value="patch">{t('importRulePage.patchChange')}</Radio>
        </Radio.Group>
      </Modal>

      <Modal
        title={t('importRulePage.ImportRuleConfigTitle')}
        open={isErrorModalVisible}
        onCancel={handleOk}
        footer={[
          <Button key="ok" type="primary" style={lightBlueButtonStyle} onClick={handleOk}>
            {t('importRulePage.OK')}
          </Button>,
        ]}
      >
        <p>{modalMessage}</p>
      </Modal>

      <Modal
        title={t('importRulePage.ruleCreatedSuccess')}
        open={isModalVisible && ruleCreated}
        onCancel={handleOk}
        footer={[
          <Button key="ok" type="primary" style={lightBlueButtonStyle} onClick={handleOk}>
            {t('importRulePage.OK')}
          </Button>,
        ]}
      >
        <p>{modalMessage}</p>
      </Modal>
    </div>
  );
};

export default ImportRuleConfig;