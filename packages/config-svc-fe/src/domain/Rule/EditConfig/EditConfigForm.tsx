// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import {
  Button,
  Descriptions,
  Typography,
  Table,
  Modal,
  Select,
  Empty,
  message
} from 'antd';
import { IRuleConfig } from '../RuleConfig/RuleConfigList/types';
import { IRule } from '../RuleDetailPage/service';
import { IUserProfile } from '~/context/auth';
import { useCommonTranslations } from '~/hooks';
// import { ConfigForm } from '../CreateConfig/Forms';
import { ConfigForm } from './Forms';
import { postRuleConfig, getFullRuleConfig, updateRuleConfig } from './service'; // corrected import
import { useRouter } from 'next/router';


const { Option } = Select;

interface Props {
  loading: boolean;
  configuration: IRuleConfig;
  error: string;
  fetchConfig: () => void;
  rule: IRule | null;
  user: IUserProfile;
}

const EditConfigForm: React.FC<Props> = ({
  loading,
  configuration,
  error,
  fetchConfig,
  rule,
  user
}) => {
  const { t } = useCommonTranslations();
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [selectedVersionType, setSelectedVersionType] = useState<string | null>(null);
  const [activeKeys, setActiveKeys] = useState<string[]>(['Information']);

  const config = configuration?.config || {};

  const renderSection = (title: string, columns: any[], data: any[]) => (
    <div className="my-6">
      <Typography.Title level={4}>{title}</Typography.Title>
      {data?.length ? (
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          rowKey={(record, index) => index.toString()}
          bordered
          size="small"
        />
      ) : (
        <Empty description={`No ${title.toLowerCase()} found`} />
      )}
    </div>
  );

  const descriptionItems = [
    { key: '1', label: 'Version', children: configuration?.cfg },
    { key: '2', label: 'Description', children: configuration?.desc },
    { key: '3', label: 'Created At', children: configuration?.createdAt ? new Date(configuration.createdAt).toLocaleString() : 'N/A' },
    { key: '4', label: 'Updated At', children: configuration?.updatedAt ? new Date(configuration.updatedAt).toLocaleString() : 'N/A' },
    { key: '5', label: 'State', children: configuration?.state },
    { key: '6', label: 'Rule', children: rule?.name },
  ];

  const router = useRouter();

  const handleClone = async () => {
    if (!selectedVersionType) return;

    try {
      const currentVersion = configuration.cfg.split('.').map(Number);
      let [major, minor, patch] = currentVersion;

      if (selectedVersionType === 'major') {
        major += 1; minor = 0; patch = 0;
      } else if (selectedVersionType === 'minor') {
        minor += 1; patch = 0;
      } else if (selectedVersionType === 'patch') {
        patch += 1;
      }

      const newVersion = `${major}.${minor}.${patch}`;
      const { data } = await getFullRuleConfig(rule?.name || '');

      const ruleConfigs = data?.rules?.[0]?.ruleConfigs || [];

      const exists = ruleConfigs.some(cfg => cfg.cfg === newVersion);

      if (exists) {
        message.warning(`Version ${newVersion} already exists.`);
        return;
      }

      await postRuleConfig({
        ruleId: configuration.ruleId,
        desc: configuration.desc,
        cfg: newVersion,
        config: configuration.config,
      });

      message.success(`Cloned as version ${newVersion}`);
      setCloneModalOpen(false);
      setSelectedVersionType(null);
      fetchConfig();
      router.push('/rule-config');

    } catch (err: any) {
      console.error(err);
      message.error(err?.message || 'Cloning failed');
    }
  };


  return (
    <div className="p-6">
      <Typography.Title level={2} className="text-center">Rule Configuration</Typography.Title>

      <Descriptions
        column={1}
        layout="vertical"
        bordered
        items={descriptionItems}
      />

      {renderSection('Parameters', [
        { title: 'Name', dataIndex: 'ParameterName', key: 'name' },
        { title: 'Value', dataIndex: 'ParameterValue', key: 'value' },
        { title: 'Type', dataIndex: 'ParameterType', key: 'type' }
      ], config.parameters || [])}

      {renderSection('Bands', [
        { title: 'Sub Rule Ref', dataIndex: 'subRuleRef', key: 'subRuleRef' },
        { title: 'Upper Limit', dataIndex: 'upperLimit', key: 'upperLimit' },
        { title: 'Lower Limit', dataIndex: 'lowerLimit', key: 'lowerLimit' },
        { title: 'Reason', dataIndex: 'reason', key: 'reason' }
      ], config.bands || [])}

      {renderSection('Cases', [
        { title: 'Sub Rule Ref', dataIndex: 'subRuleRef', key: 'subRuleRef' },
        { title: 'Value', dataIndex: 'value', key: 'value' },
        { title: 'Reason', dataIndex: 'reason', key: 'reason' }
      ], config.cases || [])}

      {renderSection('Exit Conditions', [
        { title: 'Sub Rule Ref', dataIndex: 'subRuleRef', key: 'subRuleRef' },
        { title: 'Reason', dataIndex: 'reason', key: 'reason' }
      ], config.exitConditions || [])}

      <div className="mt-4">
        <Button type="primary" className="mr-2 bg-blue-600" onClick={() => setEditDrawerOpen(true)}>
          Edit
        </Button>

        <Button onClick={() => setCloneModalOpen(true)}>
          Clone
        </Button>
      </div>

      {/* EDIT Drawer */}
      <ConfigForm
        open={editDrawerOpen}
        setOpen={setEditDrawerOpen}
        loading={loading}
        setLoading={() => {}}
        success=""
        serverError=""
        activeKeys={activeKeys}
        setActiveKey={setActiveKeys}
        handleClose={() => setEditDrawerOpen(false)}
        rule={rule}
        configToEdit={configuration}
        // onSubmit={async () => {
        //   setEditDrawerOpen(false);
        //   fetchConfig();
        // }}
        onSubmit={async (data) => {
          try {
            await updateRuleConfig(configuration._key || configuration._id, {
              cfg: configuration.cfg, // Keep original version
              desc: data.description,
              ruleId: configuration.ruleId,
              ownerId: user?.email,
              state: configuration.state,
              createdAt: configuration.createdAt,
              updatedAt: new Date().toISOString(),
              updatedBy: user?.email,
              originatedID: configuration.originatedID,
              config: {
                parameters: data.parameters || [],
                exitConditions: (data.exitConditions || []).map((cond: any) => ({
                  subRuleRef: cond.id,
                  reason: cond.reason
                })),
                bands: data.category === 'isBand'
                  ? [
                      ...data.bands.map((band: any, index: number) => ({
                        ...(index !== 0 && { lowerLimit: band.value }),
                        upperLimit: band.value,
                        subRuleRef: `0.${index + 1}`,
                        reason: band.reason,
                      })),
                      {
                        lowerLimit: data.bandMaximumCondition,
                        subRuleRef: `0.${data?.bands?.length + 1}`,
                        reason: data.bandMaxReason,
                      },
                    ]
                  : [],
                cases: data.category === 'isCase' ? data.cases : [],
              }
            });
            
            message.success("Rule Config updated successfully");
            setEditDrawerOpen(false);
            fetchConfig();
          } catch (err: any) {
            message.error(err?.response?.data?.message || "Update failed");
          }
        }}

        conditions={[]}
        setConditions={() => {}}
      />

      {/* CLONE Modal */}
      <Modal
        title="Select Version Type"
        visible={cloneModalOpen}
        onOk={handleClone}
        onCancel={() => {
          setCloneModalOpen(false);
          setSelectedVersionType(null);
        }}
        okText="Clone"
        cancelText="Cancel"
        okButtonProps={{
          disabled: !selectedVersionType,
          style: {
            backgroundColor: selectedVersionType ? '#1890ff' : '#f0f0f0',
            color: selectedVersionType ? '#fff' : '#ccc',
            border: 'none',
            cursor: selectedVersionType ? 'pointer' : 'not-allowed'
          }
        }}
      >
        <Typography.Text>Please select the type of version change:</Typography.Text>
        <Select
          placeholder="Choose version type"
          style={{ width: '100%', marginTop: 12 }}
          onChange={setSelectedVersionType}
          value={selectedVersionType || undefined}
        >
          <Option value="major">Major</Option>
          <Option value="minor">Minor</Option>
          <Option value="patch">Patch</Option>
        </Select>
      </Modal>
    </div>
  );
};

export default EditConfigForm;
