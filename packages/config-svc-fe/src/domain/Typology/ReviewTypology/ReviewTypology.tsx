// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Button, Descriptions, Space, Card, Alert, message, Typography } from 'antd'; // Added Typography
import { useRouter } from 'next/router';
import { useCommonTranslations } from '~/hooks';
import usePrivileges from '~/hooks/usePrivileges';
import { transitionTypologyState } from './service'; // Correct service import
import { ITypology } from '../types'; // Correct ITypology import from shared types
import { StateEnum } from '../types'; // Correct StateEnum import from shared types
import { canTransition } from '../../../../machine/guards'; // Correct guards path
import { nextStateMap } from '../../../../machine/configStateMachine';
// Removed: import styles from './style.module.scss'; // This import is no longer needed

const { Title } = Typography; // Destructure Title from Typography

interface ReviewTypologyProps {
    typology: ITypology; // Typology data is now passed as a prop
    fetchTypology: () => void; // Function to re-fetch typology after state change
}

export const ReviewTypology: React.FunctionComponent<ReviewTypologyProps> = ({ typology, fetchTypology }) => {
    const { t: commonTranslations } = useCommonTranslations();
    const router = useRouter();

    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

    const { privileges } = usePrivileges();
    const [username, setUsername] = useState<string>('');

    useEffect(() => {
      const stored = localStorage.getItem('config_svc_username');
      if (stored) setUsername(stored.toLowerCase());
    }, []);

    

    const handleTransition = useCallback(async (eventType: string) => {
      if (!typology || !typology._id || !typology.state) {
        console.error("Missing typology ID or state.");
        message.error(commonTranslations('typologyReviewPage.missingTypologyIdError') || "Typology ID and state are required.");
        return;
      }

      // Dynamically get the next state from the state machine
      const nextState = nextStateMap[typology.state]?.[eventType] as StateEnum | undefined;

      if (!nextState) {
        message.error(
          `Invalid transition: ${typology.state} + ${eventType}` ||
          commonTranslations('typologyReviewPage.invalidTransition')
        );
        return;
      }

      setIsTransitioning(true);
      try {
        await transitionTypologyState(typology._id, nextState);
        message.success(commonTranslations('typologyReviewPage.transitionSuccess') || 'Transition successful');

        if (nextState === StateEnum['90_ABANDONED'] || nextState === StateEnum['91_ARCHIVED']) {
          router.push('/typology'); // redirect on terminal states
        } else {
          fetchTypology(); // refresh the page
        }
      } catch (e: any) {
        console.error('Transition error:', e);
        message.error(e?.response?.data?.message || commonTranslations('typologyReviewPage.transitionError'));
      } finally {
        setIsTransitioning(false);
      }
    }, [typology, fetchTypology, commonTranslations]);


    const { state } = typology;

    // Determine if each transition button should be enabled
    // const canSubmitForReview = canTransition(privileges, 'TYPOLOGY', state, 'SUBMIT_REVIEW');
    // const canApprove = canTransition(privileges, 'TYPOLOGY', state, 'APPROVE');
    // const canReject = canTransition(privileges, 'TYPOLOGY', state, 'REJECT');
    const canSubmitForReview = useMemo(() => {
      return (
        typology &&
        canTransition(privileges, 'TYPOLOGY', typology.state, 'SUBMIT_REVIEW') &&
        username === typology.ownerId?.toLowerCase()
      );
    }, [typology, privileges, username]);

    const canApprove = useMemo(() => {
      return (
        typology &&
        typology.state === '10_PENDING_REVIEW' &&
        canTransition(privileges, 'TYPOLOGY', typology.state, 'APPROVE', typology.ownerId) &&
        username !== typology.ownerId?.toLowerCase()
      );
    }, [typology, privileges, username]);

    const canReject = useMemo(() => {
      return (
        typology &&
        typology.state === '10_PENDING_REVIEW' &&
        canTransition(privileges, 'TYPOLOGY', typology.state, 'REJECT', typology.ownerId) &&
        username !== typology.ownerId?.toLowerCase()
      );
    }, [typology, privileges, username]);

    const canWithdraw = canTransition(privileges, 'TYPOLOGY', state, 'WITHDRAW');
    const canEdit = canTransition(privileges, 'TYPOLOGY', state, 'EDIT');
    // const canAbandon = canTransition(privileges, 'TYPOLOGY', state, 'ABANDON');

    const canAbandon = useMemo(() => {
      return (
        typology &&
        canTransition(privileges, 'TYPOLOGY', state, 'ABANDON') &&
        username === typology.ownerId?.toLowerCase()
      );
    }, [typology, privileges, username]);

    const canDeploy = canTransition(privileges, 'TYPOLOGY', state, 'DEPLOY');
    const canRetire = canTransition(privileges, 'TYPOLOGY', state, 'RETIRE');
    const canArchive = canTransition(privileges, 'TYPOLOGY', state, 'ARCHIVE');


    return (
        <div style={{ padding: '20px' }}>
            <Title level={2}>{commonTranslations('typologyReviewPage.title')}</Title>

            <Card
                title={commonTranslations('typologyReviewPage.details')}
                style={{ marginBottom: 20 }}
            >
                <Descriptions bordered column={1}>
                    <Descriptions.Item label={commonTranslations('typologyReviewPage.name')}>
                        {typology.name}
                    </Descriptions.Item>
                    <Descriptions.Item label={commonTranslations('typologyReviewPage.description')}>
                        {typology.desc}
                    </Descriptions.Item>
                    <Descriptions.Item label={commonTranslations('typologyReviewPage.version')}>
                        {typology.cfg}
                    </Descriptions.Item>
                    <Descriptions.Item label={commonTranslations('typologyReviewPage.owner')}>
                        {typology.ownerId}
                    </Descriptions.Item>
                    <Descriptions.Item label={commonTranslations('typologyReviewPage.currentState')}>
                        {state}
                    </Descriptions.Item>
                    <Descriptions.Item label={commonTranslations('typologyReviewPage.createdAt')}>
                        {new Date(typology.createdAt).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label={commonTranslations('typologyReviewPage.updatedAt')}>
                        {new Date(typology.updatedAt).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label={commonTranslations('typologyReviewPage.updatedBy')}>
                        {typology.updatedBy || 'N/A'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title={commonTranslations('typologyReviewPage.rulesTitle')}>
                <Descriptions bordered column={1}>
                    {typology.rules_rule_configs && typology.rules_rule_configs.length > 0 ? (
                        typology.rules_rule_configs.map((ruleConfigEntry, index) => (
                            <Descriptions.Item key={index} label={`Rule ${index + 1}`}>
                                <Space direction="vertical">
                                    <Typography.Text strong>{commonTranslations('typologyReviewPage.ruleId')}:</Typography.Text> {ruleConfigEntry.ruleId}
                                    {ruleConfigEntry.ruleConfigId && ruleConfigEntry.ruleConfigId.length > 0 && (
                                        <>
                                            <Typography.Text strong>{commonTranslations('typologyReviewPage.ruleConfigs')}:</Typography.Text>
                                            <ul style={{ paddingLeft: '20px' }}>
                                                {ruleConfigEntry.ruleConfigId.map((configId, cfgIndex) => (
                                                    <li key={cfgIndex}>{configId}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </Space>
                            </Descriptions.Item>
                        ))
                    ) : (
                        <Descriptions.Item>{commonTranslations('typologyReviewPage.noRules')}</Descriptions.Item>
                    )}
                </Descriptions>
            </Card>


            <Space size="middle" style={{ marginTop: 20 }}>
                {/* Submit for Review */}
                {canSubmitForReview && (
                    <Button
                        type="primary"
                        onClick={() => handleTransition('SUBMIT_REVIEW', StateEnum['10_PENDING_REVIEW'])}
                        loading={isTransitioning}
                        // Set background to purple and text to white for visibility
                        style={{ backgroundColor: 'purple', color: 'white', borderColor: 'purple' }}
                    >
                        {commonTranslations('typologyReviewPage.submitReview')}
                    </Button>
                )}

                {/* Approve */}
                {canApprove && (
                    <Button
                        type="primary"
                        className="bg-green-600"
                        onClick={() => handleTransition('APPROVE', StateEnum['20_APPROVED'])}
                        loading={isTransitioning}
                    >
                        {commonTranslations('typologyReviewPage.approve')}
                    </Button>
                )}

                {/* Reject */}
                {canReject && (
                    <Button
                        type="primary"
                        className="bg-yellow-600"
                        onClick={() => handleTransition('REJECT', StateEnum['11_REJECTED'])}
                        loading={isTransitioning}
                    >
                        {commonTranslations('typologyReviewPage.reject')}
                    </Button>
                )}

                {/* Withdraw */}
                {canWithdraw && (
                    <Button
                        type="primary"
                        className="bg-orange-600"
                        onClick={() => handleTransition('WITHDRAW', StateEnum['12_WITHDRAWN'])}
                        loading={isTransitioning}
                    >
                        {commonTranslations('typologyReviewPage.withdraw')}
                    </Button>
                )}

                

                {/* Abandon */}
                {canAbandon && (
                    <Button
                        type="primary"
                        className="bg-gray-700"
                        onClick={() => handleTransition('ABANDON', StateEnum['90_ABANDONED'])}
                        loading={isTransitioning}
                    >
                        {commonTranslations('typologyReviewPage.abandon')}
                    </Button>
                )}

                {/* Deploy */}
                {canDeploy && (
                    <Button
                        type="primary"
                        onClick={() => handleTransition('DEPLOY', StateEnum['21_DEPLOYED'])}
                        loading={isTransitioning}
                    
                        // Set background to purple and text to white for visibility
                        style={{ backgroundColor: 'purple', color: 'white', borderColor: 'purple' }}
                    >
                        {commonTranslations('typologyReviewPage.deploy')}
                    </Button>
                )}

                {/* Retire */}
                {canTransition(privileges, 'TYPOLOGY', state, 'RETIRE') && (
                    <Button
                        onClick={() => handleTransition('RETIRE', StateEnum['22_RETIRED'])}
                        loading={isTransitioning}
                    >
                        {commonTranslations('typologyReviewPage.retire')}
                    </Button>
                )}

                {/* Archive */}
                {canTransition(privileges, 'TYPOLOGY', state, 'ARCHIVE') && (
                    <Button
                        onClick={() => handleTransition('ARCHIVE', StateEnum['91_ARCHIVED'])} // Removed the trailing backslash here
                        loading={isTransitioning}
                    >
                        {commonTranslations('typologyReviewPage.archive')}
                    </Button>
                )}

                <Button onClick={() => router.back()}>
                    {commonTranslations('typologyReviewPage.back')}
                </Button>
            </Space>
        </div>
    );
};