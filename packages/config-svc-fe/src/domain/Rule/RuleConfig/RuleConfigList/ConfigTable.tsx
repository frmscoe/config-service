import { TableColumnsType, Input, Space, Button, Table, Modal } from "antd";
import { uniqueArray } from "~/utils/uniqueItems";
import { IRuleConfig } from "./types";
import styles from './RuleConfigList.module.scss';
import { useMemo, useState } from "react";
import { useCommonTranslations } from "~/hooks";
import Link from "next/link";
import usePrivileges from "~/hooks/usePrivileges";
import { canTransition } from '../../../../../machine/guards';


export interface IProps {
  searchConfigText: string;
  handleSearchConfig(confirm: () => void): void;
  setSearchConfigText(val: string): void;
  data: IRuleConfig[];
  setSearchSubmitted(val: boolean): void;
  canEditConfig: boolean;
  canReviewConfig: boolean;
  searchSubmitted: boolean;
  searchConfigResults: IRuleConfig[];
}

export const ConfigTable: React.FunctionComponent<IProps> = ({
  searchConfigText,
  handleSearchConfig,
  setSearchConfigText,
  data,
  setSearchSubmitted,
  canEditConfig,
  canReviewConfig,
  searchSubmitted,
  searchConfigResults
}) => {
  const { t: commonTranslations } = useCommonTranslations();
  const { privileges } = usePrivileges();
  const [selectedConfig, setSelectedConfig] = useState<IRuleConfig | null>(null);

  const columns: TableColumnsType<IRuleConfig> = useMemo(() => {
    return [
      {
        title: commonTranslations('rulesConfigListPage.table.version'),
        dataIndex: 'cfg',
        key: 'cfg',
        showSorterTooltip: { target: 'full-header' },
        sorter: (a, b) => a.state.localeCompare(b.cfg),
        filters: uniqueArray(data, 'cfg').map(obj => ({ text: obj.cfg, value: obj.cfg.toLowerCase() })),
        onFilter: (value, record) => record.cfg.toLowerCase().includes(value as string),
      },
      {
        title: commonTranslations('rulesConfigListPage.table.description'),
        dataIndex: 'desc',
        key: 'desc',
        defaultSortOrder: 'descend',
        filtered: !!(searchConfigText?.trim().length && searchSubmitted),
        filterDropdown: ({ confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder={commonTranslations('rulesListPage.searchDescription')}
              value={searchConfigText}
              onChange={(e) => {
                setSearchConfigText(e.target.value);
                setSearchSubmitted(false);
              }}
              onPressEnter={() => handleSearchConfig(confirm)}
              className={styles['input-description-search']}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => handleSearchConfig(confirm)}
                size="small"
                className={styles['reset-button']}
              >
                {commonTranslations('rulesListPage.search')}
              </Button>
              <Button
                onClick={() => {
                  setSearchConfigText('');
                  clearFilters();
                  confirm();
                }}
                size="small"
                style={{ width: 90 }}
              >
                {commonTranslations('rulesListPage.reset')}
              </Button>
            </Space>
          </div>
        )
      },
      {
        title: commonTranslations('rulesConfigListPage.table.state'),
        dataIndex: 'state',
        key: 'state',
        showSorterTooltip: { target: 'full-header' },
        sorter: (a, b) => a.state.localeCompare(b.state),
        filters: uniqueArray(data, 'state').map(obj => ({ text: obj.state, value: obj.state.toLowerCase() })),
        onFilter: (value, record) => record.state.toLowerCase().includes(value as string),
      },
      {
        title: commonTranslations('rulesConfigListPage.table.owner'),
        dataIndex: 'ownerId',
        showSorterTooltip: { target: 'full-header' },
        sorter: (a, b) => a.ownerId.localeCompare(b.ownerId),
        filters: uniqueArray(data, 'ownerId').map(obj => ({ text: obj.ownerId, value: obj.ownerId.toLowerCase() })),
        onFilter: (value, record) => record.ownerId.toLowerCase().includes(value as string),
      },
      {
        title: commonTranslations('rulesConfigListPage.table.updatedAt'),
        dataIndex: 'updatedAt',
        key: 'updatedAt'
      },
      {
        title: commonTranslations('rulesConfigListPage.table.action'),
        key: 'action',
        render: (_, record) => (
          <Space size="middle">
            {canTransition(privileges, 'RULE_CONFIG', record.state, 'EDIT') && (
              // <Button type="link" onClick={() => {
              //   if (record.state !== '01_DRAFT') {
              //     Modal.confirm({
              //       title: 'Confirmation',
              //       content: 'Do you wish to create a new version of this rule config?',
              //       okButtonProps: {
              //         className: 'bg-green-500 text-white'
              //       },
              //       onOk: () => {
              //         setSelectedConfig(record);
              //         // handleEdit logic here
              //       }
              //     });
              //   } else {
              //     setSelectedConfig(record);
              //     // handleEdit logic here
              //   }
              // }}>
              //   {commonTranslations('rulesListPage.table.modify')}
              // </Button>
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
        )
      },
    ];
  }, [data, searchConfigText, searchSubmitted, privileges]);

  return (
    <Table
      rowKey={'_key'}
      columns={columns}
      dataSource={searchConfigText?.trim().length && searchSubmitted ? searchConfigResults : data}
    />
  );
};
