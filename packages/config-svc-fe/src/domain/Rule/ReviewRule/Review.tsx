// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React, { useMemo } from 'react';
import { Button, Card, Descriptions, List, Result, Space, Typography } from 'antd';
import type { DescriptionsProps } from 'antd';
import Link from 'next/link';
import FullScreenLoader from '~/components/common/FullScreenLoader';
import { useCommonTranslations } from '~/hooks';
import { IUserProfile } from '~/context/auth';
import { IFullRule } from './types';
import usePrivileges from '~/hooks/usePrivileges';
import { canTransition } from '../../../../machine/guards';

const { Title, Text } = Typography;

interface Props {
  loading: boolean;
  error: string;
  fetchRule: () => void;
  rule: IFullRule | null;
  user: IUserProfile;
}

export const Review: React.FunctionComponent<Props> = ({
  loading,
  error,
  fetchRule,
  rule,
  user,
}) => {
  const { t } = useCommonTranslations();
  const { privileges } = usePrivileges();

  const items = useMemo(() => {
    const data: DescriptionsProps['items'] = [];
    const { name, cfg, createdAt, updatedAt, desc, state } = rule || ({} as IFullRule);
    data.push({ key: '1', label: t('ruleReviewPage.rule'), children: name, span: 12 });
    data.push({ key: '2', label: t('ruleReviewPage.version'), children: cfg, span: 12 });
    data.push({ key: '3', label: t('ruleReviewPage.description'), children: desc, span: 12 });
    data.push({ key: '5', label: t('ruleReviewPage.created'), children: new Date(createdAt).toDateString(), span: 12 });
    data.push({ key: '6', label: t('ruleReviewPage.updated'), children: new Date(updatedAt).toDateString(), span: 12 });
    data.push({ key: '7', label: t('ruleReviewPage.state'), children: state, span: 12 });
    return data;
  }, [rule, t]);

  // const canApprove = useMemo(() => {
  //   const isPendingReview = rule?.state?.toLocaleLowerCase().includes('pending');
  //   const isUpdater = user?.username === rule?.ownerId;
  //   const hasApprovalPrivileges = user?.privileges?.includes('SECURITY_APPROVE_RULE');
  //   return isPendingReview && !isUpdater && hasApprovalPrivileges;
  // }, [user, rule]);
  // const canApprove = useMemo(() => {
  //   return rule && canTransition(privileges, 'RULE', rule.state, 'APPROVE');
  // }, [rule, privileges]);

  // const canReject = useMemo(() => {
  //   return rule && canTransition(privileges, 'RULE', rule.state, 'REJECT');
  // }, [rule, privileges]);

  // const canWithdraw = useMemo(() => {
  //   return rule && canTransition(privileges, 'RULE', rule.state, 'WITHDRAW');
  // }, [rule, privileges]);

  // const canAbandon = useMemo(() => {
  //   return rule && canTransition(privileges, 'RULE', rule.state, 'ABANDON');
  // }, [rule, privileges]);

  // const canSubmit = useMemo(() => {
  //   return rule && canTransition(privileges, 'RULE', rule.state, 'SUBMIT_REVIEW');
  // }, [rule, privileges]);
  const canSubmit = useMemo(() => {
    return rule && canTransition(privileges, 'RULE', rule.state, 'SUBMIT_REVIEW');
  }, [rule, privileges]);

  const canApprove = useMemo(() => {
    return rule && canTransition(privileges, 'RULE', rule.state, 'APPROVE');
  }, [rule, privileges]);

  const canReject = useMemo(() => {
    return rule && canTransition(privileges, 'RULE', rule.state, 'REJECT');
  }, [rule, privileges]);

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
    return rule && canTransition(privileges, 'RULE', rule.state, 'ABANDON');
  }, [rule, privileges]);



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

        {/*{config?.parameters?.length > 0 && (
          <Card title="Parameters">
            <List
              dataSource={config.parameters}
              renderItem={(p, index) => (
                <List.Item key={index}>
                  <Space direction="vertical" size={0}>
                    <Text strong>{p.ParameterName}</Text>
                    <Text type="secondary">Type: {p.ParameterType}</Text>
                    <Text>Value: {p.ParameterValue}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        )}

        {config?.bands?.length > 0 && (
          <Card title="Bands">
            <List
              dataSource={config.bands}
              renderItem={(b, index) => (
                <List.Item key={index}>
                  <Space direction="vertical" size={0}>
                    <Text strong>Band {index + 1}</Text>
                    <Text>Lower Limit: {b.lowerLimit}</Text>
                    <Text>Upper Limit: {b.upperLimit}</Text>
                    <Text type="secondary">Reason: {b.reason}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        )}

        {config?.cases?.length > 0 && (
          <Card title="Cases">
            <List
              dataSource={config.cases}
              renderItem={(c, index) => (
                <List.Item key={index}>
                  <Space direction="vertical" size={0}>
                    <Text strong>Case {index + 1}</Text>
                    <Text>Value: {c.value}</Text>
                    <Text type="secondary">Reason: {c.reason}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        )}

        {config?.exitConditions?.length > 0 && (
          <Card title="Exit Conditions">
            <List
              dataSource={config.exitConditions}
              renderItem={(e, index) => (
                <List.Item key={index}>
                  <Space direction="vertical" size={0}>
                    <Text strong>Exit {index + 1}</Text>
                    <Text type="secondary">{e.reason}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        )}*/}

        {rule?.ruleConfigs?.map((cfg, index) => (
          <div key={cfg._key || index} className="space-y-4 border border-gray-300 p-4 rounded-md">
            <Title level={4}>{t('ruleReviewPage.version')} {cfg.cfg}</Title>
            <Text type="secondary">{cfg.desc}</Text>

            {cfg.config.parameters?.length > 0 && (
              <Card title={t('ruleReviewPage.parameters')}>
                <List
                  dataSource={cfg.config.parameters}
                  renderItem={(p, idx) => (
                    <List.Item key={idx}>
                      <Space direction="vertical" size={0}>
                        <Text strong>{p.ParameterName}</Text>
                        <Text type="secondary">Type: {p.ParameterType}</Text>
                        <Text>Value: {p.ParameterValue}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {cfg.config.bands?.length > 0 && (
              <Card title={t('ruleReviewPage.bands')}>
                <List
                  dataSource={cfg.config.bands}
                  renderItem={(b, idx) => (
                    <List.Item key={idx}>
                      <Space direction="vertical" size={0}>
                        <Text strong>Band {idx + 1}</Text>
                        <Text>Lower Limit: {b.lowerLimit}</Text>
                        <Text>Upper Limit: {b.upperLimit}</Text>
                        <Text type="secondary">Reason: {b.reason}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {cfg.config.cases?.length > 0 && (
              <Card title={t('ruleReviewPage.cases')}>
                <List
                  dataSource={cfg.config.cases}
                  renderItem={(c, idx) => (
                    <List.Item key={idx}>
                      <Space direction="vertical" size={0}>
                        <Text strong>Case {idx + 1}</Text>
                        <Text>Value: {c.value}</Text>
                        <Text type="secondary">Reason: {c.reason}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {cfg.config.exitConditions?.length > 0 && (
              <Card title={t('ruleReviewPage.exitConditions')}>
                <List
                  dataSource={cfg.config.exitConditions}
                  renderItem={(e, idx) => (
                    <List.Item key={idx}>
                      <Space direction="vertical" size={0}>
                        <Text strong>Exit {idx + 1}</Text>
                        <Text type="secondary">{e.reason}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </div>
        ))}



        <div className="mt-4 space-x-3">
          
                
          {/*{canSubmit && (
            <Button type="primary" className="bg-blue-600">
              {t('ruleReviewPage.submitForReview')}
            </Button>
          )}

          {canApprove && (
            <Button type="primary" className="bg-green-600">
              {t('ruleReviewPage.approve')}
            </Button>
          )}
          {canReject && (
            <Button type="primary" className="bg-yellow-600">
              {t('ruleReviewPage.reject')}
            </Button>
          )}
          {canWithdraw && (
            <Button type="primary" className="bg-orange-600">
              {t('ruleReviewPage.withdraw')}
            </Button>
          )}
          {canAbandon && (
            <Button type="primary" className="bg-gray-700">
              {t('ruleReviewPage.abandon')}
            </Button>
          )}*/}

          {canSubmit && (
              <Button type="primary" className="bg-blue-600">
                {t('stateMachine.submitForReview')}
              </Button>
            )}

            {canApprove && (
              <Button type="primary" className="bg-green-600">
                {t('stateMachine.approve')}
              </Button>
            )}

            {canReject && (
              <Button type="primary" className="bg-yellow-600">
                {t('stateMachine.reject')}
              </Button>
            )}

            {canWithdraw && (
              <Button type="primary" className="bg-orange-600">
                {t('stateMachine.withdraw')}
              </Button>
            )}

            {canRetire && (
              <Button type="primary" className="bg-purple-600">
                {t('stateMachine.retire')}
              </Button>
            )}

            {canArchive && (
              <Button type="primary" className="bg-stone-600">
                {t('stateMachine.archive')}
              </Button>
            )}

            {canDeploy && (
              <Button type="primary" className="bg-teal-600">
                {t('stateMachine.deploy')}
              </Button>
            )}

            {canAbandon && (
              <Button type="primary" className="bg-gray-700">
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
