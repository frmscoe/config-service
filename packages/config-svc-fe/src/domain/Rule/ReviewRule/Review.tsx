// <!-- SPDX-License-Identifier: Apache-2.0 -->
import axios from 'axios';
import React, { useMemo, useState, useEffect } from 'react';
import { Button, Card, Descriptions, List, Result, Space, Typography, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import Link from 'next/link';
import FullScreenLoader from '~/components/common/FullScreenLoader';
import { useCommonTranslations } from '~/hooks';
import { IUserProfile } from '~/context/auth';
import { IFullRule } from './types'; // Assuming IFullRule correctly defines createdAt and updatedAt as string | null | undefined
import usePrivileges from '~/hooks/usePrivileges';
import { canTransition } from '../../../../machine/guards';
import { nextStateMap } from '../../../../machine/configStateMachine';
import { updateRuleState } from './service';
import { useRouter } from 'next/router';
const { Title, Text } = Typography;

interface Props {
    loading: boolean;
    error: string;
    fetchRule: () => void;
    rule: IFullRule | null;
    user: IUserProfile;
}

// Helper function to safely format dates
const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) {
        return 'N/A'; // Or any other fallback like an empty string
    }
    const date = new Date(dateString);
    // Check if the date object is valid
    return isNaN(date.getTime()) ? 'N/A' : date.toDateString();
};

