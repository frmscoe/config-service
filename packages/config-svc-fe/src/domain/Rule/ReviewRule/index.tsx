import { useCallback, useEffect, useState } from "react";
import { Review } from "./Review"
import usePrivileges from "~/hooks/usePrivileges";
import AccessDeniedPage from "~/components/common/AccessDenied";
import { getRule } from "./service";
import { useParams } from "next/navigation";
import { IRule } from "../RuleDetailPage/service";
import { useAuth } from "~/context/auth";

const ReviewPage = () => {
    const [loading, setLoading] = useState(false);
    const { canReviewRule } = usePrivileges();
    const [error, setError] = useState('');
    const [rule, setRule] = useState<IRule | null>(null);
    const { id } = useParams();
    const {profile} = useAuth();

    const fetchRule = useCallback(() => {
        setLoading(true);
        setError('');
        getRule(id as string)
            .then(({ data }) => {
                setRule(data);
            }).catch((e) => {
                setError(e?.response?.data?.message || e?.message || 'Something went wrong');
            }).finally(() => {
                setLoading(false);
            });

    }, []);

    useEffect(() => {
        if (canReviewRule) {
            fetchRule();
        }
    }, [canReviewRule, id]);

    if (!canReviewRule) {
        return <AccessDeniedPage />
    }
    return <Review
        loading={loading}
        error={error}
        fetchRule={fetchRule}
        rule={rule}
        user={profile}
    />
}

export default ReviewPage;