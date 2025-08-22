// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { FileDoneOutlined } from "@ant-design/icons"
import { Empty, Input, Typography, Modal } from "antd"
import React from "react";
import { useEffect } from "react"
import { useCommonTranslations } from "~/hooks";
import { sortAlphabetically } from "~/utils";

export interface IOutcome {
    subRuleRef: string;
    reason: string;
    ruleId: string;
    value?: any;
    type: string;
}
export interface OutComeProps {
    outcomes: IOutcome[];
    outComeOptions: IOutcome[];
    setOutcomeOptions: (outcomes: IOutcome[]) => void;
    selectedOutcome: null | string;
    setSelectedOutcomeIndex: (index: string | null) => void;
    selectedOutcomes: any[];
    selectedRule: null | string;

}
export const Outcomes: React.FunctionComponent<OutComeProps> = ({
    outcomes,
    outComeOptions,
    setOutcomeOptions,
    setSelectedOutcomeIndex,
    selectedOutcomes,
    selectedRule,
}) => {
    const {t} = useCommonTranslations();
    console.log("Received Outcome Props:", { outcomes, outComeOptions, selectedOutcomes });



    const selectedOutcomeIds = React.useMemo(() => {
        return selectedOutcomes.map((o) => `${o.type}-${o.ruleId}-${o.subRuleRef}`);
    }, [selectedOutcomes]);

    

    // useEffect(() => {
    //     if (!selectedRule) {
    //         setOutcomeOptions(outcomes);
    //     } else {
    //         const filtered = outcomes.filter((o) => {
    //             const cleanRuleId = o.ruleId?.split('/')?.pop(); // ← extract raw key
    //             return cleanRuleId === selectedRule;
    //         });
    //         setOutcomeOptions(filtered);
    //     }
    // }, [outcomes, selectedRule]);



    const handleSearch = (val: any) => {
        if (val.trim().length) {
            setOutcomeOptions(outcomes.filter((outcome) => outcome.reason.toLowerCase().includes(val.toLowerCase())))
        }
        if (!val.trim().length) {
            setOutcomeOptions(outcomes);
        }
        setSelectedOutcomeIndex(null);
    }

    const onDrag = (e: DragEvent, outcome:any) => {
        const ruleSelected = document.querySelector('[data-testid^="rule-item-"][style*="2px solid"]');

        if (!ruleSelected) {
            e.preventDefault();

            Modal.error({
                title: "No Rule Selected",
                content: "Please select a rule in the Rules Section before dragging an outcome to the canvas.",
                okButtonProps: {
                    style: { backgroundColor: "#FF4D4F", color: "white" }
                }
            });

            return;
        }

        e?.dataTransfer?.setData('id', outcome.subRuleRef);
        e?.dataTransfer?.setData('type', 'outcome');
        e?.dataTransfer?.setData('data', JSON.stringify(outcome));
        if(e?.dataTransfer &&  e?.dataTransfer?.effectAllowed) {
            e.dataTransfer.effectAllowed = 'move';
        }
    }

    return <div className="mx-0 px-0 w-full h-full">
        <Input
            placeholder={t('typologyScorePage.search')}
            className="border-none shadow-none focus:ring-0 my-2"
            onChange={(e) => handleSearch(e?.target?.value || '')}
            data-testid="search-rules-input"
        />
        {!outComeOptions.length ? <Empty /> : null}

        {
            (sortAlphabetically(outComeOptions, 'subRuleRef')).map((outcome: any, index) => {
                if(selectedOutcomeIds.includes(`${outcome.type}-${outcome.ruleId}-${outcome.subRuleRef}`)) {
                    return null;
                }
                return <div
                    key={index}
                    draggable
                    onClick={() => setSelectedOutcomeIndex(outcome._key)}
                    data-testid="outcome-drag-item"
                    onDragStart={(event) => onDrag(event as any, outcome)}
                    style={{ border: '2px solid #4CAE47' }}
                    className="flex cursor-move justify-between items-center px-2 border mx-1 p-2 mb-2">
                    <FileDoneOutlined className="w-1/4" style={{ fontSize: '1rem', cursor: 'pointer' }} />
                    <Typography className="w-3/4 text-gray-500">
                       {outcome.type}: {outcome.subRuleRef}
                    </Typography>
                </div>
            })
        }
    </div>

}