export const Review: React.FunctionComponent<Props> = ({
    loading,
    error,
    fetchRule,
    rule,
    user,
}) => {
    const { t } = useCommonTranslations();
    const { privileges } = usePrivileges();
    const router = useRouter();
    const [username, setUsername] = useState<string>('');

    const items = useMemo(() => {
        const data: DescriptionsProps['items'] = [];
        const { name, cfg, createdAt, updatedAt, desc, state } = rule || ({} as IFullRule);
        data.push({ key: '1', label: t('ruleReviewPage.rule'), children: name, span: 12 });
        data.push({ key: '2', label: t('ruleReviewPage.version'), children: cfg, span: 12 });
        data.push({ key: '3', label: t('ruleReviewPage.description'), children: desc, span: 12 });
        // Use the formatDate helper for created and updated dates
        data.push({ key: '5', label: t('ruleReviewPage.created'), children: formatDate(createdAt), span: 12 });
        data.push({ key: '6', label: t('ruleReviewPage.updated'), children: formatDate(updatedAt), span: 12 });
        data.push({ key: '7', label: t('ruleReviewPage.state'), children: state, span: 12 });
        return data;
    }, [rule, t]);

    useEffect(() => {
      const stored = localStorage.getItem('config_svc_username');
      if (stored) setUsername(stored.toLowerCase());
    }, []);


    

    const canSubmit = useMemo(() => {
      const ownerId = rule?.ownerId?.toLowerCase() || '';
      return rule && canTransition(privileges, 'RULE', rule.state, 'SUBMIT_REVIEW') && username === ownerId;
    }, [rule, privileges, username]);



    

    const canApprove = useMemo(() => {
      const ownerId = rule?.ownerId?.toLowerCase() || '';
      return (
        rule &&
        rule.state === '10_PENDING_REVIEW' &&
        canTransition(privileges, 'RULE', rule.state, 'APPROVE') &&
        username !== ownerId
      );
    }, [rule, privileges, username]);


    

    const canReject = useMemo(() => {
      const ownerId = rule?.ownerId?.toLowerCase() || '';
      return (
        rule &&
        rule.state === '10_PENDING_REVIEW' &&
        canTransition(privileges, 'RULE', rule.state, 'REJECT') &&
        username !== ownerId
      );
    }, [rule, privileges, username]);

    const canWithdraw = useMemo(() => {
        return rule && canTransition(privileges, 'RULE', rule.state, 'WITHDRAW');
    }, [rule, privileges]);

    const canRetire = useMemo(() => {
        return rule && canTransition(privileges, 'RULE', rule.state, 'RETIRE');
    }, [rule, privileges]);

    const canArchive = useMemo(() => {
        return rule && canTransition(privileges, 'RULE', rule.state, 'ARCHIVE');
    }, [rule, privileges]);

    const canDeploy = useMemo(() => {
        return rule && canTransition(privileges, 'RULE', rule.state, 'DEPLOY');
    }, [rule, privileges]);

    

    const canAbandon = useMemo(() => {
      const ownerId = rule?.ownerId?.toLowerCase() || '';
      return rule && canTransition(privileges, 'RULE', rule.state, 'ABANDON') && username === ownerId;
    }, [rule, privileges, username]);


    

    // const handleTransition = async (eventType: string) => {
    //   if (!rule?._key || !rule?.state) return;

    //   const nextState = nextStateMap[rule.state]?.[eventType];

    //   if (!nextState) {
    //     message.error(`Invalid transition: ${rule.state} + ${eventType}`);
    //     return;
    //   }

    //   try {
    //     await updateRuleState(rule._key, nextState);
    //     message.success(`State updated to ${nextState}`);

    //     if (nextState === '90_ABANDONED' || nextState === '91_ARCHIVED') {
    //       router.push('/rule'); // redirect to rule list page
    //     } else {
    //       fetchRule(); // refresh the current page for other transitions
    //     }
    //   } catch (err: any) {
    //     message.error(err?.message || 'Failed to update state');
    //   }
    // };

    const handleTransition = async (eventType: string) => {
      if (!rule?._key || !rule?.state) return;

      const nextState = nextStateMap[rule.state]?.[eventType];

      if (!nextState) {
        message.error(`Invalid transition: ${rule.state} + ${eventType}`);
        return;
      }

      try {
        await updateRuleState(rule._key, nextState);
        message.success(`State updated to ${nextState}`);
        router.push('/rule'); // Always redirect on success
      } catch (err: any) {
        message.error(err?.message || 'Failed to update state');
      }
    };




    if (loading) return <FullScreenLoader />;
    if (error) {
        return (
            <Result
                data-testid="error"
                title="Error"
                status="500"
                subTitle={error}
                extra={
                    <Button onClick={fetchRule} type="primary" className="bg-blue-500">
                        {t('ruleReviewPage.retry')}
                    </Button>
                }
            />
        );
    }

    const config = rule?.ruleConfigs?.[0]?.config;

    return (
        <div className="p-6 space-y-6">
            <Descriptions
                column={12}
                layout="horizontal"
                title={<Title level={2} className="text-center">{t('ruleReviewPage.review')}</Title>}
                bordered
                items={items}
            />

            
            <div className="mt-4 space-x-3">
                {canSubmit && (
                    <Button type="primary" className="bg-blue-600" onClick={() => handleTransition('SUBMIT_REVIEW')}>
                        {t('stateMachine.submitForReview')}
                    </Button>
                )}


                {canApprove && (
                    <Button type="primary" className="bg-green-600" onClick={() => handleTransition('APPROVE')}>
                        {t('stateMachine.approve')}
                    </Button>
                )}

                {canReject && (
                    <Button type="primary" className="bg-yellow-600" onClick={() => handleTransition('REJECT')}>
                        {t('stateMachine.reject')}
                    </Button>
                )}

                {canWithdraw && (
                    <Button type="primary" className="bg-orange-600" onClick={() => handleTransition('WITHDRAW')}>
                        {t('stateMachine.withdraw')}
                    </Button>
                )}

                {canRetire && (
                    <Button type="primary" className="bg-purple-600" onClick={() => handleTransition('RETIRE')}>
                        {t('stateMachine.retire')}
                    </Button>
                )}

                {canArchive && (
                    <Button type="primary" className="bg-stone-600" onClick={() => handleTransition('ARCHIVE')}>
                        {t('stateMachine.archive')}
                    </Button>
                )}

                {canDeploy && (
                    <Button type="primary" className="bg-teal-600" onClick={() => handleTransition('DEPLOY')}>
                        {t('stateMachine.deploy')}
                    </Button>
                )}

                {canAbandon && (
                    <Button type="primary" className="bg-gray-700" onClick={() => handleTransition('ABANDON')}>
                        {t('stateMachine.abandon')}
                    </Button>
                )}

                <Button type="primary" className="bg-red-500">
                    <Link href="/rule">{t('ruleReviewPage.cancel')}</Link>
                </Button>
            </div>
        </div>
    );
};