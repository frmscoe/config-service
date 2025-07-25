// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React, { useMemo, useEffect, useState } from 'react';
import { Button, Descriptions, Result, Typography, Table, Empty, Space, message, Card, List } from 'antd';
import type { DescriptionsProps } from 'antd';
import Link from 'next/link';
import FullScreenLoader from '~/components/common/FullScreenLoader';
import { IRuleConfig, StateEnum } from '../RuleConfig/RuleConfigList/types'; // Import StateEnum here
import { IRule } from '../RuleDetailPage/service';
import { useCommonTranslations } from '~/hooks';
import { IUserProfile } from '~/context/auth';
import usePrivileges from '~/hooks/usePrivileges';
import { canTransition } from '../../../../machine/guards';
import { nextStateMap } from '../../../../machine/configStateMachine';
import { transitionRuleConfigState } from './service'; // Corrected import name
import { useRouter } from 'next/router';


const { Title, Text } = Typography;

interface Props {
  loading: boolean;
  configuration: IRuleConfig | null;
  error: string;
  fetchConfig: () => void;
  rule: IRule | null;
  user: IUserProfile;
}

export const Review: React.FunctionComponent<Props> = ({
  loading,
  error,
  fetchConfig,
  configuration,
  rule,
  user
}) => {
  const { t } = useCommonTranslations();
  const { privileges } = usePrivileges();
  const router = useRouter();
  const [username, setUsername] = useState<string>('');


  // Console logs for debugging button visibility
  useEffect(() => {
    console.log("--- Rule Config Review Component Debug Info ---");
    console.log("Current Rule Config State:", configuration?.state);
    console.log("User Privileges (in Review.tsx):", privileges);
    console.log("--- Button Permissions ---");
    const currentState = configuration?.state || '';
    console.log("canSubmit:", configuration && canTransition(privileges, 'RULE_CONFIG', currentState, 'SUBMIT_REVIEW'));
    console.log("canApprove:", configuration && canTransition(privileges, 'RULE_CONFIG', currentState, 'APPROVE'));
    console.log("canReject:", configuration && canTransition(privileges, 'RULE_CONFIG', currentState, 'REJECT'));
    console.log("canWithdraw:", configuration && canTransition(privileges, 'RULE_CONFIG', currentState, 'WITHDRAW'));
    console.log("canDeploy:", configuration && canTransition(privileges, 'RULE_CONFIG', currentState, 'DEPLOY'));
    console.log("canRetire:", configuration && canTransition(privileges, 'RULE_CONFIG', currentState, 'RETIRE'));
    console.log("canArchive:", configuration && canTransition(privileges, 'RULE_CONFIG', currentState, 'ARCHIVE'));
    console.log("canAbandon:", configuration && canTransition(privileges, 'RULE_CONFIG', currentState, 'ABANDON'));
    console.log("-----------------------------------------------");
  }, [configuration, privileges]);


  const items = useMemo(() => {
    const data: DescriptionsProps['items'] = [];
    const { cfg, createdAt, updatedAt, desc, state } = configuration || ({} as IRuleConfig);

    data.push({ key: '1', label: t('ruleConfigReviewPage.version'), children: cfg, span: 12 });
    data.push({ key: '2', label: t('ruleConfigReviewPage.description'), children: desc, span: 12 });
    data.push({ key: '4', label: t('ruleConfigReviewPage.created'), children: new Date(createdAt).toDateString(), span: 12 });
    data.push({ key: '5', label: t('ruleConfigReviewPage.updated'), children: new Date(updatedAt).toDateString(), span: 12 });
    data.push({ key: '6', label: t('ruleConfigReviewPage.state'), children: state, span: 12 });

    if (rule?.name) {
      data.push({ key: '3', label: t('ruleConfigReviewPage.rule'), children: rule.name, span: 12 });
    }
    return data;
  }, [configuration, rule, t]);

  useEffect(() => {
      const stored = localStorage.getItem('config_svc_username');
      if (stored) setUsername(stored.toLowerCase());
    }, []);

  // const canSubmit = useMemo(() => {
  //   return configuration && canTransition(privileges, 'RULE_CONFIG', configuration.state, 'SUBMIT_REVIEW');
  // }, [configuration, privileges]);

  const canSubmit = useMemo(() => {
    const ownerId = configuration?.ownerId?.toLowerCase() || '';
    return configuration && canTransition(privileges, 'RULE_CONFIG', configuration.state, 'SUBMIT_REVIEW') && username === ownerId;
  }, [configuration, privileges, username]);



  const canApprove = useMemo(() => {
    const ownerId = configuration?.ownerId?.toLowerCase() || '';
    return (
      configuration &&
      configuration.state === '10_PENDING_REVIEW' &&
      canTransition(privileges, 'RULE_CONFIG', configuration.state, 'APPROVE', ownerId) &&
      username !== ownerId
    );
  }, [configuration, privileges, username]);

  const canReject = useMemo(() => {
    const ownerId = configuration?.ownerId?.toLowerCase() || '';
    return (
      configuration &&
      configuration.state === '10_PENDING_REVIEW' &&
      canTransition(privileges, 'RULE_CONFIG', configuration.state, 'REJECT', ownerId) &&
      username !== ownerId
    );
  }, [configuration, privileges, username]);


  const canWithdraw = useMemo(() => {
    return configuration && canTransition(privileges, 'RULE_CONFIG', configuration.state, 'WITHDRAW');
  }, [configuration, privileges]);

  const canRetire = useMemo(() => {
    return configuration && canTransition(privileges, 'RULE_CONFIG', configuration.state, 'RETIRE');
  }, [configuration, privileges]);

  const canArchive = useMemo(() => {
    return configuration && canTransition(privileges, 'RULE_CONFIG', configuration.state, 'ARCHIVE');
  }, [configuration, privileges]);

  const canDeploy = useMemo(() => {
    return configuration && canTransition(privileges, 'RULE_CONFIG', configuration.state, 'DEPLOY');
  }, [configuration, privileges]);

  

  const canAbandon = useMemo(() => {
    const ownerId = configuration?.ownerId?.toLowerCase() || '';
    return (
      configuration &&
      canTransition(privileges, 'RULE_CONFIG', configuration.state, 'ABANDON') &&
      username === ownerId
    );
  }, [configuration, privileges, username]);



  

  const handleTransition = async (eventType: string) => {
    console.log("Attempting transition:", eventType);
    console.log("Current configuration object received by handleTransition:", configuration);
    console.log("Configuration._key:", configuration?._key);
    console.log("Configuration.state:", configuration?.state);

    if (!configuration?._key || !configuration?.state) {
      console.error("Critical: Missing configuration ID (_key) or state for transition.");
      message.error(t('ruleConfigReviewPage.idStateRequiredError') || "Rule Config ID and state required.");
      return;
    }

    const nextState = nextStateMap[configuration.state]?.[eventType] as StateEnum | undefined;

    if (!nextState) {
      message.error(
        t('ruleConfigReviewPage.invalidTransition', { currentState: configuration.state, eventType }) ||
        `Invalid transition: ${configuration.state} + ${eventType}`
      );
      return;
    }

    try {
      await transitionRuleConfigState(configuration._key, nextState);

      message.success(
        t('ruleConfigReviewPage.stateUpdatedSuccessfully', { nextState }) ||
        `State updated to ${nextState}`
      );

      // Redirect if terminal state
      if (nextState === '90_ABANDONED' || nextState === '91_ARCHIVED') {
        router.push('/rule-config'); // ⬅️ Redirect to rule config list
      } else {
        fetchConfig(); // Otherwise refresh the current config
      }

    } catch (err: any) {
      console.error("Transition API Error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('generalError') ||
        'Failed to update state';
      message.error(errorMessage);
    }
  };



  // Render section utility from your previous code
  const renderSection = (title: string, columns: any[], data: any[]) => (
    <div className="my-6">
      <Typography.Title level={4}>{title}</Typography.Title>
      {data?.length ? (
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          rowKey={(record, index) => index.toString()}
          bordered
          size="small"
        />
      ) : (
        <Empty description={`${t('ruleConfigReviewPage.no')} ${title.toLowerCase()} ${t('ruleConfigReviewPage.found')}`} />
      )}
    </div>
  );


  if (loading) return <FullScreenLoader />;

  if (error) {
    return (
      <Result
        data-testid="error"
        title={t('ruleConfigReviewPage.errorTitle') || "Error"}
        status="500"
        subTitle={error}
        extra={[
          <Button onClick={fetchConfig} type="primary" key="console" className="bg-blue-500">
            {t('ruleConfigReviewPage.retry')}
          </Button>
        ]}
      />
    );
  }

  const config = configuration?.config || {};

  return (
    <div className="p-6 space-y-6">
      <Descriptions
        column={12}
        layout="horizontal"
        title={
          <Typography.Title level={2} className="text-center">
            {t('ruleConfigReviewPage.review')}
          </Typography.Title>
        }
        bordered
        items={items}
      />

      {configuration?.config && (
        <div className="space-y-4 border border-gray-300 p-4 rounded-md">
          {/*{renderSection(t('ruleConfigReviewPage.parameters'), [
            { title: t('ruleConfigReviewPage.name'), dataIndex: 'ParameterName', key: 'name' },
            { title: t('ruleConfigReviewPage.value'), dataIndex: 'ParameterValue', key: 'value' },
            { title: t('ruleConfigReviewPage.type'), dataIndex: 'ParameterType', key: 'type' }
          ], config.parameters || [])}

          {renderSection(t('ruleConfigReviewPage.bands'), [
            { title: t('ruleConfigReviewPage.subRuleRef'), dataIndex: 'subRuleRef', key: 'subRuleRef' },
            { title: 'Upper Limit', dataIndex: 'upperLimit', key: 'upperLimit' },
            { title: 'Lower Limit', dataIndex: 'lowerLimit', key: 'lowerLimit' },
            { title: t('ruleConfigReviewPage.reason'), dataIndex: 'reason', key: 'reason' }
          ], config.bands || [])}

          {renderSection(t('ruleConfigReviewPage.cases'), [
            { title: t('ruleConfigReviewPage.subRuleRef'), dataIndex: 'subRuleRef', key: 'subRuleRef' },
            { title: t('ruleConfigReviewPage.value'), dataIndex: 'value', key: 'value' },
            { title: t('ruleConfigReviewPage.reason'), dataIndex: 'reason', key: 'reason' }
          ], config.cases || [])}

          {renderSection(t('ruleConfigReviewPage.exitConditions'), [
            { title: t('ruleConfigReviewPage.subRuleRef'), dataIndex: 'subRuleRef', key: 'subRuleRef' },
            { title: t('ruleConfigReviewPage.reason'), dataIndex: 'reason', key: 'reason' }
          ], config.exitConditions || [])}*/}
          {Array.isArray(config.parameters) && config.parameters.length > 0 &&
            renderSection(t('ruleConfigReviewPage.parameters'), [
              { title: t('ruleConfigReviewPage.name'), dataIndex: 'ParameterName', key: 'name' },
              { title: t('ruleConfigReviewPage.value'), dataIndex: 'ParameterValue', key: 'value' },
              { title: t('ruleConfigReviewPage.type'), dataIndex: 'ParameterType', key: 'type' }
            ], config.parameters)}

          {Array.isArray(config.bands) && config.bands.length > 0 &&
            renderSection(t('ruleConfigReviewPage.bands'), [
              { title: t('ruleConfigReviewPage.subRuleRef'), dataIndex: 'subRuleRef', key: 'subRuleRef' },
              { title: 'Upper Limit', dataIndex: 'upperLimit', key: 'upperLimit' },
              { title: 'Lower Limit', dataIndex: 'lowerLimit', key: 'lowerLimit' },
              { title: t('ruleConfigReviewPage.reason'), dataIndex: 'reason', key: 'reason' }
            ], config.bands)}

          {Array.isArray(config.cases) && config.cases.length > 0 &&
            renderSection(t('ruleConfigReviewPage.cases'), [
              { title: t('ruleConfigReviewPage.subRuleRef'), dataIndex: 'subRuleRef', key: 'subRuleRef' },
              { title: t('ruleConfigReviewPage.value'), dataIndex: 'value', key: 'value' },
              { title: t('ruleConfigReviewPage.reason'), dataIndex: 'reason', key: 'reason' }
            ], config.cases)}

          {Array.isArray(config.exitConditions) && config.exitConditions.length > 0 &&
            renderSection(t('ruleConfigReviewPage.exitConditions'), [
              { title: t('ruleConfigReviewPage.subRuleRef'), dataIndex: 'subRuleRef', key: 'subRuleRef' },
              { title: t('ruleConfigReviewPage.reason'), dataIndex: 'reason', key: 'reason' }
            ], config.exitConditions)}

        </div>
      )}

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
          <Link href="/rule-config">{t('ruleConfigReviewPage.cancel')}</Link>
        </Button>
      </div>
    </div>
  );
};