// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Button, Descriptions, Space, Card, Alert, message, Typography } from 'antd'; // Added Typography
import { useRouter } from 'next/router';
import { useCommonTranslations } from '~/hooks';
import usePrivileges from '~/hooks/usePrivileges';
import { transitionNetworkMapState } from './service'; // Correct service import
import { INetworkMap } from '../types'; // Correct INetworkMap import from shared types
import { StateEnum } from '../types'; // Correct StateEnum import from shared types
import { canTransition } from '../../../../machine/guards'; // Correct guards path
import { nextStateMap } from '../../../../machine/configStateMachine';


const { Title } = Typography; // Destructure Title from Typography



interface ReviewNetworkMapProps {
    networkMap: INetworkMap;
    fetchNetworkMap: () => void;
}

export const Review: React.FunctionComponent<ReviewNetworkMapProps> = ({ networkMap, fetchNetworkMap }) => {
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
      if (!networkMap || !networkMap._id || !networkMap.state) {
        console.error("Missing networkMap ID or state.");
        message.error(commonTranslations('networkMapReviewPage.missingNetworkMapIdError') || "NetworkMap ID and state are required.");
        return;
      }

      // Dynamically get the next state from the state machine
      const nextState = nextStateMap[networkMap.state]?.[eventType] as StateEnum | undefined;

      if (!nextState) {
        message.error(
          `Invalid transition: ${networkMap.state} + ${eventType}` ||
          commonTranslations('networkMapReviewPage.invalidTransition')
        );
        return;
      }

      setIsTransitioning(true);
      try {
        await transitionNetworkMapState(networkMap._id, nextState);
        message.success(commonTranslations('networkMapReviewPage.transitionSuccess') || 'Transition successful');

        if (nextState === StateEnum['90_ABANDONED'] || nextState === StateEnum['91_ARCHIVED']) {
          router.push('/network-map'); // redirect on terminal states
        } else {
          fetchNetworkMap(); // refresh the page
        }
      } catch (e: any) {
        console.error('Transition error:', e);
        message.error(e?.response?.data?.message || commonTranslations('networkMapReviewPage.transitionError'));
      } finally {
        setIsTransitioning(false);
      }
    }, [networkMap, fetchNetworkMap, commonTranslations]);


    const { state } = networkMap;

    // Determine if each transition button should be enabled
    // const canSubmitForReview = canTransition(privileges, 'networkMap', state, 'SUBMIT_REVIEW');
    // const canApprove = canTransition(privileges, 'NETWORK_MAP', state, 'APPROVE');
    // const canReject = canTransition(privileges, 'NETWORK_MAP', state, 'REJECT');
    const canSubmitForReview = useMemo(() => {
      return (
        networkMap &&
        canTransition(privileges, 'NETWORK_MAP', networkMap.state, 'SUBMIT_REVIEW') &&
        username === networkMap.ownerId?.toLowerCase()
      );
    }, [networkMap, privileges, username]);

    const canApprove = useMemo(() => {
      return (
        networkMap &&
        networkMap.state === '10_PENDING_REVIEW' &&
        canTransition(privileges, 'NETWORK_MAP', networkMap.state, 'APPROVE', networkMap.ownerId) &&
        username !== networkMap.ownerId?.toLowerCase()
      );
    }, [networkMap, privileges, username]);

    const canReject = useMemo(() => {
      return (
        networkMap &&
        networkMap.state === '10_PENDING_REVIEW' &&
        canTransition(privileges, 'NETWORK_MAP', networkMap.state, 'REJECT', networkMap.ownerId) &&
        username !== networkMap.ownerId?.toLowerCase()
      );
    }, [networkMap, privileges, username]);

    // const canWithdraw = canTransition(privileges, 'NETWORK_MAP', state, 'WITHDRAW');

    const canWithdraw = useMemo(() => {
      return (
        networkMap &&
        canTransition(privileges, 'NETWORK_MAP', state, 'WITHDRAW') &&
        username === networkMap.ownerId?.toLowerCase()
      );
    }, [networkMap, privileges, username]);

    // const canEdit = canTransition(privileges, 'NETWORK_MAP', state, 'EDIT');
    // const canAbandon = canTransition(privileges, 'NETWORKMAP', state, 'ABANDON');

    const canAbandon = useMemo(() => {
      return (
        networkMap &&
        canTransition(privileges, 'NETWORK_MAP', state, 'ABANDON') &&
        username === networkMap.ownerId?.toLowerCase()
      );
    }, [networkMap, privileges, username]);

    // const canDeploy = canTransition(privileges, 'NETWORK_MAP', state, 'DEPLOY');

    const canDeploy = useMemo(() => {
      return (
        networkMap &&
        canTransition(privileges, 'NETWORK_MAP', state, 'DEPLOY') &&
        username === networkMap.ownerId?.toLowerCase()
      );
    }, [networkMap, privileges, username]);


    // const canRetire = canTransition(privileges, 'NETWORK_MAP', state, 'RETIRE');

    const canRetire = useMemo(() => {
      return (
        networkMap &&
        canTransition(privileges, 'NETWORK_MAP', state, 'RETIRE') &&
        username === networkMap.ownerId?.toLowerCase()
      );
    }, [networkMap, privileges, username]);

    // const canArchive = canTransition(privileges, 'NETWORK_MAP', state, 'ARCHIVE');

    const canArchive = useMemo(() => {
      return (
        networkMap &&
        canTransition(privileges, 'NETWORK_MAP', state, 'ARCHIVE') &&
        username === networkMap.ownerId?.toLowerCase()
      );
    }, [networkMap, privileges, username]);


    return (
        <div style={{ padding: '20px' }}>
            <Title level={2}>{commonTranslations('networkMapReviewPage.title')}</Title>

            
            <Card
              title={commonTranslations('networkMapReviewPage.details')}
              style={{ marginBottom: 20 }}
            >
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Events">
                  {networkMap.events.map((event, idx) => (
                    <div key={idx}>{event.eventId}</div>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="CFG">{networkMap.cfg}</Descriptions.Item>
                <Descriptions.Item label="State">{networkMap.state}</Descriptions.Item>
                <Descriptions.Item label="Owner">{networkMap.ownerId}</Descriptions.Item>
                <Descriptions.Item label="Approved By">{networkMap.approvedBy || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Modified By">{networkMap.modifiedBy || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Created At">{new Date(networkMap.createdAt).toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Updated At">{new Date(networkMap.updatedAt).toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Originated ID">{networkMap.originatedId || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Reference ID">{networkMap.referenceId ?? 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Edited">{networkMap.edited ? 'Yes' : 'No'}</Descriptions.Item>
                <Descriptions.Item label="Source">{networkMap.source}</Descriptions.Item>
              </Descriptions>
            </Card>


            
            <Card title={commonTranslations('networkMapReviewPage.rulesTitle')}>
              <Descriptions bordered column={1}>
                {networkMap.events?.length > 0 ? (
                  networkMap.events.map((event, ei) =>
                    event.typologies?.map((t, ti) => (
                      <Descriptions.Item
                        key={`${ei}-${ti}`}
                        label={`Event: ${event.eventId} / Typology: ${t.name}`}
                      >
                        <Space direction="vertical">
                          <Typography.Text strong>CFG:</Typography.Text> {t.cfg}
                          <Typography.Text strong>State:</Typography.Text> {t.state}
                          <Typography.Text strong>Description:</Typography.Text> {t.desc}
                          {t.rules_rule_configs?.length ? (
                            <>
                              <Typography.Text strong>Rules:</Typography.Text>
                              <ul>
                                {t.rules_rule_configs.map((rule, ri) => (
                                  <li key={ri}>
                                    <b>{rule.ruleId}</b>
                                    <ul>
                                      {rule.ruleConfigId.map((cfg, cfi) => (
                                        <li key={cfi}>{cfg}</li>
                                      ))}
                                    </ul>
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <Typography.Text>No rules found</Typography.Text>
                          )}
                        </Space>
                      </Descriptions.Item>
                    ))
                  )
                ) : (
                  <Descriptions.Item>No events found</Descriptions.Item>
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
                        {commonTranslations('networkMapReviewPage.submitReview')}
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
                        {commonTranslations('networkMapReviewPage.approve')}
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
                        {commonTranslations('networkMapReviewPage.reject')}
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
                        {commonTranslations('networkMapReviewPage.withdraw')}
                    </Button>
                )}

                {/* Edit (Return to Draft) */}
                

                {/* Abandon */}
                {canAbandon && (
                    <Button
                        type="primary"
                        className="bg-gray-700"
                        onClick={() => handleTransition('ABANDON', StateEnum['90_ABANDONED'])}
                        loading={isTransitioning}
                    >
                        {commonTranslations('networkMapReviewPage.abandon')}
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
                        {commonTranslations('networkMapReviewPage.deploy')}
                    </Button>
                )}

                {/* Retire */}
                {canTransition(privileges, 'networkMap', state, 'RETIRE') && (
                    <Button
                        onClick={() => handleTransition('RETIRE', StateEnum['22_RETIRED'])}
                        loading={isTransitioning}
                    >
                        {commonTranslations('networkMapReviewPage.retire')}
                    </Button>
                )}

                {/* Archive */}
                {canTransition(privileges, 'NETWORK_MAP', state, 'ARCHIVE') && (
                    <Button
                        onClick={() => handleTransition('ARCHIVE', StateEnum['91_ARCHIVED'])} // Removed the trailing backslash here
                        loading={isTransitioning}
                    >
                        {commonTranslations('networkMapReviewPage.archive')}
                    </Button>
                )}

                <Button onClick={() => router.back()}>
                    {commonTranslations('networkMapReviewPage.back')}
                </Button>
            </Space>
        </div>
    );
};