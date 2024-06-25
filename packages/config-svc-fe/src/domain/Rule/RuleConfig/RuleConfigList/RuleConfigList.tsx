import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { TableColumnsType } from 'antd';
import { Alert, Button, Input, Space, Table } from 'antd';
import { IUserProfile } from '~/context/auth';
import { IRuleConfig } from './types';
import { IRule } from '../../RuleDetailPage/service';
import { useCommonTranslations } from '~/hooks';
import { uniqueArray } from '~/utils/uniqueItems';
import styles from './RuleConfigList.module.scss';
import { ConfigTable } from './ConfigTable';
import usePrivileges from '~/hooks/usePrivileges';
import Link from 'next/link';

interface Props {
    loading: boolean;
    error: string;
    retry(): void;
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
    retry,
}) => {
    const { t: commonTranslations } = useCommonTranslations();
    const [searchText, setSearchText] = useState<string>('');
    const [configs, setConfigs] = useState<IRule[]>([]);
    const [searchConfigText, setSearchConfigText] = useState('');
    const [searchConfigResults, setSearchConfigResults] = useState<IRuleConfig[]>([]);
    const [searchSubmitted, setSearchSubmitted] = useState(false);


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
    }, [searchText]);


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
    }, [user, commonTranslations, searchConfigText, searchConfigResults, searchSubmitted]);


    const columns: TableColumnsType<IRule> = useMemo(() => {
        return [
            {
                title: commonTranslations('rulesListPage.table.name'), dataIndex: 'name', key: 'name',
                showSorterTooltip: { target: 'full-header' },
                sorter: (a: IRule, b: IRule) => a.state.localeCompare(b.name),
                filters: uniqueArray(ruleConfigs, 'name').map((obj) => ({ text: obj.name, value: obj.name.toLowerCase() })),
                onFilter: (value, record) => record.name.toLowerCase().includes(value as string),
            },
            {
                title: commonTranslations('rulesListPage.table.version'), dataIndex: 'cfg', key: 'cfg',
                showSorterTooltip: { target: 'full-header' },
                sorter: (a: IRule, b: IRule) => a.state.localeCompare(b.cfg),
                filters: uniqueArray(ruleConfigs, 'cfg').map((obj) => ({ text: obj.cfg, value: obj.cfg.toLowerCase() })),
                onFilter: (value, record) => record.cfg.toLowerCase().includes(value as string),
            },
            {
                title: commonTranslations('rulesListPage.table.description'), dataIndex: 'desc', key: 'desc',
                sorter: (a: IRule, b: IRule) => a.state.localeCompare(b.desc),
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
                sorter: (a: IRule, b: IRule) => a.state.localeCompare(b.ownerId),
                onFilter: (value, record) => record.ownerId.toLowerCase().includes(value as string),
                filters: uniqueArray(ruleConfigs, 'ownerId').map((obj) => ({ text: obj.ownerId, value: obj.ownerId.toLowerCase() })),
            },
            { title: commonTranslations('rulesListPage.table.updatedAt'), dataIndex: 'updatedAt', key: 'updatedAt' },
            {
                title: commonTranslations('rulesListPage.table.action'),
                key: 'action',
                render: (_, record) => (
                    <Space size="middle">
                        {canCreateRuleConfig && <Button type='link'>
                            <Link href={`/rule-config/${record._key}/new?lastVersion=${ruleConfigs[ruleConfigs.length - 1]?.cfg || 0}`}>                            {commonTranslations('rulesConfigListPage.createConfig')}
                            </Link>
                        </Button>}
                    </Space>
                ),
            },
        ];
    }, [canEditConfig, canReviewConfig, commonTranslations, ruleConfigs, searchText]);


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

        </>
    );
};

export default RuleConfig;