// <!-- SPDX-License-Identifier: Apache-2.0 -->
'use client'; // This component will run on the client

import { useCallback, useEffect, useState } from "react";
import { useRouter } from 'next/router'; // Using useRouter for Pages Router compatibility
import usePrivileges from "~/hooks/usePrivileges";
import AccessDeniedPage from "~/components/common/AccessDenied";
import { getTypology } from "./service"; // Import the Typology service
import { ITypology } from "../types"; // Import ITypology from shared types
import { useCommonTranslations } from "~/hooks";
import { ReviewTypology } from "./ReviewTypology"; // Import the UI component itself
import FullScreenLoader from '~/components/common/FullScreenLoader'; // Assuming this component exists

const ReviewTypologyWrapper = () => {
  const router = useRouter();
  const { t: commonTranslations } = useCommonTranslations();

  // Extract typologyId from the URL query
  const typologyId = (router.query.id || '') as string;

  const [loading, setLoading] = useState(true); // Start with loading true for initial fetch
  const [error, setError] = useState<string | null>(null);
  const [typology, setTypology] = useState<ITypology | null>(null);

  const { canViewTypology } = usePrivileges();

  const fetchTypologyData = useCallback(async () => {
    if (!typologyId) {
      // If no ID is present, we are in a loading state or an invalid URL
      setLoading(false);
      setError(commonTranslations('typologyReviewPage.invalidId')); // You might want a specific message for this
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

  // Handle privilege check first
  if (!canViewTypology) {
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

  // Handle case where typology is not found after loading
  if (!typology) {
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

  // Pass fetched data and handlers to the UI component
  return (
    <ReviewTypology
      typology={typology}
      fetchTypology={fetchTypologyData} // Allow UI component to trigger re-fetch
    />
  );
};

export default ReviewTypologyWrapper;