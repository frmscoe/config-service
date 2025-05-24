// <!-- SPDX-License-Identifier: Apache-2.0 -->
// Rule detail in rule config
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

    // Add these two:
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
}


const Rule: React.FunctionComponent<Props> = ({ loading, error, retry, data, total, onPageChange, page, open, setOpen, user, openEdit, setOpenEdit,
    selectedRule, setSelectedRule, filters, setFilters }) => {
    const { t: commonTranslations } = useCommonTranslations();
    const [searchText, setSearchText] = useState<string>('');
    const [rules, setRules] = useState<IRule[]>([]);
    const [modal, contextHolder] = Modal.useModal();



    const canCreate = useMemo(() => {
        return user?.privileges?.includes('SECURITY_CREATE_RULE')
    }, [user])

    const canEdit = useMemo(() => {
        return user?.privileges?.includes('SECURITY_UPDATE_RULE')
    }, [user])

    const canReview = useMemo(() => {
        return user?.privileges?.includes('SECURITY_GET_RULE')
    }, [user])

    const { privileges } = usePrivileges();

    useEffect(() => {
        setRules([...data]);
    }, [data])

    



    const handleSearch = useCallback(() => {
      setFilters(prev => ({ ...prev, desc: searchText }));
      retry(1); // refetch first page with filters
    }, [searchText]);



    const columns: TableColumnsType<IRule> = useMemo(() => {
        return [
            {
              title: commonTranslations('rulesListPage.table.name'),
              dataIndex: 'name',
              showSorterTooltip: { target: 'full-header' },
              sorter: (a: IRule, b: IRule) => a.state.localeCompare(b.name),
              filterDropdown: ({ confirm, clearFilters }: any) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search name"
                    value={filters.name}
                    onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                    onPressEnter={() => {
                      retry(1); // refetch from backend
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
                      style={{
                        backgroundColor: "#2358BE",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Search
                    </Button>

                    <Button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, name: '' }));
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

            
            {
              title: commonTranslations('rulesListPage.table.version'),
              dataIndex: 'cfg',
              showSorterTooltip: { target: 'full-header' },
              sorter: (a: IRule, b: IRule) => a.state.localeCompare(b.cfg),
              filteredValue: filters.cfg ? filters.cfg.split(',') : null,
              onFilter: undefined,
              filterDropdown: ({ confirm, clearFilters }: any) => {
                const [selected, setSelected] = useState<string[]>(
                  filters.cfg ? filters.cfg.split(',') : []
                );

                const handleToggle = (value: string) => {
                  setSelected(prev =>
                    prev.includes(value)
                      ? prev.filter(v => v !== value)
                      : [...prev, value]
                  );
                };

                return (
                  <div style={{ padding: 8 }}>
                    {uniqueArray(data, 'cfg').map(obj => (
                      <label key={obj.cfg} style={{ display: 'block', marginBottom: 4 }}>
                        <input
                          type="checkbox"
                          checked={selected.includes(obj.cfg)}
                          onChange={() => handleToggle(obj.cfg)}
                        />
                        <span style={{ marginLeft: 8 }}>{obj.cfg}</span>
                      </label>
                    ))}

                    <Space style={{ marginTop: 8 }}>
                      <Button
                        size="small"
                        style={{
                          backgroundColor: '#2358BE',
                          color: '#fff',
                          border: 'none',
                        }}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, cfg: selected.join(',') }));
                          confirm();
                          retry(1);
                        }}
                      >
                        OK
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          setFilters(prev => ({ ...prev, cfg: '' }));
                          clearFilters();
                          confirm();
                          retry(1);
                        }}
                      >
                        Reset
                      </Button>
                    </Space>
                  </div>
                );
              },
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
                      onPressEnter={() => {
                        setFilters(prev => ({ ...prev, desc: e.target.value }));
                        retry(1); // this triggers a new fetch
                        confirm();
                      }}
                      className={styles['input-description-search']}
                    />
                    <Space>
                      <Button
                        type="primary"
                        onClick={() => {
                          setFilters(prev => ({ ...prev, desc: searchText }));
                          retry(1); // triggers fetch
                          confirm();
                        }}
                        size="small"
                        className={styles['reset-button']}
                      >
                        {commonTranslations('rulesListPage.search')}
                      </Button>
                      <Button
                        onClick={() => {
                          setSearchText('');
                          setFilters(prev => ({ ...prev, desc: '' }));
                          retry(1);
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
                ),

            },
      
            {
              title: commonTranslations('rulesListPage.table.state'),
              dataIndex: 'state',
              defaultSortOrder: 'descend',
              sorter: (a: IRule, b: IRule) => a.state.localeCompare(b.state),
              filteredValue: filters.state ? filters.state.split(',') : null,
              onFilter: undefined,
              filterDropdown: ({ confirm, clearFilters }: any) => {
                const [selected, setSelected] = useState<string[]>(
                  filters.state ? filters.state.split(',') : []
                );

                const handleToggle = (value: string) => {
                  setSelected(prev =>
                    prev.includes(value)
                      ? prev.filter(v => v !== value)
                      : [...prev, value]
                  );
                };

                return (
                  <div style={{ padding: 8 }}>
                    {uniqueArray(data, 'state').map(obj => (
                      <label key={obj.state} style={{ display: 'block', marginBottom: 4 }}>
                        <input
                          type="checkbox"
                          checked={selected.includes(obj.state)}
                          onChange={() => handleToggle(obj.state)}
                        />
                        <span style={{ marginLeft: 8 }}>{obj.state}</span>
                      </label>
                    ))}

                    <Space style={{ marginTop: 8 }}>
                      <Button
                        size="small"
                        style={{
                          backgroundColor: '#2358BE',
                          color: '#fff',
                          border: 'none',
                        }}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, state: selected.join(',') }));
                          confirm();
                          retry(1);
                        }}
                      >
                        OK
                      </Button>
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
                );
              },
            },

            {
              title: commonTranslations('rulesListPage.table.owner'),
              dataIndex: 'ownerId',
              defaultSortOrder: 'descend',
              sorter: (a: IRule, b: IRule) => a.state.localeCompare(b.ownerId),
              filteredValue: filters.ownerId ? filters.ownerId.split(',') : null,
              onFilter: undefined,
              filterDropdown: ({ confirm, clearFilters }: any) => {
                const [selected, setSelected] = useState<string[]>(
                  filters.ownerId ? filters.ownerId.split(',') : []
                );

                const handleToggle = (value: string) => {
                  setSelected(prev =>
                    prev.includes(value)
                      ? prev.filter(v => v !== value)
                      : [...prev, value]
                  );
                };

                return (
                  <div style={{ padding: 8 }}>
                    {uniqueArray(data, 'ownerId').map(obj => (
                      <label key={obj.ownerId} style={{ display: 'block', marginBottom: 4 }}>
                        <input
                          type="checkbox"
                          checked={selected.includes(obj.ownerId)}
                          onChange={() => handleToggle(obj.ownerId)}
                        />
                        <span style={{ marginLeft: 8 }}>{obj.ownerId}</span>
                      </label>
                    ))}

                    <Space style={{ marginTop: 8 }}>
                      <Button
                        size="small"
                        style={{
                          backgroundColor: '#2358BE',
                          color: '#fff',
                          border: 'none',
                        }}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, ownerId: selected.join(',') }));
                          confirm();
                          retry(1);
                        }}
                      >
                        OK
                      </Button>
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
                );
              },
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
                        {canTransition(privileges, 'RULE', record.state, 'EDIT') && (
                          <Button data-testid="modify-button" onClick={() => {
                            if (record.state !== '01_DRAFT') {
                              modal.confirm({
                                title: 'Confirmation',
                                content: 'Do you wish to create a new version of this rule',
                                okButtonProps: {
                                  className: 'bg-green-500 text-white'
                                },
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
                        )}

                        {canTransition(privileges, 'RULE', record.state, 'REVIEW') && (
                          <Button type='link'>
                            <Link href={`/rule/${record.name}/review`}>
                              {commonTranslations('rulesListPage.table.review')}
                            </Link>
                          </Button>
                        )}
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
            </div> : <div />}

            <Suspense>
                <CreateRule
                    open={open}
                    setOpen={setOpen}
                    afterCreate={() => {
                        retry(1);
                    }}
                />
            </Suspense>

            <Suspense>
                <EditRule
                    rule={selectedRule}
                    open={openEdit}
                    setOpen={setOpenEdit}
                    setSelectedRule={setSelectedRule}
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
            {contextHolder}
        </>
    )
}

export default Rule;
