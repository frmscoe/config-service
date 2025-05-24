// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Input, Space, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import styles from './style.module.scss';
import { useCommonTranslations } from '~/hooks';
import { ITypology } from './service';
import { uniqueArray } from '~/utils/uniqueItems';
import usePrivileges from '~/hooks/usePrivileges';
import { canTransition } from '../../../../machine/guards';
import Link from 'next/link';

interface Props {
  loading: boolean;
  error: string;
  retry(page?: number): void;
  page: number;
  data: ITypology[];
  total: number;
  onPageChange(page: number, pageSize: number): void;
}

const List: React.FunctionComponent<Props> = ({ loading, error, retry, data, total, onPageChange, page }) => {
  const { t: commonTranslations } = useCommonTranslations();
  const [searchText, setSearchText] = useState<string>('');
  const [typologies, setTypologies] = useState<ITypology[]>([]);
  const { privileges, canEditTypology, canCreateTypology } = usePrivileges();

  useEffect(() => {
    setTypologies([...data]);
  }, [data]);

  const handleSearch = useCallback(
    (confirm: () => void) => {
      if (searchText.trim().length) {
        setTypologies(
          data.filter((typology) =>
            typology.desc.toLowerCase().includes(searchText.toLowerCase())
          )
        );
        confirm();
      }
    },
    [searchText, data]
  );

  const columns: TableColumnsType<ITypology> = useMemo(() => {
    return [
      {
        title: commonTranslations('typologyListPage.table.name'),
        dataIndex: 'name',
        showSorterTooltip: { target: 'full-header' },
        sorter: (a, b) => a.name.localeCompare(b.name),
        filters: uniqueArray(data, 'name').map((obj) => ({ text: obj.name, value: obj.name.toLowerCase() })),
        onFilter: (value, record) => record.name.toLowerCase().includes(value as string),
      },
      {
        title: commonTranslations('typologyListPage.table.version'),
        dataIndex: 'cfg',
        showSorterTooltip: { target: 'full-header' },
        sorter: (a, b) => a.cfg.localeCompare(b.cfg),
        filters: uniqueArray(data, 'cfg').map((obj) => ({ text: obj.cfg, value: obj.cfg.toLowerCase() })),
        onFilter: (value, record) => record.cfg.toLowerCase().includes(value as string),
      },
      {
        title: commonTranslations('typologyListPage.table.description'),
        dataIndex: 'desc',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.desc.localeCompare(b.desc),
        onFilter: (value, record) => record.desc.toLowerCase().includes(value as string),
        filterDropdown: ({ confirm, clearFilters }: any) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder={commonTranslations('typologyListPage.searchDescription')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={() => handleSearch(confirm)}
              className={styles['input-description-search']}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => handleSearch(confirm)}
                size="small"
                className={styles['reset-button']}
              >
                {commonTranslations('typologyListPage.search')}
              </Button>
              <Button
                onClick={() => {
                  setSearchText('');
                  clearFilters();
                  confirm();
                  setTypologies(data);
                }}
                size="small"
                style={{ width: 90 }}
              >
                {commonTranslations('typologyListPage.reset')}
              </Button>
            </Space>
          </div>
        ),
      },
      {
        title: commonTranslations('typologyListPage.table.state'),
        dataIndex: 'state',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.state.localeCompare(b.state),
        filters: uniqueArray(data, 'state').map((obj) => ({ text: obj.state, value: obj?.state?.toLowerCase() })),
        onFilter: (value, record) => record.state.toLowerCase().includes(value as string),
      },
      {
        title: commonTranslations('typologyListPage.table.owner'),
        dataIndex: 'ownerId',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.ownerId.localeCompare(b.ownerId),
        filters: uniqueArray(data, 'ownerId').map((obj) => ({ text: obj.ownerId, value: obj.ownerId.toLowerCase() })),
        onFilter: (value, record) => record.ownerId.toLowerCase().includes(value as string),
      },
      {
        title: commonTranslations('typologyListPage.table.updatedAt'),
        dataIndex: 'updatedAt',
        render: (text: string) => new Date(text).toDateString(),
        sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
      },
      {
        title: commonTranslations('typologyListPage.table.action'),
        key: 'action',
        render: (_, record) => (
          <Space size="middle">
            {canEditTypology && (
              <Link href={`/typology/edit/${record._key}`} className="text-blue-500">
                {commonTranslations('typologyListPage.table.modify')}
              </Link>
            )}
            {canTransition(privileges, 'TYPOLOGY', record.state, 'REVIEW') && (
              <Link href={`/typology/${record._key}/score`} className="text-blue-500">
                Score
              </Link>
            )}
          </Space>
        ),
      },
    ];
  }, [commonTranslations, data, searchText, canEditTypology, privileges]);

  return (
    <>
      {canCreateTypology ? (
        <div>
          <Button data-testid="create-button" className={styles['create-button']}>
            <Link href="/typology/new">{commonTranslations('typologyListPage.create')}</Link>
          </Button>
        </div>
      ) : (
        <div />
      )}

      {error && (
        <Alert
          message="Error"
          showIcon
          description={error}
          type="error"
          className={styles['alert']}
          action={
            <Button size="small" danger data-testid="retry-button" onClick={() => retry()}>
              {commonTranslations('typologyListPage.retry')}
            </Button>
          }
        />
      )}

      <Table
        data-testid="rule-view"
        columns={columns}
        dataSource={typologies}
        showSorterTooltip={{ target: 'sorter-icon' }}
        loading={loading}
        pagination={{ total: total, pageSize: 10, onChange: onPageChange, current: page }}
        rowKey="_key"
      />
    </>
  );
};

export default List;
