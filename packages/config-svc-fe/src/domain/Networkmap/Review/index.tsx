// <!-- SPDX-License-Identifier: Apache-2.0 -->
'use client'; // This component will run on the client

import { useCallback, useEffect, useState } from "react";
import { useRouter } from 'next/router'; // Using useRouter for Pages Router compatibility
import usePrivileges from "~/hooks/usePrivileges";
import AccessDeniedPage from "~/components/common/AccessDenied";
import { getNetworkMap } from "./service"; // Import the Typology service
import { INetworkMap } from "../types"; // Import ITypology from shared types
import { useCommonTranslations } from "~/hooks";
import { Review } from "./Review"; // Import the UI component itself
import FullScreenLoader from '~/components/common/FullScreenLoader'; // Assuming this component exists
import { Button, Alert } from 'antd';


const ReviewWrapper = () => {
  const router = useRouter();
  const { t: commonTranslations } = useCommonTranslations();

  // Extract typologyId from the URL query
  const networkMapId = (router.query.id || '') as string;

  const [loading, setLoading] = useState(true); // Start with loading true for initial fetch
  const [error, setError] = useState<string | null>(null);
  // const [typology, setTypology] = useState<ITypology | null>(null);
  const [networkMap, setNetworkMap] = useState<INetworkMap | null>(null);


  const { canViewNetworkMap } = usePrivileges();

  const fetchNetworkMapData = useCallback(async () => {
    if (!networkMapId) {
      // If no ID is present, we are in a loading state or an invalid URL
      setLoading(false);
      setError(commonTranslations('networkMapReviewPage.invalidId')); // You might want a specific message for this
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await getNetworkMap(networkMapId);
      setNetworkMap(data);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || commonTranslations('networkMapReviewPage.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [networkMapId, commonTranslations]);

  useEffect(() => {
    // Only fetch if router is ready and ID is present
    if (router.isReady) {
      fetchNetworkMapData();
    }
  }, [router.isReady, fetchNetworkMapData]);

  // Handle privilege check first
  if (!canViewNetworkMap) {
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
            <Button size="small" danger onClick={fetchNetworkMapData}>
              {commonTranslations('networkMapReviewPage.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  // Handle case where typology is not found after loading
  if (!networkMap) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message="Not Found"
          description={commonTranslations('networkMapReviewPage.notFound')}
          type="warning"
          showIcon
        />
      </div>
    );
  }

  // Pass fetched data and handlers to the UI component
  return (
    <Review
      networkMap={networkMap}
      fetchNetworkMap={fetchNetworkMapData} // Allow UI component to trigger re-fetch
    />
  );
};

export default ReviewWrapper;




