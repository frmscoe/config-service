import { useCallback, useEffect, useState } from 'react';
import List from './List';
import { getRules } from './service';
import { useAuth } from '~/context/auth';
import usePrivileges from '~/hooks/usePrivileges';
import AccessDeniedPage from '~/components/common/AccessDenied';

const NetworkMapList = () => {
    const [networkMaps, setNetworkMaps] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalItems, setTotalItems] = useState(0)
    const {profile} = useAuth();
    const {canViewRules} = usePrivileges();

    const onPageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const fetchRules = useCallback(() => {
        setError('');
        setLoading(true);
        getRules({ page, limit: 10 })
            .then(({ data }) => {
                setNetworkMaps(data?.rules || []);
                setTotalItems(data.count || 0);
            }).finally(() => {
                setLoading(false)
            }).catch((e) => {
                setError(e.response?.data?.message || e?.message || 'Something went wrong getting rules');
            })
    }, [page]);

    useEffect(() => {
        if(canViewRules) {
            fetchRules();
        }
    }, [fetchRules, canViewRules]);

    const retry = (pageNumber?: number) => {
        if(pageNumber) {
            setPage(pageNumber);
        } 
        fetchRules();
    }


    if(!canViewRules) {
        return <AccessDeniedPage/>
    }

    return <List
        loading={loading}
        error={error}
        retry={retry}
        data={networkMaps}
        page={page}
        total={totalItems}
        onPageChange={onPageChange}
        user={profile}

    />
}

export default NetworkMapList;