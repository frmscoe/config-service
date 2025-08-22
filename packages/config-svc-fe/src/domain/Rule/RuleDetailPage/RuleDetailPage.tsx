// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Input, Modal, Space, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import styles from './RuleDetailPage.module.scss';
import { useCommonTranslations } from '~/hooks';
import { IRule } from './service';
import { uniqueArray } from '~/utils/uniqueItems';
import { IUserProfile } from '~/context/auth';
import Link from 'next/link';
import { canTransition } from '../../../../machine/guards';
import { PRIVILEGES } from '~/constants/privileges';
import usePrivileges from '~/hooks/usePrivileges';

const CreateRule = React.lazy(() => import('../CreateRule/index'));
const EditRule = React.lazy(() => import('../EditRule/index'));

export interface Props {
    loading: boolean;
    error: string;
    retry(page?: number): void;
    page: number;
    data: IRule[];
    total: number;
    onPageChange(page: number, pageSize: number): void;
    open: boolean;
    setOpen(val: boolean): void;
    openEdit: boolean;
    setOpenEdit(val: boolean): void;
    user: IUserProfile;
    selectedRule: IRule | null;
    setSelectedRule(rule: IRule | null): void;
    filters: {
        desc: string;
        name: string;
        cfg: string;
        state: string;
        ownerId: string;
    };
    setFilters: React.Dispatch<React.SetStateAction<{
        desc: string;
        name: string;
        cfg: string;
        state: string;
        ownerId: string;
    }>>;
    onRuleCreated: () => void; // Used for both create and edit
}

