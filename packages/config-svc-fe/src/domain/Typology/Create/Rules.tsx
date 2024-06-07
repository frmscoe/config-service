import { DownOutlined, FallOutlined, FileDoneOutlined, PlusOutlined, UpOutlined } from "@ant-design/icons"
import { Empty, Input, Typography } from "antd"
import { useCallback, useEffect, useMemo, useState } from "react"
import { IRuleConfig } from "~/domain/Rule/RuleConfig/RuleConfigList/types";
import { IRule } from "~/domain/Rule/RuleDetailPage/service"
import { useCommonTranslations } from "~/hooks";
import { AttachedRules } from ".";
import { sortAlphabetically } from "~/utils";

export interface RulesAttachedProps {
    rules: IRule[];
    ruleOptions: IRule[];
    setRuleOptions: (rules: IRule[]) => void;
    selectedRule: null | string;
    setSelectedRuleIndex: (index: string | null) => void;
    attachedRules: AttachedRules[];
    ruleDragIndex: null | number;
    setRuleDragIndex: (index: number | null) => void;
    recentlyRemoveRules: IRule[] | IRuleConfig[];

}
export const Rules: React.FunctionComponent<RulesAttachedProps> = ({
    rules,
    ruleOptions,
    setRuleOptions,
    selectedRule,
    setSelectedRuleIndex,
    setRuleDragIndex,
    recentlyRemoveRules,
    attachedRules,
}) => {
    const { t } = useCommonTranslations();
    const [showDeleted, setShowDeleted] = useState(false);
    const [configurations, setConfigurations] = useState<IRuleConfig[]>([]);
    const [recentlyRemovedOptions, setRecentlyRemovedOptions] = useState<IRule[] | IRuleConfig[]>([]);

    const attachedConfigIds = useMemo(() => {
        let configs: string[] = [];
        attachedRules.forEach((rule) => {
            rule.attachedConfigs.forEach((config) => {
                configs.push(config._key);
            });
        })
        return configs;

    }, [attachedRules]);

    const attachedRulesIds = useMemo(() => {
        return attachedRules.map((r) => r._key);

    }, [attachedRules]);

    useEffect(() => {
        setRuleOptions(rules);
    }, [rules]);

    useEffect(() => {
        setRecentlyRemovedOptions(recentlyRemoveRules);
    }, [recentlyRemoveRules])

    const handleSearch = (val: any) => {
        if (val.trim().length) {
            setRuleOptions(rules.filter((rule) => rule.name.toLowerCase().includes(val.toLowerCase())))
        }
        if (!val.trim().length) {
            setRuleOptions(rules);
        }
        setSelectedRuleIndex(null);

    }

    const onDragStart = (e: any, index: any, type?: string) => {
        const config = configurations[index] || {};
        e.dataTransfer.setData('application/reactflow', 'node');
        e.dataTransfer.setData('type', type || 'rule');
        e.dataTransfer.setData('index', index);
        e.dataTransfer.setData('data', JSON.stringify(config));
        e.dataTransfer.effectAllowed = 'move';
        setRuleDragIndex(index);
    };

    const handleSearchConfig = (e: any) => {
        const val: string = e.target.value;
        if (val.trim().length) {
            setConfigurations(configurations.filter((config) => config.cfg.includes(val.toLowerCase())))
        } else {
            if (selectedRule !== null) {
                const rule = rules.find((r) => r._key === selectedRule);
                setConfigurations(rule?.ruleConfigs || []);
            }
        }
    }

    useEffect(() => {
        if (selectedRule !== null) {
            const rule = rules.find((r) => r._key === selectedRule);
            setConfigurations(rule?.ruleConfigs || []);
        } else {
            setConfigurations([]);
        }
    }, [selectedRule, rules]);

    const renderValue = useCallback((option: IRule & IRuleConfig) => {
        if(option.name) {
            return option.name;
        }
        const rule = rules.find((r) => r._key === option.ruleId)
        return  rule ? `${rule.name || ''}-config-${option.cfg || ''}` : `config-${option.cfg || ''}`;

    }, [rules]);

    const value: IRule | undefined = useMemo(() => {
        if (selectedRule !== null) {
            const rule = rules.find((r) => r._key === selectedRule);
            return rule;
        }
        return undefined;
    }, [selectedRule])

    return <div className="shadow-md h-full flex flex-col">
        <div className="flex justify-between items-center  px-2 border-t border-b border-gray-300">
            <Typography.Paragraph className="font-bold mt-3">{t('typologyCreatePage.title')}</Typography.Paragraph>
            <PlusOutlined style={{ fontSize: '1rem', cursor: 'pointer' }} />
        </div>
        <div className="px-2">
            <Input
                placeholder={t('typologyCreatePage.searchRules')}
                className="border-none shadow-none focus:ring-0 my-2"
                onChange={(e) => handleSearch(e?.target?.value || '')}
                data-testid="search-rules-input"
            />

            {
                (sortAlphabetically(ruleOptions, 'name')).map((r: AttachedRules, index) => {
                    if (attachedRulesIds.includes(r._key)) {
                        return null;
                    }
                    return <div
                        draggable
                        key={index}
                        onDragStart={(e) => {
                            e.dataTransfer.setData('application/reactflow', 'node');
                            e.dataTransfer.setData('type', 'rule');
                            e.dataTransfer.setData('index', (selectedRule)?.toString() as string);
                            e.dataTransfer.setData('data', JSON.stringify(r));
                            e.dataTransfer.effectAllowed = 'move';
                            setSelectedRuleIndex(r._key);
                        }}
                        onClick={() => setSelectedRuleIndex(r._key)}
                        data-testid="rule-drag-item"
                        style={{ border: '2px solid #4CAE47' }}
                        className="flex cursor-move justify-between items-center px-2 border mx-1 p-2 mb-2">
                        <FileDoneOutlined className="w-1/4" style={{ fontSize: '1rem', cursor: 'pointer' }} />
                        <Typography className="w-3/4 text-gray-500">
                            {r.name}
                        </Typography>
                    </div>
                })
            }
        </div>
        <div className="recently-removed px-2">
            <div className="flex justify-between items-center">
                <Typography.Paragraph className="font-bold mt-3">{t('typologyCreatePage.recentlyRemoved')}</Typography.Paragraph>
                {showDeleted ? <UpOutlined style={{ fontSize: '1rem', cursor: 'pointer' }} data-testid="hide-recently-removed" onClick={() => setShowDeleted(false)} /> : <DownOutlined data-testid="show-recently-removed" onClick={() => setShowDeleted(true)} style={{ fontSize: '1rem', cursor: 'pointer' }} />}
            </div>
            {showDeleted ?
                sortAlphabetically(recentlyRemovedOptions, 'name').map((r, index) => <div
                    key={index}
                    data-testid="rule-config-deleted"
                    style={{ border: '3px solid #4CAE47' }}
                    className="flex justify-between items-center px-2 border mx-1 p-2 mb-2">
                    <FileDoneOutlined className="w-1/4" style={{ fontSize: '1rem', cursor: 'pointer' }} />
                    <Typography className="w-3/4 text-gray-500">
                        {renderValue(r)}
                    </Typography>
                </div>) : null
            }
        </div>

        <div className="rule-configuration">
            <div className="flex justify-between items-center px-2 border-t border-b border-gray-300 my-2">
                <Typography.Paragraph className="font-bold mt-3">{t('typologyCreatePage.ruleConfiguration')}</Typography.Paragraph>
                <PlusOutlined style={{ fontSize: '1rem', cursor: 'pointer' }} />
            </div>
            <Input
                className="border-none shadow-none focus:ring-0 text-gray-500 mb-3"
                placeholder={t('typologyCreatePage.searchConfigurations')}
                onChange={handleSearchConfig}
                disabled={selectedRule === null}
                data-testid="removed-items-input"
            />
            {
                (sortAlphabetically(configurations, 'name')).map((config, index) => {
                    if (attachedConfigIds.includes(config._key)) {
                        return null;
                    }
                    return <div
                        draggable
                        key={index}
                        onDragStart={(e) => onDragStart(e, index, 'config')}
                        data-testid="rule-config"
                        className="flex cursor-pointer justify-between items-center px-2 border border-blue-700 mx-2 p-2 mb-2">
                        <FallOutlined className="w-1/4" style={{ fontSize: '1rem', cursor: 'pointer' }} />

                        <Typography className="w-3/4 text-gray-500">
                            {selectedRule !== null ? `${value?.name || ''}-config-${config.cfg}` : ''}
                        </Typography>
                    </div>
                })
            }
            {
                !configurations.length && selectedRule !== null ? <Empty description={t('typologyCreatePage.noRuleConfigurations')} /> : null
            }
            {
                selectedRule === null ? <Empty className="mb-2" description={t('typologyCreatePage.setRule')} /> : null
            }

        </div>

    </div>
}