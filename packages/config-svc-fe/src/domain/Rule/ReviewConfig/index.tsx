import { useCallback, useEffect, useState } from "react";
import { Review } from "./Review"
import usePrivileges from "~/hooks/usePrivileges";
import AccessDeniedPage from "~/components/common/AccessDenied";
import { getRule, getRuleConfig } from "./service";
import { useParams } from "next/navigation";
import { IRuleConfig } from "../RuleConfig/RuleConfigList/types";
import { IRule } from "../RuleDetailPage/service";
import { useAuth } from "~/context/auth";

const ReviewPage = () => {
    const [loading, setLoading] = useState(false);
    const { canReviewConfig } = usePrivileges();
    const [error, setError] = useState('');
    const [configuration, setConfiguration] = useState<IRuleConfig | null>(null);
    const [rule, setRule] = useState<IRule | null>(null);
    const { id } = useParams();
    const {profile} = useAuth();

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
                        }).catch((e) => {
                            Promise.resolve();
                        });
                }
            }).catch((e) => {
                setError(e?.response?.data?.message || e?.message || 'Something went wrong');
            }).finally(() => {
                setLoading(false);
            });

    }, []);

    useEffect(() => {
        if (canReviewConfig) {
            fetchConfig();
        }
    }, [canReviewConfig, id]);

    if (!canReviewConfig) {
        return <AccessDeniedPage />
    }
    return <Review
        loading={loading}
        configuration={configuration}
        error={error}
        fetchConfig={fetchConfig}
        rule={rule}
        user={profile}
    />
}

export default ReviewPage;