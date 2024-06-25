import { useCallback, useEffect, useState } from 'react';
import ListView from './List';
import { ITypology, getTypologies } from './service';
import usePrivileges from '~/hooks/usePrivileges';
import AccessDeniedPage from '~/components/common/AccessDenied';


const ListTopology = () => {
    const [typologies, setTypologies] = useState<ITypology[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalItems, setTotalItems] = useState(0)
    const {canViewTypologyList} = usePrivileges();

    const onPageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const fetchTypologies = useCallback(() => {
        setError('');
        setLoading(true);
        getTypologies({ page, limit: 10 })
            .then(({ data }) => {
                setTypologies(data?.data || []);
                setTotalItems(data.count || 0);
            }).finally(() => {
                setLoading(false)
            }).catch((e) => {
                setError(e.response?.data?.message || e?.message || 'Something went wrong getting rules');
            })
    }, [page]);

    useEffect(() => {
        if(canViewTypologyList) {
            fetchTypologies();
        }
    }, [fetchTypologies, canViewTypologyList]);

    const retry = (pageNumber?: number) => {
        if(pageNumber) {
            setPage(pageNumber);
        } 
        fetchTypologies();
    }


    if(!canViewTypologyList) {
        return <AccessDeniedPage/>
    }

    return <ListView
        loading={loading}
        error={error}
        retry={retry}
        data={typologies}
        page={page}
        total={totalItems}
        onPageChange={onPageChange}

    />
}

export default ListTopology;
