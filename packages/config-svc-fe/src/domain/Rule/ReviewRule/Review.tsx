import React, { useMemo } from 'react';
import { Button, Descriptions, Result, Typography } from 'antd';
import type { DescriptionsProps } from 'antd';
import Link from 'next/link';
import FullScreenLoader from '~/components/common/FullScreenLoader';
import { IRule } from '../RuleDetailPage/service';
import { useCommonTranslations } from '~/hooks';
import { IUserProfile } from '~/context/auth';

interface Props {
    loading: boolean;
    error: string;
    fetchRule: () => void;
    rule: IRule | null;
    user: IUserProfile
}

export const Review: React.FunctionComponent<Props> = ({
    loading,
    error,
    fetchRule,
    rule,
    user
}) => {
    const { t } = useCommonTranslations();

    const items = useMemo(() => {
        const data: DescriptionsProps['items'] = [];
        const {name, cfg, createdAt, updatedAt, desc, state } = rule || {} as IRule;
        data.push({ key: '1', label: t('ruleReviewPage.rule'), children: name, span: 12 });
        data.push({ key: '2', label: t('ruleReviewPage.version'), children: cfg, span: 12 });
        data.push({ key: '3', label: t('ruleReviewPage.description'), children: desc, span: 12 });
        data.push({ key: '5', label: t('ruleReviewPage.created'), children: new Date(createdAt).toDateString(), span: 12 },);
        data.push({ key: '6', label: t('ruleReviewPage.updated'), children: new Date(updatedAt).toDateString(), span: 12 });
        data.push({ key: '7', label: t('ruleReviewPage.state'), children: state, span: 12 });

        return data;
    }, [rule, t]);

    const canApprove = useMemo(() => {
        const isPendingReview = rule?.state?.toLocaleLowerCase().includes('pending');
        const isUpdater = user?.username === rule?.ownerId;
        const hasApprovalPrivileges = user?.privileges?.includes('SECURITY_APPROVE_RULE');
        return isPendingReview && !isUpdater && hasApprovalPrivileges;
    }, [user, rule]);

    if (loading) {
        return <FullScreenLoader />
    }

    if (error) {
        return <Result
            data-testid="error"
            title="Error"
            status="500"
            subTitle={error}
            extra={[
                <Button onClick={fetchRule} type="primary" key="console" className="bg-blue-500">
                    {t('ruleReviewPage.retry')}
                </Button>
            ]}

        />
    }
    return <div>
        <Button className='mb-2 bg-red-500 text-white ml-2'>
            <Link href="/rule">
                {t('ruleReviewPage.backToList')}
            </Link>
        </Button>
        <Descriptions column={12} layout="horizontal" title={<Typography.Title level={2} className="text-center">
            {t('ruleReviewPage.review')}
        </Typography.Title>} bordered items={items} />
        {canApprove && <Button type="primary" className='mt-2 ml-2 mb-5 bg-blue-500 mr-2'>
            {t('ruleReviewPage.approve')}
        </Button>}

        <Button type="primary" className='mt-2 bg-red-500 ml-2'>
            <Link href="/rule">
                {t('ruleReviewPage.cancel')}
            </Link>
        </Button>

    </div>
};

