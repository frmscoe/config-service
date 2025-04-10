// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Typography } from "antd";
import { useMemo } from "react";
import { Node } from "reactflow";
import { IOutcome } from "./Outcomes";
import { IRule } from "~/domain/Rule/RuleDetailPage/service";
import { useCommonTranslations } from "~/hooks";

export interface Props {
    outcomes: IOutcome[];
    rules: IRule[] | any[];
    nodes: Node[];
}

const TypologyDetails: React.FunctionComponent<Props> = ({ rules, outcomes, nodes }) => {
    const {t} = useCommonTranslations();
    const rulesWithOutcomes = useMemo(() => {
        let count = 0;
        rules.forEach((r) => {
            const existAttachedOutcome = outcomes.find((o) => o.ruleId == r?.rule?._key);
            if (existAttachedOutcome) {
                count = count + 1;
            }
        })

        return count;
    }, [rules, outcomes]);

    const score = useMemo(() => {
        // Filter nodes to get scoreNodes
        const scoreNodes = nodes.filter(node => node.type === "scoreNode");

        // Group scoreNodes by ruleId and outcomeType
        const groups = scoreNodes.reduce<Record<string, Record<string, Node[]>>>((acc, node) => {
            const ruleId = node.data?.ruleId;
            const outcomeType = node.data?.outComeType;
            if (ruleId && outcomeType) {
                if (!acc[ruleId]) {
                    acc[ruleId] = {};
                }
                if (!acc[ruleId][outcomeType]) {
                    acc[ruleId][outcomeType] = [];
                }
                acc[ruleId][outcomeType].push(node);
            }
            return acc;
        }, {});

        // Find the maximum score among all the groups
        let maxScore = 0;
        Object.values(groups).forEach(ruleGroups => {
            Object.values(ruleGroups).forEach(outcomeTypeGroup => {
                const maxOutcomeScore = Math.max(...outcomeTypeGroup.map(node => node.data?.score || 0));
                if (maxOutcomeScore > maxScore) {
                    maxScore = maxOutcomeScore;
                }
            });
        });

        return maxScore;
    }, [nodes]);

    return <div>
        <div className="flex justify-between w-2/3 px-2 mt-2">
            <Typography.Paragraph className="text-gray-500">{t('typologyScorePage.rules')}</Typography.Paragraph>
            <Typography.Paragraph className="text-gray-500" data-testid="outcomes-by-rules">{rulesWithOutcomes} of {rules.length}</Typography.Paragraph>
        </div>

        <div className="flex px-2 justify-between w-2/3">
            <Typography.Paragraph className="text-gray-500">{t('typologyScorePage.outcomes')}</Typography.Paragraph>
            <Typography.Paragraph className="text-gray-500" data-testid="outcome-count">{outcomes.length}</Typography.Paragraph>
        </div>

        <div className="flex px-2 justify-between w-2/3">
            <Typography.Paragraph className="text-gray-500">{t('typologyScorePage.maxScore')}</Typography.Paragraph>
            <Typography.Paragraph className="text-gray-500" data-testid="outcome-score">{score}</Typography.Paragraph>
        </div>

    </div>
}
export default TypologyDetails;