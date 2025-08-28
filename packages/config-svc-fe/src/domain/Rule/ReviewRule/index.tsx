// <!-- SPDX-License-Identifier: Apache-2.0 -->
'use client';

import { useCallback, useEffect, useState } from "react";
import { Review } from "./Review";
import usePrivileges from "~/hooks/usePrivileges";
import AccessDeniedPage from "~/components/common/AccessDenied";
import { getFullRuleConfig, updateRuleState } from "./service";
import { useParams } from "next/navigation";
import { IFullRule } from "./types";
import { useAuth } from "~/context/auth";
import { canTransition } from '../../../../machine/guards';

const ReviewPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rule, setRule] = useState<IFullRule | null>(null);
  const id = (useParams()?.id || '') as string;
  const { privileges } = usePrivileges();
  const { profile } = useAuth();

  const fetchRule = useCallback(() => {
    setLoading(true);
    setError('');
    getFullRuleConfig(id as string)
      .then(({ data }) => {
        setRule({
          ...data.rule,
          ruleConfigs: data.ruleConfigs,
        });
      })
      .catch((e) => {
        setError(e?.response?.data?.message || e?.message || 'Something went wrong');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetchRule();
  }, [fetchRule]);

  // const canReview = rule && canTransition(privileges, 'RULE', rule.state, 'REVIEW');
  const canReview = privileges.includes('SECURITY_GET_RULE');
  // const canReview = true;


  if (!canReview) {
    return <AccessDeniedPage />;
  }

  return (
    <Review
      loading={loading}
      error={error}
      fetchRule={fetchRule}
      rule={rule}
      user={profile}
    />
  );
};

export default ReviewPage;
