import { Empty, Input, Spin, Typography } from "antd"
import { useEffect, useState } from "react";
import { sortAlphabetically } from "~/utils";
import { useCommonTranslations } from "~/hooks";
import { RuleConfig, RuleWithConfig } from "~/domain/Typology/Score/service";
import { FileDoneOutlined, NodeIndexOutlined } from "@ant-design/icons";

export interface RulesAttachedProps {
    rulesAttached: RuleWithConfig[];
    loadingAttached: boolean;
}
export const RulesAttached: React.FunctionComponent<RulesAttachedProps> = ({ rulesAttached, loadingAttached }) => {
    const [options, setOptions] = useState<RuleWithConfig[]>([]);
    const { t } = useCommonTranslations();

    useEffect(() => {
        const obj: {[k:string]: RuleWithConfig} = {}
        rulesAttached.forEach((r) => {
            if(!obj[r.rule._key]) {
                obj[r.rule._key] = {
                    ...r,
                }
            }
        });
        setOptions([...Object.values(obj)]);

    }, [rulesAttached]);

    const handleSearch = (text: string) => {
        if (text.trim().length) {
            const searchResults = rulesAttached.filter((rule) => rule?.rule.name?.toLocaleLowerCase().includes(text?.toLocaleLowerCase()));
            setOptions([...searchResults]);
        } else {
            setOptions(rulesAttached);
        }
    }

    return <Spin spinning={loadingAttached}>
        <div className="mt-1">
            <Input data-testid="rules-attached-search" onChange={(e) => handleSearch(e?.target?.value)} placeholder={t('createEditNetworkMap.searchRules')} className="mb-2 border-none shadow-none focus:ring-0" />
            {
                !options.length ? <Typography.Paragraph className="text-gray-500 px-2"> {t('createEditNetworkMap.noRulesAttached')} </Typography.Paragraph> : null
            }

            {
                (sortAlphabetically(options, 'name')).map((option, i) => <div key={i} data-testid="attached-rule" className="flex items-center py-1">
                    <FileDoneOutlined className="w-1/4" style={{ fontSize: '1rem', cursor: 'pointer' }} />
                    <p className="px-2 capitalize"> {option.rule?.name}</p>
                </div>)
            }
        </div>
    </Spin>
}

export interface IConfig extends RuleConfig {
    ruleName: string;
}
export const RulesConfigurationsAttached: React.FunctionComponent<RulesAttachedProps> = ({ rulesAttached, loadingAttached }) => {
    const [configurations, setConfigurations] = useState<IConfig[]>([]);
    const { t } = useCommonTranslations();

    const handleSearch = (text: string) => {
        if (text.trim().length) {
            rulesAttached.forEach((rule) => {
                const configs = rule.ruleConfigs.map((config) => ({ ...config, ruleName: rule.rule.name }));
                const results = configs.filter((c) => c?.ruleName?.includes(text));
                setConfigurations([...results]);
            })
        } else {
            rulesAttached.forEach((rule) => {
                const configs = rule.ruleConfigs.map((config) => ({ ...config, ruleName: rule.rule.name }));
                setConfigurations([...configs])
            })
        }
    }
    useEffect(() => {

        if (rulesAttached.length) {
            const configList: IConfig[] = [];
            rulesAttached.forEach((r) => {
                (r.ruleConfigs || []).forEach((config) => {
                    configList.push({ ...config, ruleName: r.rule.name });
                });
            });
            setConfigurations([...configList]);
        } else {
            setConfigurations([]);
        }

    }, [rulesAttached]);


    return <Spin spinning={loadingAttached}>
        <div className="mt-2">

            <Input onChange={(e) => handleSearch(e?.target?.value)} data-testid="search-configuration-input" placeholder={t('createEditNetworkMap.searchConfigurations')} className="mb-2 border-none shadow-none focus:ring-0" />
            {
                !configurations.length ? <Empty description={t('createEditNetworkMap.noRuleConfigurations')} /> : null
            }
            {configurations.map((config, i) => <div key={i} data-testid="attached-config" className="flex items-center py-1">
                <NodeIndexOutlined className="w-1/4" style={{ fontSize: '1rem', cursor: 'pointer' }}  />
                <p className="px-2 capitalize">                
                    {`${config.ruleName}-config-${i + 1}`}
                </p>
            </div>)}
        </div>
    </Spin>
}