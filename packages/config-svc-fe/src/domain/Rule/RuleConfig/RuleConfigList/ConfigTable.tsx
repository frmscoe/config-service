import { TableColumnsType, Input, Space, Button, Table } from "antd";
import { uniqueArray } from "~/utils/uniqueItems";
import { IRuleConfig } from "./types";
import styles from './RuleConfigList.module.scss';
import { useMemo } from "react";
import { useCommonTranslations } from "~/hooks";

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
    handleSearchConfig, setSearchConfigText, data, setSearchSubmitted, canEditConfig,
    canReviewConfig, searchSubmitted, searchConfigResults
}) => {
    const { t: commonTranslations } = useCommonTranslations()
    const columns: TableColumnsType<IRuleConfig> = useMemo(() => {
        return [
            {
                title: commonTranslations('rulesConfigListPage.table.version'), dataIndex: 'cfg', key: 'cfg',
                showSorterTooltip: { target: 'full-header' },
                sorter: (a: IRuleConfig, b: IRuleConfig) => a.state.localeCompare(b.cfg),
                filters: uniqueArray(data, 'cfg').map((obj) => ({ text: obj.cfg, value: obj.cfg.toLowerCase() })),
                onFilter: (value, record) => record.cfg.toLowerCase().includes(value as string),
            },
            {
                title: commonTranslations('rulesConfigListPage.table.description'), dataIndex: 'desc', key: 'desc',
                defaultSortOrder: 'descend',
                filtered: !!(searchConfigText?.trim().length && searchSubmitted),
                filterDropdown: ({ confirm, clearFilters }: any) => (
                    <div style={{ padding: 8 }}>
                        <Input
                            placeholder={commonTranslations('rulesListPage.searchDescription')}
                            value={searchConfigText}
                            onChange={(e) => {
                                setSearchConfigText(e.target.value)
                                setSearchSubmitted(false)
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
                                size="small" style={{ width: 90 }}>
                                {commonTranslations('rulesListPage.reset')}
                            </Button>
                        </Space>
                    </div>
                ),

            },
            {
                title: commonTranslations('rulesConfigListPage.table.state'), dataIndex: 'state', key: 'state',
                showSorterTooltip: { target: 'full-header' },
                sorter: (a: IRuleConfig, b: IRuleConfig) => a.state.localeCompare(b.state),
                filters: uniqueArray(data, 'state').map((obj) => ({ text: obj.state, value: obj.state.toLowerCase() })),
                onFilter: (value, record) => record.state.toLowerCase().includes(value as string),
            },
            {
                title: commonTranslations('rulesConfigListPage.table.owner'),
                dataIndex: 'ownerId',
                showSorterTooltip: { target: 'full-header' },
                sorter: (a: IRuleConfig, b: IRuleConfig) => a.ownerId.localeCompare(b.ownerId),
                filters: uniqueArray(data, 'ownerId').map((obj) => ({ text: obj.ownerId, value: obj.ownerId.toLowerCase() })),
                onFilter: (value, record) => record.ownerId.toLowerCase().includes(value as string),
            },
            { title: commonTranslations('rulesConfigListPage.table.updatedAt'), dataIndex: 'updatedAt', key: 'updatedAt' },
            {
                title: commonTranslations('rulesConfigListPage.table.action'),
                key: 'action',
                render: (_, record) => (
                    <Space size="middle">
                        {canEditConfig && <Button type='link'>{commonTranslations('rulesListPage.table.modify')} </Button>}
                        {canReviewConfig && <Button type='link'>{commonTranslations('rulesListPage.table.review')} </Button>}
                    </Space>
                ),
            },
        ]
    }, [canEditConfig, canReviewConfig, data, searchConfigText, searchSubmitted]);


    return <Table rowKey={'_key'}
        columns={columns} dataSource={searchConfigText?.trim().length && searchSubmitted ? searchConfigResults : data} />;
}