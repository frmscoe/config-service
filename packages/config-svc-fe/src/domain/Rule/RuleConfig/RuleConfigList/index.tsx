import { useCallback, useEffect, useState } from 'react';
import RuleView from './RuleConfigList';
import { getRules, getRulesWithConfigs } from './service';
import { IRuleConfig } from './types';
import { useAuth } from '~/context/auth';
import { IRule } from '../../RuleDetailPage/service';
import usePrivileges from '~/hooks/usePrivileges';
import AccessDeniedPage from '~/components/common/AccessDenied';


const RuleConfig = () => {
    const [configurations, setConfigurations] = useState<IRule[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalItems, setTotalItems] = useState(0)
    const {profile} = useAuth();
    const {canViewRuleWithConfigs} = usePrivileges();

    const onPageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const fetchConfigurations = useCallback(() => {
        setError('');
        setLoading(true);
        getRulesWithConfigs({ page, limit: 10 })
            .then(({ data }) => {
                setConfigurations(data?.rules || []);
                setTotalItems(data.count || 0);
            }).finally(() => {
                setLoading(false)
            }).catch((e) => {
                setError(e.response?.data?.message || e?.message || 'Something went wrong getting configurations');
            })
    }, [page]);

    useEffect(() => {
        if(canViewRuleWithConfigs) {
            fetchConfigurations();
        }
    }, [fetchConfigurations, canViewRuleWithConfigs]);

    if(!canViewRuleWithConfigs) {
        return <AccessDeniedPage/>
    }

    return <RuleView
        loading={loading}
        error={error}
        retry={fetchConfigurations}
        data={configurations}
        page={page}
        total={totalItems}
        onPageChange={onPageChange}
        user={profile}

    />
}

export default RuleConfig;