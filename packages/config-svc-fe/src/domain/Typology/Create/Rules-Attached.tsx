import { Empty, Input, Typography } from "antd"
import { useEffect, useState } from "react";
import { AttachedRules } from ".";
import { sortAlphabetically } from "~/utils";
import { IRuleConfig } from "~/domain/Rule/RuleConfig/RuleConfigList/types";
import { useCommonTranslations } from "~/hooks";

export interface RulesAttachedProps {
    rulesAttached: AttachedRules[];
}
export const RulesAttached: React.FunctionComponent<RulesAttachedProps> = ({rulesAttached}) => {
    const[options, setOptions] = useState<AttachedRules[]>([]);
    const {t} = useCommonTranslations();

    useEffect(() => {
        setOptions(rulesAttached);
    }, [rulesAttached]);

    const handleSearch = (text: string) => {
        if(text.trim().length) {
            const searchResults = rulesAttached.filter((rule) => rule?.name?.toLocaleLowerCase().includes(text?.toLocaleLowerCase()));
            setOptions([...searchResults]);
        } else {
            setOptions(rulesAttached);
        }
    }
    
    return <div className="mt-1">
        <div className="flex justify-between items-center mb-2 border-t border-b border-gray-300">
            <Typography.Paragraph className="font-bold mt-3 px-2">{t('typologyCreatePage.rulesAttached')}</Typography.Paragraph>
        </div>
        <Input data-testid="rules-attached-search" onChange={(e) => handleSearch(e?.target?.value)} placeholder={t('typologyCreatePage.searchRules')} className="mb-2 border-none shadow-none focus:ring-0" />
        {
            !options.length ?   <Typography.Paragraph className="text-gray-500 px-2"> {t('typologyCreatePage.noRulesAttached')} </Typography.Paragraph> :  null
        }

        {
            (sortAlphabetically(options, 'name')).map((rule, i) => <div key={i} className="flex justify ">
            <Typography.Paragraph className="text-gray-500 px-3">{rule.name}</Typography.Paragraph>/<Typography className="text-gray-400 ml-1">({rule.attachedConfigs.length ? `${rule.attachedConfigs.length} configuration` : 'No configurations'})</Typography>
        </div>)
        }
    </div>
}

export interface IConfig extends IRuleConfig {
    ruleName: string;
}
export const RulesConfigurationsAttached:  React.FunctionComponent<RulesAttachedProps> = ({rulesAttached}) => {
    const [configurations, setConfigurations] = useState<IConfig[]>([]);
    const {t} = useCommonTranslations();

    const handleSearch = (text: string) => {
        if(text.trim().length) {
            rulesAttached.forEach((rule) => {
                const configs = rule.attachedConfigs.map((config) => ({...config, ruleName: rule.name}));
                const results = configs.filter((c) => c.cfg.includes(text));
                setConfigurations([...results]);
            })
        } else {
            rulesAttached.forEach((rule) => {
                const configs = rule.attachedConfigs.map((config) => ({...config, ruleName: rule.name}));
                setConfigurations([...configs])
            })
        }
    }
    useEffect(() => {
        if(rulesAttached.length) {
            const configList: IConfig[] = [];
            rulesAttached.forEach((rule) => {
               rule.attachedConfigs.forEach((config) => configList.push({...config, ruleName: rule.name}));
            })
            setConfigurations([...configList])
        } else {
            setConfigurations([]);
        }
        
    }, [rulesAttached]);


    return <div className="mt-2">
        <div className="flex justify-between items-center mb-2 border-t border-b border-gray-300">
            <Typography.Paragraph className="font-bold mt-3 px-2">{t('typologyCreatePage.rulesConfigurationsAttached')}</Typography.Paragraph>
        </div>
        <Input onChange={(e) => handleSearch(e?.target?.value)} data-testid="search-configuration-input" placeholder={t('typologyCreatePage.searchConfigurations')} className="mb-2 border-none shadow-none focus:ring-0" />
        {
            !configurations.length ? <Empty description={t('typologyCreatePage.noRuleConfigurations')} /> : null
        }
        {configurations.map((config, i) =>  <div key={i} className="flex justify px-2">
            <Typography.Paragraph data-testid="attached-config">{`${config.ruleName}-config-${config.cfg}`} </Typography.Paragraph>

        </div>)}
    </div>
}