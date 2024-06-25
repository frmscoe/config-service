import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Input, Space, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import styles from './RuleDetailPage.module.scss';
import { useCommonTranslations } from '~/hooks';
import { IRule } from './service';
import { uniqueArray } from '~/utils/uniqueItems';
import { IUserProfile } from '~/context/auth';
import Link from 'next/link';


const CreateRule = React.lazy(() => import('../CreateRule/index'))
interface Props {
    loading: boolean;
    error: string;
    retry(page?: number): void;
    page: number,
    data: IRule[],
    total: number;
    onPageChange(page: number, pageSize: number): void,
    open: boolean;
    setOpen(val: boolean): void;
    user: IUserProfile;
}

const Rule: React.FunctionComponent<Props> = ({ loading, error, retry, data, total, onPageChange, page, open, setOpen, user }) => {
    const { t: commonTranslations } = useCommonTranslations();
    const [searchText, setSearchText] = useState<string>('');
    const [rules, setRules] = useState<IRule[]>([]);

    const canCreate = useMemo(() => {
        return user?.privileges?.includes('SECURITY_CREATE_RULE')
    }, [user])

    const canEdit = useMemo(() => {
        return user?.privileges?.includes('SECURITY_UPDATE_RULE')
    }, [user])

    const canReview = useMemo(() => {
        return user?.privileges?.includes('SECURITY_GET_RULE')
    }, [user])


    useEffect(() => {
        setRules([...data]);
    }, [data])

    const handleSearch = useCallback((confirm: () => void) => {
        if (searchText.trim().length) {
            setRules(
                ...[data.filter((rule) =>
                    rule.desc.toLowerCase().includes(searchText.toLowerCase())
                )]
            );
            confirm();

        }
    }, [searchText]);


    const columns: TableColumnsType<IRule> = useMemo(() => {
        return [
            {
                title: commonTranslations('rulesListPage.table.name'),
                dataIndex: 'name',
                showSorterTooltip: { target: 'full-header' },
                sorter: (a: IRule, b: IRule) => a.state.localeCompare(b.name),
                filters: uniqueArray(data, 'cfg').map((obj) => ({ text: obj.name, value: obj.name.toLowerCase() })),
                onFilter: (value, record) => record.name.toLowerCase().includes(value as string),

            },
            {
                title: commonTranslations('rulesListPage.table.version'),
                dataIndex: 'cfg',
                showSorterTooltip: { target: 'full-header' },
                sorter: (a: IRule, b: IRule) => a.state.localeCompare(b.cfg),
                filters: uniqueArray(data, 'cfg').map((obj) => ({ text: obj.cfg, value: obj.cfg.toLowerCase() })),
                onFilter: (value, record) => record.cfg.toLowerCase().includes(value as string),

            },
            {
                title: commonTranslations('rulesListPage.table.description'),
                dataIndex: 'desc',
                defaultSortOrder: 'descend',
                sorter: (a: IRule, b: IRule) => a.state.localeCompare(b.desc),
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
                                    setRules(data);
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
                sorter: (a: IRule, b: IRule) => a.state.localeCompare(b.state),
                onFilter: (value, record) => record.state.toLowerCase().includes(value as string),
                filters: uniqueArray(data, 'state').map((obj) => ({ text: obj.state, value: obj.state.toLowerCase() })),

            },
            {
                title: commonTranslations('rulesListPage.table.owner'),
                dataIndex: 'ownerId',
                defaultSortOrder: 'descend',
                sorter: (a: IRule, b: IRule) => a.state.localeCompare(b.ownerId),
                onFilter: (value, record) => record.ownerId.toLowerCase().includes(value as string),
                filters: uniqueArray(data, 'ownerId').map((obj) => ({ text: obj.ownerId, value: obj.ownerId.toLowerCase() })),

            },
            {
                title: commonTranslations('rulesListPage.table.updatedAt'),
                dataIndex: 'updatedAt',
                render: (text: string) => new Date(text).toDateString(),
                sorter: (a: IRule, b: IRule) => a.createdAt.localeCompare(b.updatedAt)
            },
            {
                title: commonTranslations('rulesListPage.table.action'),
                key: 'action',
                render: (_, record) => (
                    <Space size="middle">
                        {canEdit && <Button type='link'>{commonTranslations('rulesListPage.table.modify')} </Button>}
                       {canReview && <Button type='link'>
                        <Link href={`/rule/${record._key}/review`}>{commonTranslations('rulesListPage.table.review')}</Link>
                         </Button>}
                    </Space>
                ),
            },
        ];
    }, [commonTranslations, data, searchText, canEdit])
    return (
        <>
           {canCreate ? <div>
                <Button className={styles['create-button']} onClick={() => setOpen(true)}>
                    {commonTranslations('rulesListPage.create')}
                </Button>
            </div> : <div/>}

            <Suspense>
                <CreateRule
                    open={open}
                    setOpen={setOpen}
                    afterCreate={() => {
                        retry(1);
                    }}
                />
            </Suspense>

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
                data-testid="rule-view"
                columns={columns}
                dataSource={rules}
                showSorterTooltip={{ target: 'sorter-icon' }}
                loading={loading}
                pagination={{ total: total, pageSize: 10, onChange: onPageChange, current: page }}
                rowKey="_key"
            />
        </>
    )
}

export default Rule;
