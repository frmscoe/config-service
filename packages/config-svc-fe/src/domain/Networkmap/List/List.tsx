import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Input, Space, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import styles from './styles.module.scss';
import { useCommonTranslations } from '~/hooks';
import { uniqueArray } from '~/utils/uniqueItems';
import { IUserProfile } from '~/context/auth';
import Link from 'next/link';


interface Props {
    loading: boolean;
    error: string;
    retry(page?: number): void;
    page: number,
    data: any[],
    total: number;
    onPageChange(page: number, pageSize: number): void,
    user: IUserProfile;
}

const NetworkMapList: React.FunctionComponent<Props> = ({ 
    loading, 
    error, 
    retry, 
    data, 
    total, 
    onPageChange, 
    page, 
    user 
}) => {
    const { t: commonTranslations } = useCommonTranslations();
    const [searchText, setSearchText] = useState<string>('');
    const [networkMaps, setNetworkMaps] = useState<any[]>([]);

    const canCreate = useMemo(() => {
        return user?.privileges?.includes('SECURITY_CREATE_RULE')
    }, [user]);

    const canEdit = useMemo(() => {
        return user?.privileges?.includes('SECURITY_UPDATE_RULE')
    }, [user]);


    useEffect(() => {
        setNetworkMaps([...data]);
    }, [data])

    const handleSearch = useCallback((confirm: () => void) => {
        if (searchText.trim().length) {
            setNetworkMaps(
                ...[data.filter((rule) =>
                    rule.desc.toLowerCase().includes(searchText.toLowerCase())
                )]
            );
            confirm();

        }
    }, [searchText]);


    const columns: TableColumnsType<any> = useMemo(() => {
        return [
            {
                title: commonTranslations('rulesListPage.table.name'),
                dataIndex: 'name',
                showSorterTooltip: { target: 'full-header' },
                sorter: (a: any, b: any) => a.state.localeCompare(b.name),
                filters: uniqueArray(data, 'cfg').map((obj) => ({ text: obj.name, value: obj.name.toLowerCase() })),
                onFilter: (value, record) => record.name.toLowerCase().includes(value as string),

            },
            {
                title: commonTranslations('rulesListPage.table.version'),
                dataIndex: 'cfg',
                showSorterTooltip: { target: 'full-header' },
                sorter: (a: any, b: any) => a.state.localeCompare(b.cfg),
                filters: uniqueArray(data, 'cfg').map((obj) => ({ text: obj.cfg, value: obj.cfg.toLowerCase() })),
                onFilter: (value, record) => record.cfg.toLowerCase().includes(value as string),

            },
            {
                title: commonTranslations('rulesListPage.table.description'),
                dataIndex: 'desc',
                defaultSortOrder: 'descend',
                sorter: (a: any, b: any) => a.state.localeCompare(b.desc),
                onFilter: (value, record) => record.desc.toLowerCase().includes(value as string),
                filterDropdown: ({ confirm, clearFilters }: any) => (
                    <div style={{ padding: 8 }}>
                        <Input
                            placeholder={commonTranslations('rulesListPage.searchDescription')}
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
                                {commonTranslations('rulesListPage.search')}

                            </Button>
                            <Button
                                onClick={() => {
                                    setSearchText('');
                                    clearFilters();
                                    confirm();
                                    setNetworkMaps(data);
                                }}
                                size="small" style={{ width: 90 }}>
                                {commonTranslations('rulesListPage.reset')}
                            </Button>
                        </Space>
                    </div>
                ),
            },
            {
                title: commonTranslations('rulesListPage.table.state'),
                dataIndex: 'state',
                defaultSortOrder: 'descend',
                sorter: (a: any, b: any) => a.state.localeCompare(b.state),
                onFilter: (value, record) => record.state.toLowerCase().includes(value as string),
                filters: uniqueArray(data, 'state').map((obj) => ({ text: obj.state, value: obj.state.toLowerCase() })),

            },
            {
                title: commonTranslations('rulesListPage.table.owner'),
                dataIndex: 'ownerId',
                defaultSortOrder: 'descend',
                sorter: (a: any, b: any) => a.state.localeCompare(b.ownerId),
                onFilter: (value, record) => record.ownerId.toLowerCase().includes(value as string),
                filters: uniqueArray(data, 'ownerId').map((obj) => ({ text: obj.ownerId, value: obj.ownerId.toLowerCase() })),

            },
            {
                title: commonTranslations('rulesListPage.table.updatedAt'),
                dataIndex: 'updatedAt',
                render: (text: string) => new Date(text).toDateString(),
                sorter: (a: any, b: any) => a.createdAt.localeCompare(b.updatedAt)
            },
            {
                title: commonTranslations('rulesListPage.table.action'),
                key: 'action',
                render: (_, record) => (
                    <Space size="middle">
                        {canEdit && <Link className='text-blue-500' href={`/network-map/${record._key}/edit`} type='link'>{commonTranslations('rulesListPage.table.modify')} </Link>}
                    </Space>
                ),
            },
        ];
    }, [commonTranslations, data, searchText, canEdit])
    return (
        <>
            {canCreate ? <div>
                <Link href="/network-map/create" >
                    <Button type="default" className={styles['create-button']}>
                    {commonTranslations('rulesListPage.create')}
                    </Button>
                </Link>
            </div> : <div />}

            {error && <Alert
                message="Error"
                showIcon
                description={error}
                type="error"
                className={styles['alert']}
                action={
                    <Button size="small" danger data-testid="retry-button" onClick={() => retry()}>
                        {commonTranslations('rulesListPage.retry')}
                    </Button>
                }
            />}

            <Table
                data-testid="network-map-view"
                columns={columns}
                dataSource={networkMaps}
                showSorterTooltip={{ target: 'sorter-icon' }}
                loading={loading}
                pagination={{ total: total, pageSize: 10, onChange: onPageChange, current: page }}
                rowKey="_key"
            />
        </>
    )
}

export default NetworkMapList;
