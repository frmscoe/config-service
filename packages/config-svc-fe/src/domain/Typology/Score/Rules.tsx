import { FileDoneOutlined, PlusOutlined } from "@ant-design/icons"
import { Empty, Input, Typography } from "antd"
import { useEffect } from "react"
import { useCommonTranslations } from "~/hooks";
import { sortAlphabetically } from "~/utils";
import { RuleWithConfig } from "./service";

export interface RuleProps {
    rules: RuleWithConfig[] | any[];
    ruleOptions: RuleWithConfig[];
    setRuleOptions: (rules: RuleWithConfig[]) => void;
    selectedRule: null | string;
    setSelectedRuleIndex: (index: string | null) => void;
    handleSelectRule: (id: string) => void;

}
export const Rules: React.FunctionComponent<RuleProps> = ({
    rules,
    ruleOptions,
    setRuleOptions,
    setSelectedRuleIndex,
    selectedRule,
    handleSelectRule
}) => {
    const { t } = useCommonTranslations();

    useEffect(() => {
        setRuleOptions(rules);
    }, [rules]);


    const handleSearch = (val: any) => {
        if (val.trim().length) {
            setRuleOptions(rules.filter((rule) => rule.rule.name.toLowerCase().includes(val.toLowerCase())))
        }
        if (!val.trim().length) {
            setRuleOptions(rules);
        }
        setSelectedRuleIndex(null);
    }


    return <div className="mx-0 px-0 w-full h-full" data-testid="rules-content">
        <Input
            placeholder={t('typologyScorePage.search')}
            className="border-none shadow-none focus:ring-0 my-2"
            onChange={(e) => handleSearch(e?.target?.value || '')}
            data-testid="search-rules-input"
        />
        {!ruleOptions.length ? <Empty /> : null}

        {
            (sortAlphabetically(ruleOptions, 'name')).map((r: any, index) => {
                return <div
                    key={index}
                    onClick={() => handleSelectRule(r.rule._key)}
                    data-testid={`rule-item-${index}`}
                    style={{ border: selectedRule === r.rule._key? '2px solid #4CAE47' : '' }}
                    className="flex cursor-pointer justify-between items-center px-2 border border-gray-400 mx-1 p-2 mb-2">
                    <FileDoneOutlined className="w-1/4" style={{ fontSize: '1rem', cursor: 'pointer' }} />
                    <Typography className="w-3/4 text-gray-500">
                        {r.rule.name}
                    </Typography>
                </div>
            })
        }
    </div>

}