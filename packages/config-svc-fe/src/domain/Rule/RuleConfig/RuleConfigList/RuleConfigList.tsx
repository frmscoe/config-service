// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableColumnsType } from 'antd';
import { Alert, Button, Input, Space, Table, Modal } from 'antd';
import { IUserProfile } from '~/context/auth';
import { IRuleConfig } from './types';
import { IRule } from '../../RuleDetailPage/service';
import { useCommonTranslations } from '~/hooks';
import { uniqueArray } from '~/utils/uniqueItems';
import styles from './RuleConfigList.module.scss';
import { ConfigTable } from './ConfigTable';
import usePrivileges from '~/hooks/usePrivileges';
import Link from 'next/link';
import { ConfigForm } from '../../CreateConfig/Forms';
import { postRuleConfig, getRuleAndConfigs } from '~/domain/Rule/CreateConfig/service';


interface Props {
  loading: boolean;
  error: string;
  retry(): void; // This is the function to refetch the list
  page: number,
  data: IRule[],
  total: number;
  onPageChange(page: number, pageSize: number): void,
  user: IUserProfile
}
const generateRandomString = (length: number) => [...Array(length)].map(() => Math.random().toString(36).charAt(2)).join('');

const RuleConfig: React.FunctionComponent<Props> = ({
  data: ruleConfigs,
  loading,
  page,
  onPageChange,
  user,
  total,
  error,
  retry, // Destructure retry function
}) => {
  const { t: commonTranslations } = useCommonTranslations();
  const [searchText, setSearchText] = useState<string>('');
  const [configs, setConfigs] = useState<IRule[]>([]);
  const [searchConfigText, setSearchConfigText] = useState('');
  const [searchConfigResults, setSearchConfigResults] = useState<IRuleConfig[]>([]);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRuleData, setActiveRuleData] = useState<IRule | null>(null);
  const [activeKeys, setActiveKeys] = useState<string[]>(['Information']); // or [] initially
  const username = localStorage.getItem('config_svc_username')?.toLowerCase() || '';


  const { canCreateRuleConfig, canEditConfig, canReviewConfig } = usePrivileges();

  const handleSearchRule = useCallback((confirm: () => void) => {
    if (searchText.trim().length) {
      setConfigs(
        ...[ruleConfigs.filter((rule) =>
          rule?.desc?.toLowerCase().includes(searchText.toLowerCase())
        ).map((config) => ({
          ...config,
          _key: config._key || config._id || generateRandomString(ruleConfigs.length)
        }))]
      );
      confirm();

    }
  }, [searchText, ruleConfigs]);


  useEffect(() => {
    setConfigs([...ruleConfigs.map((config) => ({
      ...config,
      _key: config._key || config._id || generateRandomString(ruleConfigs.length)
    }))]);
  }, [ruleConfigs]);


  const expandedRowRender = useCallback((rule: IRule) => {
    const data = (rule.ruleConfigs || []).map((config) => ({
      ...config,
      _key: config._key || config._id || generateRandomString(ruleConfigs.length)
    }));

    const handleSearchConfig = (confirm: () => void) => {
      if (searchConfigText.trim().length) {
        setSearchSubmitted(true);
        setSearchConfigResults(...[data.filter((config) =>
          config?.desc?.toLowerCase().includes(searchConfigText.toLowerCase())
        ).map((config) => ({
          ...config,
          _key: config._key || config._id || generateRandomString(ruleConfigs.length)
        }))]);
        confirm();
      }
    };

    return <ConfigTable
      data={data}
      searchConfigResults={searchConfigResults}
      searchConfigText={searchConfigText}
      searchSubmitted={searchSubmitted}
      setSearchConfigText={setSearchConfigText}
      setSearchSubmitted={setSearchSubmitted}
      handleSearchConfig={handleSearchConfig}
      canEditConfig={canEditConfig} canReviewConfig={canReviewConfig}
    />;
  }, [searchConfigText, searchConfigResults, searchSubmitted, canEditConfig, canReviewConfig, ruleConfigs.length]);


  const columns: TableColumnsType<IRule> = useMemo(() => {
    return [
      {
        title: commonTranslations('rulesListPage.table.name'), dataIndex: 'name', key: 'name',
        showSorterTooltip: { target: 'full-header' },
        sorter: (a: IRule, b: IRule) => a.name.localeCompare(b.name),
        filters: uniqueArray(ruleConfigs, 'name').map((obj) => ({ text: obj.name, value: obj.name.toLowerCase() })),
        onFilter: (value, record) => record.name.toLowerCase().includes(value as string),
      },
      {
        title: commonTranslations('rulesListPage.table.version'), dataIndex: 'cfg', key: 'cfg',
        showSorterTooltip: { target: 'full-header' },
        sorter: (a: IRule, b: IRule) => a.cfg.localeCompare(b.cfg),
        filters: uniqueArray(ruleConfigs, 'cfg').map((obj) => ({ text: obj.cfg, value: obj.cfg.toLowerCase() })),
        onFilter: (value, record) => record.cfg.toLowerCase().includes(value as string),
      },
      {
        title: commonTranslations('rulesListPage.table.description'), dataIndex: 'desc', key: 'desc',
        sorter: (a: IRule, b: IRule) => a.desc.localeCompare(b.desc),
        filtered: !!searchText.trim().length,
        onFilter: (value, record) => record.desc.toLowerCase().includes(value as string),
        filterDropdown: ({ confirm, clearFilters }: any) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder={commonTranslations('rulesListPage.searchDescription')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={() => handleSearchRule(confirm)}
              className={styles['input-description-search']}

            />
            <Space>
              <Button
                type="primary"
                onClick={() => handleSearchRule(confirm)}
                size="small"
                className={styles['reset-button']}
              >
                {commonTranslations('rulesListPage.search')}

              </Button>
              <Button
                onClick={() => {
                  setSearchText('');
                  clearFilters();
                  confirm();
                  setConfigs(ruleConfigs);
                }}
                size="small" style={{ width: 90 }}>
                {commonTranslations('rulesListPage.reset')}
              </Button>
            </Space>
          </div>
        ),
      },
      {
        title: commonTranslations('rulesListPage.table.state'), dataIndex: 'state', key: 'state', defaultSortOrder: 'descend',
        sorter: (a: IRule, b: IRule) => a.state.localeCompare(b.state),
        onFilter: (value, record) => record.state.toLowerCase().includes(value as string),
        filters: uniqueArray(ruleConfigs, 'state').map((obj) => ({ text: obj.state, value: obj.state.toLowerCase() })),
      },
      {
        title: commonTranslations('rulesListPage.table.owner'), dataIndex: 'ownerId', key: 'ownerId',
        defaultSortOrder: 'descend',
        sorter: (a: IRule, b: IRule) => a.ownerId.localeCompare(b.ownerId),
        onFilter: (value, record) => record.ownerId.toLowerCase().includes(value as string),
        filters: uniqueArray(ruleConfigs, 'ownerId').map((obj) => ({ text: obj.ownerId, value: obj.ownerId.toLowerCase() })),
      },
      {
        title: commonTranslations('rulesListPage.table.createdAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (text: string) => text ? new Date(text).toDateString() : 'N/A', // Formats as 'Tue Jun 24 2025'
        sorter: (a: IRule, b: IRule) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      },
      {
        title: commonTranslations('rulesListPage.table.updatedAt'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (text: string) => text ? new Date(text).toDateString() : 'N/A', // Formats as 'Tue Jun 24 2025'
        sorter: (a: IRule, b: IRule) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      },
      {
        title: commonTranslations('rulesListPage.table.action'),
        key: 'action',
        render: (_, record) => (
          <Space size="middle">
            {canCreateRuleConfig && (
              <Button
                type="link"
                onClick={() => {
                  setActiveRuleData(record); // optionally pass record
                  setDrawerOpen(true);
                }}
              >
                {commonTranslations('rulesConfigListPage.createConfig')}
              </Button>
            )}
          </Space>

        ),
      },
    ];
  }, [canCreateRuleConfig, commonTranslations, ruleConfigs, searchText, handleSearchRule]);


  return (
    <>
      {error && <Alert
        message="Error"
        showIcon
        description={error}
        type="error"
        className={styles['alert']}
        action={
          <Button size="small" data-testid="retry-button" danger onClick={() => retry()}>
            {commonTranslations('rulesListPage.retry')}
          </Button>
        }
      />}
      <Table
        data-testid="rule-config-view"
        columns={columns}
        expandable={{ expandedRowRender, defaultExpandedRowKeys: ['0'] }}
        dataSource={configs}
        rowKey={'_key'}
        loading={loading}
        pagination={{
          pageSize: 10, current: page, onChange(page, pageSize) {
            onPageChange(page, pageSize)
          },
          total
        }}
      />


      <ConfigForm
        open={drawerOpen}
        setOpen={setDrawerOpen}
        loading={loading}
        setLoading={() => { }} // optionally connect to real loader
        success=""
        serverError=""
        activeKeys={activeKeys}
        setActiveKey={setActiveKeys}
        conditions={[]} // optionally connect to actual conditions if required
        setConditions={() => { }}
        handleClose={() => setDrawerOpen(false)}
        rule={activeRuleData}
        onSubmit={async (data) => {
          const version = `${data.major}.${data.minor || 0}.${data.patch || 0}`;
          const ruleName = activeRuleData?.name;

          try {
            // Step 1: Check for duplicate version
            const response = await getRuleAndConfigs(ruleName);
            const existingVersions = response.ruleConfigs.map((cfg: any) => cfg.cfg);

            if (existingVersions.includes(version)) {
              Modal.warning({
                title: "Duplicate Version Detected",
                content: `A rule config with version ${version} already exists for rule "${ruleName}". Please choose a different version.`,
                okText: "OK",
                okButtonProps: {
                  style: {
                    backgroundColor: "#2358BE", // Blue for warning
                    color: "#fff",
                    border: "none",
                  },
                },
              });
              return;
            }

            // Transform exitConditions before sending
            const transformedExitConditions = (data.exitConditions || []).map((condition: any) => ({
                subRuleRef: condition.id, // Map 'id' from frontend object to 'subRuleRef' for API
                reason: condition.reason, // 'reason' remains 'reason'
            }));

            // Step 2: Submit rule config
            await postRuleConfig({
              ruleId: `rule/${activeRuleData?._key || activeRuleData?._id}`,
              desc: data.description,
              cfg: version,
              ownerId: username,
              config: {
                parameters: data.parameters || [],
                exitConditions: transformedExitConditions || [],
                bands: data.category === 'isBand' ? [
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
                ] : [],
                cases: data.category === 'isCase' ? data.cases : [],
              }
            });

            Modal.success({
              title: commonTranslations('createRuleConfigPage.success') || "Rule Config Created", // Use translation for consistency
              content: commonTranslations('createRuleConfigPage.success') || "The rule configuration was successfully created.", // Use translation
              okText: commonTranslations('createRuleConfigPage.ok') || "OK", // Use translation
              okButtonProps: {
                style: {
                  backgroundColor: '#52c41a', // Green for success
                  borderColor: '#52c41a',
                },
              },
              onOk: () => {
                setDrawerOpen(false); // Close the main drawer
                retry(); // IMPORTANT: Refetch the ruleConfigs table here
              },
            });

          } catch (error: any) {
            console.error("Error submitting config:", error);
            Modal.error({
              title: commonTranslations('createRuleConfigPage.submissionFailedTitle') || "Submission Failed", // Use translation
              content: error?.response?.data?.message || error.message || commonTranslations('generalError') || "Unknown error occurred.", // Use translation
              okText: commonTranslations('createRuleConfigPage.ok') || "OK", // Use translation
              okButtonProps: {
                style: {
                  backgroundColor: "#f5222d", // Red for error
                  color: "#fff",
                  border: "none",
                },
              },
              onOk: () => {
                // If the drawer should close on error, uncomment the line below.
                // setDrawerOpen(false);
                // No need to retry here as the submission failed.
              },
            });
          }
        }}

      />


    </>
  );
};

export default RuleConfig;