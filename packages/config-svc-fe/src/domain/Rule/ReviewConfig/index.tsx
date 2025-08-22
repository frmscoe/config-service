// SPDX-License-Identifier: Apache-2.0
'use client';

import { useCallback, useEffect, useState, useMemo } from "react";
import { Review } from "./Review";
import usePrivileges from "~/hooks/usePrivileges";
import AccessDeniedPage from "~/components/common/AccessDenied";
import { getRule, getRuleConfig } from "./service";
import { useParams } from "next/navigation";
import { IRuleConfig } from "../RuleConfig/RuleConfigList/types";
import { IRule } from "../RuleDetailPage/service";
import { useAuth } from "~/context/auth";
import { canTransition } from '../../../../machine/guards';

const ReviewPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [configuration, setConfiguration] = useState<IRuleConfig | null>(null);
    const [rule, setRule] = useState<IRule | null>(null);
    const { id } = useParams();
    const { privileges } = usePrivileges();
    const { profile } = useAuth();

    const fetchConfig = useCallback(() => {
        setLoading(true);
        setError('');
        getRuleConfig(id as string)
            .then(({ data }) => {
                setConfiguration(data);
                const [, ruleId] = data?.ruleId?.split('/');
                if (ruleId) {
                    getRule(ruleId)
                        .then((res) => {
                            setRule(res.data);
                        }).catch(() => Promise.resolve());
                }
            })
            .catch((e) => {
                setError(e?.response?.data?.message || e?.message || 'Something went wrong');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const canReview = useMemo(() => {
        console.log("--- Rule Config Review Page Debug Info ---");
        console.log("User Privileges (from usePrivileges):", privileges);
        console.log("Configuration Loaded:", !!configuration);
        if (configuration) {
            console.log("Full Configuration Object:", configuration);
            console.log("Configuration State:", configuration.state);
            const result = canTransition(privileges, 'RULE_CONFIG', configuration.state, 'REVIEW');
            console.log(`canTransition(privileges, 'RULE_CONFIG', '${configuration.state}', 'REVIEW'):`, result);
            console.log("Is Access Denied (based on initial check):", !result);
            return result;
        } else {
            console.log("Configuration is null (still loading or failed to load).");
            // If configuration is null (e.g., loading), we don't want to show AccessDeniedPage yet.
            // We should only show it if configuration is loaded AND the user cannot review.
            return false;
        }
        // No need for a separate console.log here as it's inside the conditional block
    }, [privileges, configuration]);

    // The condition that shows the AccessDeniedPage
    // Show AccessDeniedPage ONLY IF configuration IS loaded AND canReview is false
    if (!loading && configuration && !canReview) {
        return <AccessDeniedPage />;
    }

    return (
        <Review
            loading={loading}
            configuration={configuration}
            error={error}
            fetchConfig={fetchConfig}
            rule={rule}
            user={profile}
        />
    );
};

export default ReviewPage;