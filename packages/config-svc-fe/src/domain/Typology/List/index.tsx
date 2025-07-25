// <!-- SPDX-License-Identifier: Apache-2.0 -->
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
    const {canViewTypologies} = usePrivileges();

    // THIS IS THE CRITICAL FIX FOR onPageChange: it now accepts both newPage and pageSize
    const onPageChange = useCallback((newPage: number, pageSize: number) => {
        setPage(newPage);
        // console.log('Page changed to:', newPage, 'Page Size:', pageSize); // Optional: for debugging
    }, []); // Dependencies array is empty as setPage is a stable React dispatch function

    // fetchTypologies depends on 'page' so it re-runs when 'page' state changes
    const fetchTypologies = useCallback(() => {
        setError('');
        setLoading(true);
        // Call getTypologies with the current 'page' state
        getTypologies({ page, limit: 10 })
            .then(({ data }) => {
                setTypologies(data?.data || []);
                setTotalItems(data.total || 0); // Ensure this matches your API response 'total' field name
            }).finally(() => {
                setLoading(false)
            }).catch((e) => {
                setError(e.response?.data?.message || e?.message || 'Something went wrong getting rules');
            })
    }, [page]); // <-- 'page' MUST be in this dependency array

    // useEffect hooks to trigger fetchTypologies
    useEffect(() => {
        if(canViewTypologies) {
            fetchTypologies();
        }
    }, [fetchTypologies, canViewTypologies]); // <-- fetchTypologies is a dependency, and it internally depends on 'page'

    

    const retry = (pageNumber?: number) => {
        if(pageNumber) {
            setPage(pageNumber);
        }
        fetchTypologies(); // Re-fetch data
    }


    if(!canViewTypologies) {
        return <AccessDeniedPage/>
    }

    return <ListView
        loading={loading}
        error={error}
        retry={retry}
        data={typologies}
        page={page} // Pass the current page state to ListView
        total={totalItems} // Pass the total items count from API to ListView
        onPageChange={onPageChange} // Pass the correct onPageChange callback to ListView
    />
}

export default ListTopology;