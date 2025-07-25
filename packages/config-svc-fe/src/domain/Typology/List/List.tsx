// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Input, Space, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import styles from './style.module.scss';
import { useCommonTranslations } from '~/hooks';
import { ITypology } from './service';
import { uniqueArray } from '~/utils/uniqueItems';
import usePrivileges from '~/hooks/usePrivileges';
import { canTransition } from '../../../../machine/guards'; // Ensure this import path is correct
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

    const { privileges, canUpdateTypology, canCreateTypology, canViewTypology } = usePrivileges();

    useEffect(() => {
        setTypologies([...data]);
    }, [data]);

    const handleSearch = useCallback((confirm: () => void) => {
        if (searchText.trim().length) {
            setTypologies(
                data.filter((typology) =>
                    typology.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    typology.desc.toLowerCase().includes(searchText.toLowerCase())
                )
            );
            confirm();
        } else {
            setTypologies(data);
            confirm();
        }
    }, [searchText, data]);

    const handleReset = useCallback(
        (clearFilters: () => void) => {
            clearFilters();
            setSearchText('');
            setTypologies(data);
        },
        [data],
    );

    const columns: TableColumnsType<ITypology> = useMemo(() => {
        return [
            {
                title: commonTranslations('typologyListPage.table.name'),
                dataIndex: 'name',
                showSorterTooltip: { target: 'full-header' },
                sorter: (a: ITypology, b: ITypology) => a.name.localeCompare(b.name),
                filters: uniqueArray(data.map(t => t.name)).map(name => ({ text: name, value: name })),
                onFilter: (value, record) => record.name.toLowerCase().includes(value as string),
                filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                    <div style={{ padding: 8 }}>
                        <Input
                            placeholder={commonTranslations('typologyListPage.table.searchName')}
                            value={selectedKeys[0]}
                            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                            onPressEnter={() => handleSearch(confirm)}
                            style={{ marginBottom: 8, display: 'block' }}
                        />
                        <Space>
                            <Button
                                type="primary"
                                onClick={() => handleSearch(confirm)}
                                icon={<i className="fa-solid fa-magnifying-glass" />}
                                size="small"
                                style={{ width: 90 }}
                            >
                                {commonTranslations('typologyListPage.search')}
                            </Button>
                            <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                                {commonTranslations('typologyListPage.reset')}
                            </Button>
                        </Space>
                    </div>
                ),
                filterIcon: (filtered: boolean) => (
                    <i className="fa-solid fa-magnifying-glass" style={{ color: filtered ? '#1890ff' : undefined }} />
                ),
            },
            {
                title: commonTranslations('typologyListPage.table.version'),
                dataIndex: 'cfg',
                showSorterTooltip: { target: 'full-header' },
                sorter: (a: ITypology, b: ITypology) => a.cfg.localeCompare(b.cfg, undefined, { numeric: true, sensitivity: 'base' }),
                filters: uniqueArray(data.map(t => t.cfg)).map(cfg => ({ text: cfg, value: cfg })),
                onFilter: (value, record) => record.cfg.toLowerCase().includes(value as string),
            },
            {
                title: commonTranslations('typologyListPage.table.description'),
                dataIndex: 'desc',
                defaultSortOrder: 'descend',
                sorter: (a: ITypology, b: ITypology) => a.desc.localeCompare(b.desc),
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
                                size="small" style={{ width: 90 }}>
                                {commonTranslations('typologyListPage.reset')}
                            </Button>
                        </Space>
                    </div>
                ),
                filterIcon: (filtered: boolean) => (
                    <i className="fa-solid fa-magnifying-glass" style={{ color: filtered ? '#1890ff' : undefined }} />
                ),
            },
            {
                title: commonTranslations('typologyListPage.table.state'),
                dataIndex: 'state',
                defaultSortOrder: 'descend',
                sorter: (a: ITypology, b: ITypology) => a.state.localeCompare(b.state),
                onFilter: (value, record) => record.state.toLowerCase().includes(value as string),
                filters: uniqueArray(data.map(t => t.state)).map((state) => ({ text: state, value: state.toLowerCase() })),
                filterSearch: true,
            },
            {
                title: commonTranslations('typologyListPage.table.owner'),
                dataIndex: 'ownerId',
                defaultSortOrder: 'descend',
                sorter: (a: ITypology, b: ITypology) => a.ownerId.localeCompare(b.ownerId),
                onFilter: (value, record) => record.ownerId.toLowerCase().includes(value as string),
                filters: uniqueArray(data.map(t => t.ownerId)).map((ownerId) => ({ text: ownerId, value: ownerId.toLowerCase() })),
                filterSearch: true,
            },
            {
                title: commonTranslations('typologyListPage.table.createdAt'),
                dataIndex: 'createdAt',
                render: (text: string) => text ? new Date(text).toDateString() : 'N/A', // Changed to toDateString()
                sorter: (a: ITypology, b: ITypology) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            },
            {
                title: commonTranslations('typologyListPage.table.updatedAt'),
                dataIndex: 'updatedAt',
                render: (text: string) => text ? new Date(text).toDateString() : 'N/A', // Changed to toDateString()
                sorter: (a: ITypology, b: ITypology) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
            },
            {
                title: commonTranslations('typologyListPage.table.action'),
                key: 'action',
                render: (_, record) => (
                    <Space size="middle">
                        

                        {canUpdateTypology &&
                          record.ownerId?.toLowerCase() ===
                            (typeof window !== 'undefined'
                              ? localStorage.getItem('config_svc_username')?.toLowerCase()
                              : '') && (
                            <Link href={`/typology/edit/${record._key}`} className='text-blue-500'>
                              {commonTranslations('typologyListPage.table.modify')}
                            </Link>
                        )}


                        

                        {canViewTypology && (
                            <Link href={`/typology/${record._key}/review`} className='text-blue-500'>
                                {commonTranslations('typologyListPage.table.review')}
                            </Link>
                        )}
                        
                        

                        {canUpdateTypology &&
                          record.ownerId?.toLowerCase() ===
                            (typeof window !== 'undefined'
                              ? localStorage.getItem('config_svc_username')?.toLowerCase()
                              : '') && (
                            <Link href={`/typology/${record._key}/score`} className='text-blue-500'>
                                Score
                            </Link>
                        )}


                    </Space>
                ),
            },
        ];
    }, [commonTranslations, data, searchText, privileges, canUpdateTypology, handleSearch, handleReset]);

    return (
        <>
            {/* Create button uses canCreateTypology */}
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
                data-testid="typology-list-view"
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