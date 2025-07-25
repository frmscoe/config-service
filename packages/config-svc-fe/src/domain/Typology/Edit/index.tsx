// <!-- SPDX-License-Identifier: Apache-2.0 -->
'use client'; // This component will run on the client

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from 'next/router'; // Using useRouter for Pages Router compatibility
import usePrivileges from "~/hooks/usePrivileges";
import AccessDeniedPage from "~/components/common/AccessDenied";
import { getTypology } from "./service"; // Import Typology service from THIS directory
import { ITypology } from "~/domain/typology/types"; // Import ITypology from shared types
import { useCommonTranslations } from "~/hooks";
import { Edit } from "./Edit"; // Import the UI component itself from THIS directory
import FullScreenLoader from '~/components/common/FullScreenLoader'; // Assuming this component exists
// FIXED: Added Row, Col, Alert, Button, Spin to the Ant Design import as they are used directly in this wrapper
import { Alert, Button, Spin, Row, Col } from 'antd';

const EditTypologyWrapper = () => {
    const router = useRouter();
    const { t: commonTranslations } = useCommonTranslations();

    // Extract typologyId from the URL query or params (for consistency with your setup)
    const { id } = router.query;
    const typologyId = typeof id === 'string' ? id : ''; // Ensure it's a string

    const [loading, setLoading] = useState(true); // Start with loading true for initial fetch
    const [error, setError] = useState<string | null>(null);
    const [typology, setTypology] = useState<ITypology | null>(null);

    // Corrected privilege destructuring to use `canUpdateTypology` directly
    const { canViewTypology, canCreateTypology, canUpdateTypology } = usePrivileges();

    const fetchTypologyData = useCallback(async () => {
        if (!typologyId) {
            // For the edit page, a missing ID is an invalid state
            setLoading(false);
            setError(commonTranslations('typologyReviewPage.invalidId'));
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const { data } = await getTypology(typologyId);
            setTypology(data);
        } catch (e: any) {
            setError(e.response?.data?.message || e.message || commonTranslations('typologyReviewPage.fetchError'));
        } finally {
            setLoading(false);
        }
    }, [typologyId, commonTranslations]);

    useEffect(() => {
        // Only fetch if router is ready and ID is present
        if (router.isReady) {
            fetchTypologyData();
        }
    }, [router.isReady, fetchTypologyData]);

    // Unified authorization check for the page access
    const isAuthorized = useMemo(() => {
        if (typologyId) { // If there's a typology ID, it's an edit page
            // User needs to be able to view it AND update it to be on this page
            return canViewTypology && canUpdateTypology;
        } else { // If no typology ID, it's a create page
            // User needs to be able to create typologies
            return canCreateTypology;
        }
    }, [typologyId, canViewTypology, canUpdateTypology, canCreateTypology]);


    if (!isAuthorized) {
        return <AccessDeniedPage />;
    }

    // Show full screen loader while data is being fetched
    if (loading) {
        return <FullScreenLoader />;
    }

    // Handle errors after loading
    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" danger onClick={fetchTypologyData}>
                            {commonTranslations('typologyReviewPage.retry')}
                        </Button>
                    }
                />
            </div>
        );
    }

    // Handle case where typology is not found after loading for an edit page
    if (typologyId && !typology) {
        return (
            <div style={{ padding: '20px' }}>
                <Alert
                    message="Not Found"
                    description={commonTranslations('typologyReviewPage.notFound')}
                    type="warning"
                    showIcon
                />
            </div>
        );
    }

    // Pass fetched data and re-fetch handler to the UI component
    // If in create mode (`!typologyId`), pass `typology` as `null`.
    return (
        <Edit
            typology={typology} // Will be null for new creation, populated for edit
            fetchTypology={fetchTypologyData} // Allows the UI component to trigger a re-fetch if needed
        />
    );
};

export default EditTypologyWrapper;
