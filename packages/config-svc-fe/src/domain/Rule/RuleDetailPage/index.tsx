import { useCallback, useEffect, useState } from 'react';
import RuleView from './RuleDetailPage';
import { IRule, getRules } from './service';
import { useAuth } from '~/context/auth';
import usePrivileges from '~/hooks/usePrivileges';
import AccessDeniedPage from '~/components/common/AccessDenied';

const Rule = () => {
    const [rules, setRules] = useState<IRule[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalItems, setTotalItems] = useState(0)
    const [open, setOpen] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const[selectedRule, setSelectedRule] = useState<IRule | null>(null);

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
                setRules(data?.rules || []);
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

    return <RuleView
        loading={loading}
        error={error}
        retry={retry}
        data={rules}
        page={page}
        total={totalItems}
        onPageChange={onPageChange}
        open={open}
        setOpen={setOpen}
        user={profile}
        openEdit={openEdit}
        setOpenEdit={setOpenEdit}
        selectedRule={selectedRule}
        setSelectedRule={setSelectedRule}

    />
}

export default Rule;