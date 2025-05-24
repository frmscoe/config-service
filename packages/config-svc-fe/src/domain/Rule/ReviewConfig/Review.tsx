// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React, { useMemo } from 'react';
import { Button, Descriptions, Result, Typography, Table, Empty } from 'antd';
import type { DescriptionsProps } from 'antd';
import Link from 'next/link';
import FullScreenLoader from '~/components/common/FullScreenLoader';
import { IRuleConfig } from '../RuleConfig/RuleConfigList/types';
import { IRule } from '../RuleDetailPage/service';
import { useCommonTranslations } from '~/hooks';
import { IUserProfile } from '~/context/auth';

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

  const items = useMemo(() => {
    const data: DescriptionsProps['items'] = [];
    const { cfg, createdAt, updatedAt, desc, state } = configuration || ({} as IRuleConfig);
    data.push({ key: '1', label: t('ruleConfigReviewPage.version'), children: cfg, span: 12 });
    data.push({ key: '2', label: t('ruleConfigReviewPage.description'), children: desc, span: 12 });
    data.push({ key: '4', label: t('ruleConfigReviewPage.created'), children: new Date(createdAt).toDateString(), span: 12 });
    data.push({ key: '5', label: t('ruleConfigReviewPage.updated'), children: new Date(updatedAt).toDateString(), span: 12 });
    data.push({ key: '6', label: t('ruleConfigReviewPage.state'), children: state, span: 12 });
    if (rule?._key) {
      data.push({ key: '3', label: t('ruleConfigReviewPage.rule'), children: rule.name, span: 12 });
    }
    return data;
  }, [configuration, rule, t]);

  const canApprove = useMemo(() => {
    const isPendingReview = configuration?.state?.toLocaleLowerCase().includes('pending');
    const isUpdater = user?.username === configuration?.ownerId;
    const hasApprovalPrivileges = user?.privileges?.includes('SECURITY_APPROVE_RULE_CONFIG');
    return isPendingReview && !isUpdater && hasApprovalPrivileges;
  }, [user, configuration]);

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
        <Empty description={`No ${title.toLowerCase()} found`} />
      )}
    </div>
  );

  if (loading) return <FullScreenLoader />;

  if (error) {
    return (
      <Result
        data-testid="error"
        title="Error"
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
    <div className="p-6">
      {/*<Button className="mb-2 bg-red-500 text-white ml-1">
        <Link href="/rule-config">{t('ruleConfigReviewPage.backToList')}</Link>
      </Button>*/}

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

      {/* Parameters */}
      {renderSection('Parameters', [
        { title: 'Name', dataIndex: 'ParameterName', key: 'name' },
        { title: 'Value', dataIndex: 'ParameterValue', key: 'value' },
        { title: 'Type', dataIndex: 'ParameterType', key: 'type' }
      ], config.parameters || [])}

      {/* Bands */}
      {renderSection('Bands', [
        { title: 'Sub Rule Ref', dataIndex: 'subRuleRef', key: 'subRuleRef' },
        { title: 'Upper Limit', dataIndex: 'upperLimit', key: 'upperLimit' },
        { title: 'Lower Limit', dataIndex: 'lowerLimit', key: 'lowerLimit' },
        { title: 'Reason', dataIndex: 'reason', key: 'reason' }
      ], config.bands || [])}

      {/* Cases */}
      {renderSection('Cases', [
        { title: 'Sub Rule Ref', dataIndex: 'subRuleRef', key: 'subRuleRef' },
        { title: 'Value', dataIndex: 'value', key: 'value' },
        { title: 'Reason', dataIndex: 'reason', key: 'reason' }
      ], config.cases || [])}

      {/* Exit Conditions */}
      {renderSection('Exit Conditions', [
        { title: 'Sub Rule Ref', dataIndex: 'subRuleRef', key: 'subRuleRef' },
        { title: 'Reason', dataIndex: 'reason', key: 'reason' }
      ], config.exitConditions || [])}

      {canApprove && (
        <Button type="primary" className="mt-2 ml-2 mb-5 bg-blue-500 mr-2">
          {t('ruleConfigReviewPage.approve')}
        </Button>
      )}

      <Button type="primary" className="mt-2 bg-red-500">
        <Link href="/rule-config">{t('ruleConfigReviewPage.cancel')}</Link>
      </Button>
    </div>
  );
};
