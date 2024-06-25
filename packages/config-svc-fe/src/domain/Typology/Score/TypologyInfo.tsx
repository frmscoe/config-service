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
        const groups = nodes.reduce<Record<string, Node[]>>((acc, node) => {
            if (node.data.ruleId) {
                if (!acc[node.data.ruleId]) {
                    acc[node.data.ruleId] = [];
                }
                acc[node.data.ruleId].push(node);
            }
            return acc;
        }, {});

        // Step 2: Find the maximum score in each group
        const maxScores = Object.values(groups).map((group) => {
            return Math.max(...group.map((node) => node.data?.score || 0));
        });

        // Step 3: Sum the maximum scores
        const totalMaxScore = maxScores.reduce((acc, score) => acc + score, 0);
        //for all outcomes added for each config the score is the value of the maximum outcome added for a given rule
        return totalMaxScore;
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