const Rule: React.FunctionComponent<Props> = ({
    loading, error, retry, data, total, onPageChange, page, open, setOpen,
    user, openEdit, setOpenEdit, selectedRule, setSelectedRule,
    filters, setFilters, onRuleCreated
}) => {
    const { t: commonTranslations } = useCommonTranslations();
    const [searchText, setSearchText] = useState<string>('');
    const [rules, setRules] = useState<IRule[]>([]);
    const [modal, contextHolder] = Modal.useModal();
    const { privileges } = usePrivileges();

    const canCreate = useMemo(() => user?.privileges?.includes('SECURITY_CREATE_RULE'), [user]);
    const canEdit = useMemo(() => user?.privileges?.includes('SECURITY_UPDATE_RULE'), [user]);
    const canReview = useMemo(() => user?.privileges?.includes('SECURITY_GET_RULE'), [user]);

    useEffect(() => {
        setRules([...data]);
    }, [data]);

    const handleSearch = useCallback(() => {
        setFilters(prev => ({ ...prev, desc: searchText }));
        retry(1);
    }, [searchText, setFilters, retry]);

    const columns: TableColumnsType<IRule> = useMemo(() => {
        return [
            {
                title: commonTranslations('rulesListPage.table.name'),
                dataIndex: 'name',
                sorter: (a, b) => a.state.localeCompare(b.name),
                filterDropdown: ({ confirm, clearFilters }) => (
                    <div style={{ padding: 8 }}>
                        <Input
                            placeholder="Search name"
                            value={filters.name}
                            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                            onPressEnter={() => {
                                retry(1);
                                confirm();
                            }}
                            style={{ marginBottom: 8, display: 'block' }}
                        />
                        <Space>
                            <Button type="primary" onClick={() => { retry(1); confirm(); }} size="small"
                                style={{ backgroundColor: "#2358BE", color: "#fff", border: "none" }}>Search</Button>
                            <Button onClick={() => { setFilters(prev => ({ ...prev, name: '' })); retry(1); clearFilters(); confirm(); }} size="small">Reset</Button>
                        </Space>
                    </div>
                ),
            },
            {
                title: commonTranslations('rulesListPage.table.version'),
                dataIndex: 'cfg',
                sorter: (a, b) => a.state.localeCompare(b.cfg),
                filteredValue: filters?.cfg ? filters.cfg.split(',') : null,
                filterDropdown: ({ confirm, clearFilters }) => {
                    const [selected, setSelected] = useState<string[]>(filters?.cfg ? filters.cfg.split(',') : []);
                    const handleToggle = (value: string) => {
                        setSelected(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
                    };
                    return (
                        <div style={{ padding: 8 }}>
                            {uniqueArray(data, 'cfg').map(obj => (
                                <label key={obj.cfg}>
                                    <input type="checkbox" checked={selected.includes(obj.cfg)} onChange={() => handleToggle(obj.cfg)} />
                                    <span style={{ marginLeft: 8 }}>{obj.cfg}</span>
                                </label>
                            ))}
                            <Space style={{ marginTop: 8 }}>
                                <Button size="small" style={{ backgroundColor: '#2358BE', color: '#fff', border: 'none' }} onClick={() => {
                                    setFilters(prev => ({ ...prev, cfg: selected.join(',') }));
                                    confirm(); retry(1);
                                }}>OK</Button>
                                <Button size="small" onClick={() => {
                                    setFilters(prev => ({ ...prev, cfg: '' }));
                                    clearFilters(); confirm(); retry(1);
                                }}>Reset</Button>
                            </Space>
                        </div>
                    );
                },
            },
            // {
            //     title: commonTranslations('rulesListPage.table.description'),
            //     dataIndex: 'desc',
            //     sorter: (a, b) => a.state.localeCompare(b.desc),
            // },
            {
              title: commonTranslations('rulesListPage.table.description'),
              dataIndex: 'desc',
              sorter: (a, b) => a.desc.localeCompare(b.desc),
              filterDropdown: ({ confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search description"
                    value={filters.desc}
                    onChange={(e) => setFilters(prev => ({ ...prev, desc: e.target.value }))}
                    onPressEnter={() => {
                      retry(1);
                      confirm();
                    }}
                    style={{ marginBottom: 8, display: 'block' }}
                  />
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => {
                        retry(1);
                        confirm();
                      }}
                      size="small"
                      style={{ backgroundColor: "#2358BE", color: "#fff", border: "none" }}
                    >
                      Search
                    </Button>
                    <Button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, desc: '' }));
                        retry(1);
                        clearFilters();
                        confirm();
                      }}
                      size="small"
                    >
                      Reset
                    </Button>
                  </Space>
                </div>
              ),
            },

            // {
            //     title: commonTranslations('rulesListPage.table.state'),
            //     dataIndex: 'state',
            //     sorter: (a, b) => a.state.localeCompare(b.state),
            // },
            {
              title: commonTranslations('rulesListPage.table.state'),
              dataIndex: 'state',
              sorter: (a, b) => a.state.localeCompare(b.state),
              filters: uniqueArray(data, 'state').map((obj) => ({ text: obj.state, value: obj.state })),
              filteredValue: filters.state ? [filters.state] : null,
              onFilter: (value, record) => record.state === value,
              filterDropdown: ({ confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Space direction="vertical">
                    {uniqueArray(data, 'state').map(obj => (
                      <Button
                        key={obj.state}
                        size="small"
                        type={filters.state === obj.state ? "primary" : "default"}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, state: obj.state }));
                          confirm();
                          retry(1);
                        }}
                      >
                        {obj.state}
                      </Button>
                    ))}
                    <Button
                      size="small"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, state: '' }));
                        clearFilters();
                        confirm();
                        retry(1);
                      }}
                    >
                      Reset
                    </Button>
                  </Space>
                </div>
              )
            },

            // {
            //     title: commonTranslations('rulesListPage.table.owner'),
            //     dataIndex: 'ownerId',
            //     sorter: (a, b) => a.state.localeCompare(b.ownerId),
            // },
            {
              title: commonTranslations('rulesListPage.table.owner'),
              dataIndex: 'ownerId',
              sorter: (a, b) => a.ownerId.localeCompare(b.ownerId),
              filters: uniqueArray(data, 'ownerId').map((obj) => ({ text: obj.ownerId, value: obj.ownerId })),
              filteredValue: filters.ownerId ? [filters.ownerId] : null,
              onFilter: (value, record) => record.ownerId === value,
              filterDropdown: ({ confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Space direction="vertical">
                    {uniqueArray(data, 'ownerId').map(obj => (
                      <Button
                        key={obj.ownerId}
                        size="small"
                        type={filters.ownerId === obj.ownerId ? "primary" : "default"}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, ownerId: obj.ownerId }));
                          confirm();
                          retry(1);
                        }}
                      >
                        {obj.ownerId}
                      </Button>
                    ))}
                    <Button
                      size="small"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, ownerId: '' }));
                        clearFilters();
                        confirm();
                        retry(1);
                      }}
                    >
                      Reset
                    </Button>
                  </Space>
                </div>
              )
            },

            {
                title: commonTranslations('rulesListPage.table.updatedAt'),
                dataIndex: 'updatedAt',
                render: (text: string) => new Date(text).toDateString(),
                sorter: (a, b) => a.createdAt.localeCompare(b.updatedAt)
            },
            {
                title: commonTranslations('rulesListPage.table.action'),
                key: 'action',
                render: (_, record) => (
                    <Space size="middle">
                        
                        {/*{canTransition(privileges, 'RULE', record.state, 'EDIT', record.ownerId) &&
                          record.ownerId === user.username && (
                            <Button data-testid="modify-button" onClick={() => {
                              if (record.state !== '01_DRAFT') {
                                modal.confirm({
                                  title: 'Confirmation',
                                  content: 'Do you wish to create a new version of this rule',
                                  okButtonProps: { className: 'bg-green-500 text-white' },
                                  onOk: () => {
                                    setSelectedRule(record);
                                    setOpenEdit(true);
                                  }
                                });
                              } else {
                                setSelectedRule(record);
                                setOpenEdit(true);
                              }
                            }} type='link'>
                              {commonTranslations('rulesListPage.table.modify')}
                            </Button>
                        )}*/}

                        {privileges.includes('SECURITY_UPDATE_RULE') && record.ownerId === user.username && (
                          <Button
                            data-testid="modify-button"
                            onClick={() => {
                              setSelectedRule(record);
                              setOpenEdit(true);
                            }}
                            type="link"
                          >
                            {commonTranslations('rulesListPage.table.modify')}
                          </Button>
                        )}




                        {canTransition(privileges, 'RULE', record.state, 'REVIEW', record.ownerId) && (
                            <Button type='link'>
                                <Link href={`/rule/${record.name}/review`}>
                                    {commonTranslations('rulesListPage.table.review')}
                                </Link>
                            </Button>
                        )}
                    </Space>
                ),
            }
        ];
    }, [commonTranslations, data, filters, searchText, canEdit, modal, privileges, retry, setFilters, setSelectedRule, setOpenEdit]);

    return (
        <>
            {canCreate && (
                <div>
                    <Button className={styles['create-button']} onClick={() => setOpen(true)}>
                        {commonTranslations('rulesListPage.create')}
                    </Button>
                </div>
            )}

            <Suspense>
                <CreateRule open={open} setOpen={setOpen} afterCreate={onRuleCreated} />
            </Suspense>

            <Suspense>
                <EditRule
                    rule={selectedRule}
                    open={openEdit}
                    setOpen={setOpenEdit}
                    setSelectedRule={setSelectedRule}
                    afterEdit={onRuleCreated} // Use same callback for refresh
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

            {contextHolder}
        </>
    );
};

export default Rule;
