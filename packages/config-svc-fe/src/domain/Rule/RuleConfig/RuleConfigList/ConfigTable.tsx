// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { TableColumnsType, Input, Space, Button, Table, Modal } from "antd";
import { uniqueArray } from "~/utils/uniqueItems";
import { IRuleConfig } from "./types";
import styles from './RuleConfigList.module.scss';
import { useMemo, useState } from "react";
import { useCommonTranslations } from "~/hooks";
import Link from "next/link";
import usePrivileges from "~/hooks/usePrivileges"; // Keep this import
import { canTransition } from '../../../../../machine/guards'; // Keep this import


export interface IProps {
  searchConfigText: string;
  handleSearchConfig(confirm: () => void): void;
  setSearchConfigText(val: string): void;
  data: IRuleConfig[];
  setSearchSubmitted(val: boolean): void;
  canEditConfig: boolean; // Note: This prop is now redundant if using canTransition
  canReviewConfig: boolean; // Note: This prop is now redundant if using canTransition
  searchSubmitted: boolean;
  searchConfigResults: IRuleConfig[];
}

export const ConfigTable: React.FunctionComponent<IProps> = ({
  searchConfigText,
  handleSearchConfig,
  setSearchConfigText,
  data,
  setSearchSubmitted,
  searchSubmitted,
  searchConfigResults
}) => {
  const { t: commonTranslations } = useCommonTranslations();
  const { privileges } = usePrivileges();
  const [selectedConfig, setSelectedConfig] = useState<IRuleConfig | null>(null);
  const username = localStorage.getItem('config_svc_username')?.toLowerCase() || '';

  const columns: TableColumnsType<IRuleConfig> = useMemo(() => {
    return [
      {
        title: commonTranslations('rulesConfigListPage.table.version'),
        dataIndex: 'cfg',
        key: 'cfg',
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
          <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
            <Input
              placeholder={commonTranslations('rulesConfigListPage.table.searchVersion')}
              value={searchConfigText}
              onChange={(e) => {
                const value = e.target.value;
                setSearchConfigText(value);
                setSearchSubmitted(false);
                setSelectedKeys(value ? [value] : []);
              }}
              onPressEnter={() => handleSearchConfig(confirm)}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => handleSearchConfig(confirm)}
                icon={<i className="fa-solid fa-search" />}
                size="small"
                style={{ width: 90 }}
              >
                {commonTranslations('rulesConfigListPage.table.search')}
              </Button>
              <Button
                onClick={() => {
                  clearFilters && clearFilters();
                  setSearchConfigText('');
                  setSearchSubmitted(false);
                }}
                size="small"
                style={{ width: 90 }}
              >
                {commonTranslations('rulesConfigListPage.table.reset')}
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  close();
                }}
              >
                {commonTranslations('rulesConfigListPage.table.close')}
              </Button>
            </Space>
          </div>
        ),
        filterIcon: (filtered: boolean) => (
          <i className="fa-solid fa-search" style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) => {
          if (typeof value === 'string') {
            return record.cfg?.toLowerCase().includes(value.toLowerCase());
          }
          return false;
        },
      },
      {
        title: commonTranslations('rulesConfigListPage.table.state'),
        dataIndex: 'state',
        key: 'state',
        filters: uniqueArray(data.map((item) => item.state)).map((state) => ({ text: state, value: state })),
        onFilter: (value, record) => typeof value === 'string' && record.state.includes(value),
      },
      {
        title: commonTranslations('rulesConfigListPage.table.description'),
        dataIndex: 'desc',
        key: 'desc',
      },
      {
        title: commonTranslations('rulesConfigListPage.table.owner'),
        dataIndex: 'ownerId',
        key: 'ownerId',
      },
      {
        title: commonTranslations('rulesConfigListPage.table.createdAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (text: string) => text ? new Date(text).toDateString() : 'N/A', // Applied date formatting
        sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      },
      {
        title: commonTranslations('rulesConfigListPage.table.updatedAt'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (text: string) => text ? new Date(text).toDateString() : 'N/A', // Applied date formatting
        sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      },
      {
        title: commonTranslations('rulesConfigListPage.table.action'),
        key: 'action',
        render: (_, record) => (
          <Space size="middle">
            {/* UPDATED: Add conditional check for Modify button */}
            {/*{canTransition(privileges, 'RULE_CONFIG', record.state, 'EDIT') && (
              <Link href={`/rule-config/${record._key}/edit`}>
                <Button type="link">
                  {commonTranslations('rulesListPage.table.modify')}
                </Button>
              </Link>
            )}*/}

            {canTransition(privileges, 'RULE_CONFIG', record.state, 'EDIT') &&
              record.ownerId?.toLowerCase() === username && (
                <Link href={`/rule-config/${record._key}/edit`}>
                  <Button type="link">
                    {commonTranslations('rulesListPage.table.modify')}
                  </Button>
                </Link>
            )}


            {canTransition(privileges, 'RULE_CONFIG', record.state, 'REVIEW') && (
              <Button type="link">
                <Link href={`/rule-config/${record._key}/review`}>
                  {commonTranslations('rulesListPage.table.review')}
                </Link>
              </Button>
            )}
          </Space>
        ),
      },
    ];
  }, [data, searchConfigText, searchSubmitted, privileges, commonTranslations, handleSearchConfig, setSearchConfigText, setSearchSubmitted]);

  return (
    <Table
      rowKey={'_key'}
      columns={columns}
      dataSource={searchConfigText?.trim().length && searchSubmitted ? searchConfigResults : data}
    />
  );
};