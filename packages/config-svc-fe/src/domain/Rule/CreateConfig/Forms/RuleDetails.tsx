// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Descriptions, Typography } from "antd";
import { useCommonTranslations } from "~/hooks";

interface IRuleDetails {
    name: string;
    description: string;
    createdBy: string;
    modifiedBy: string;
    updatedAt: string; // formatted date
    dependencies?: string[]; // related rule names
    status: 'draft' | 'active' | 'deprecated' | string;
}

interface RuleDetailsProps {
    rule: IRuleDetails;
}

export const RuleDetails: React.FunctionComponent<RuleDetailsProps> = ({ rule }) => {
    const { t } = useCommonTranslations();

    return (
        <div className="mb-4 px-4">
            <Typography.Title level={4}>
                {t('createRuleConfigPage.ruleDetails')}
            </Typography.Title>

            <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label={t('createRuleConfigPage.ruleDetailsForm.name')}>
                    {rule.name}
                </Descriptions.Item>
                <Descriptions.Item label={t('createRuleConfigPage.ruleDetailsForm.description')}>
                    {rule.description}
                </Descriptions.Item>
                <Descriptions.Item label={t('createRuleConfigPage.ruleDetailsForm.cfg')}>
                    {rule.cfg}
                </Descriptions.Item>
                <Descriptions.Item label={t('createRuleConfigPage.ruleDetailsForm.dataType')}>
                    {rule.dataType}
                </Descriptions.Item>
                <Descriptions.Item label={t('createRuleConfigPage.ruleDetailsForm.createdBy')}>
                    {rule.createdBy}
                </Descriptions.Item>
                <Descriptions.Item label={t('createRuleConfigPage.ruleDetailsForm.modifiedBy')}>
                    {rule.modifiedBy}
                </Descriptions.Item>
                <Descriptions.Item label={t('createRuleConfigPage.ruleDetailsForm.approvedBy')}>
                    {rule.approvedBy}
                </Descriptions.Item>
                <Descriptions.Item label={t('createRuleConfigPage.ruleDetailsForm.createdAt')}>
                    {rule.createdAt}
                </Descriptions.Item>
                <Descriptions.Item label={t('createRuleConfigPage.ruleDetailsForm.updatedAt')}>
                    {rule.updatedAt}
                </Descriptions.Item>
                <Descriptions.Item label={t('createRuleConfigPage.ruleDetailsForm.status')}>
                    {rule.status}
                </Descriptions.Item>
                <Descriptions.Item label={t('createRuleConfigPage.ruleDetailsForm.dependencies')}>
                    {rule.dependencies}
                </Descriptions.Item>
                {/*{rule.dependencies && rule.dependencies.length > 0 && (
                    <Descriptions.Item label={t('createRuleConfigPage.ruleDetailsForm.dependencies')}>
                        {rule.dependencies.join(', ')}
                    </Descriptions.Item>
                )}*/}
            </Descriptions>
        </div>
    );
};

export default RuleDetails;
