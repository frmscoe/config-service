import { DownOutlined } from "@ant-design/icons";
import { Input, Tree, TreeDataNode, Typography } from "antd";
import React, { useEffect, useMemo } from "react";
import { useState } from "react";
import { AccordionArrows } from "~/components/common/AccordionArrows";
import { AttachedRules } from ".";
import { sortAlphabetically } from "~/utils";
import { useCommonTranslations } from "~/hooks";

interface Props {
    rulesAttached: AttachedRules[];
}
export const Structure: React.FunctionComponent<Props> = ({ rulesAttached }) => {
    const [open, setOpen] = useState(false);
    const [rules, setRules] = useState<AttachedRules[]>([]);
    const {t} = useCommonTranslations();

    useEffect(() => {
        setRules(rulesAttached);
    }, [rulesAttached]);

    const handleSearch = (text: string) => {
        if(text.trim().length) {
            const searchResults = rulesAttached.filter((rule) => rule.name.toLocaleLowerCase().includes(text.toLocaleLowerCase()));
            setRules([...searchResults]);
        } else {
            setRules(rulesAttached);
        }
    }

    const treeData: TreeDataNode[] =  useMemo(() => {
        return [{
            title: 'Typology', 
            key: 1, 
            children: [
                ...(sortAlphabetically(rules, 'name') as AttachedRules[]).map((rule) => {
                    const children = rule.attachedConfigs.map((config, i) =>({title: `${rule.name}-config-${config.cfg}`, key: config._key}))
                    return {
                        title: rule.name,
                        key: rule._key,
                        'data-testid': 'rule-structure',
                        children: [...children]
                    }
                })
        ]
        }]
    }, [rules]);

    return <div className="mt-1">
        <div className="flex justify-between items-center mb-2 border-t border-b border-gray-300">
            <Typography.Paragraph className="font-bold mt-3 px-2">{t('typologyCreatePage.structureTitle')}</Typography.Paragraph>
            <AccordionArrows open={open} setOpen={setOpen} />
        </div>
        {open ? <>
            <Input data-testid="search-structure" onChange={(e) => handleSearch(e?.target?.value || '')} placeholder={t('typologyCreatePage.searchPlaceholder')} className="border-none shadow-none focus:ring-0"/>
        <Tree
            showLine
            showIcon
            switcherIcon={<DownOutlined />}
            treeData={treeData}
        /> </>: null}
    </div>
}