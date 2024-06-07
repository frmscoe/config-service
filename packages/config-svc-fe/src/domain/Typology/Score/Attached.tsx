import { Empty, Input, Typography } from "antd"
import { useCallback, useEffect, useMemo, useState } from "react";
import { sortAlphabetically } from "~/utils";
import { useCommonTranslations } from "~/hooks";
import { RuleWithConfig } from "./service";

export interface IRulesAttached {
    rules: RuleWithConfig[];
    outcomes: any[];
}
export const RulesAttached: React.FunctionComponent<IRulesAttached> = ({ rules, outcomes }) => {
    const [options, setOptions] = useState<any[]>([]);
    const { t } = useCommonTranslations();

    useEffect(() => {
        setOptions(rules);
    }, [rules]);

    const handleSearch = (text: string) => {
        if (text.trim().length) {
            const searchResults = rules.filter((rule) => rule?.rule?.name?.toLocaleLowerCase().includes(text?.toLocaleLowerCase()));
            setOptions([...searchResults]);
        } else {
            setOptions(rules);
        }
    }

    const renderOutcome: any = useCallback((rule: any) => {
        const outcome = outcomes.find((o) => o.ruleId === rule?.rule?._key);
        return outcome
    }, [outcomes])

    return <div className="mt-1">
        <Input data-testid="rules-attached-search" onChange={(e) => handleSearch(e?.target?.value)} placeholder={t('typologyCreatePage.searchRules')} className="mb-2 border-none shadow-none focus:ring-0" />
        {
            !options.length ? <Typography.Paragraph className="text-gray-500 px-2"> {t('typologyCreatePage.noRulesAttached')} </Typography.Paragraph> : null
        }

        {
            (sortAlphabetically(options, 'name')).map((rule, i) => <div key={i} data-testid={`rule-attached-${i}`} className="flex justify ">
                <Typography.Paragraph className="text-gray-500 px-3">{rule?.rule?.name}</Typography.Paragraph>/<Typography className="text-gray-400 ml-1">
                    {`${renderOutcome(rule)?.type  || ''} : ${renderOutcome(rule)?.subRuleRef || ''}`}
                </Typography>
            </div>)
        }
    </div>
}

export interface IOutcomeProps {
    outcomes: any[]
}
export const OutcomesAttached: React.FunctionComponent<IOutcomeProps> = ({ outcomes }) => {
    const [outcomeOptions, setOutcomeOptions] = useState<any[]>([]);
    const { t } = useCommonTranslations();

    useEffect(() => {
        setOutcomeOptions(outcomes);
    }, [outcomes]);

    const handleSearch = (text: string) => {
        if (text.trim().length) {
            const searchResults = outcomes.filter((outcome) => outcome?.reason?.toLocaleLowerCase().includes(text?.toLocaleLowerCase()));
            setOutcomeOptions([...searchResults]);
        } else {
            setOutcomeOptions(outcomes);
        }
    }


    return <div className="mt-2">
        <Input onChange={(e) => handleSearch(e?.target?.value)}
            data-testid="search-configuration-input"
            placeholder={t('typologyScorePage.search')}
            className="mb-2 border-none shadow-none focus:ring-0" />
        {
            !outcomeOptions.length ? <Empty /> : null
        }
        {outcomeOptions.map((outcome, i) => <div key={i} className="flex justify px-2">
            <Typography.Paragraph data-testid={`attached-outcome-${i}`}>{`${outcome.type}: ${outcome.subRuleRef}`} </Typography.Paragraph>

        </div>)}
    </div>
}