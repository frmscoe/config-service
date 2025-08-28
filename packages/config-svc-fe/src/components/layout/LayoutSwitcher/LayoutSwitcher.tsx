// <!-- SPDX-License-Identifier: Apache-2.0 -->
import type { ReactNode } from "react";
import React, { useEffect, useRef } from "react";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { useAuth } from "~/context/auth";

import { AuthLayout, Layout } from "./components";
import FullScreenLoader from "~/components/common/FullScreenLoader";

interface Props {
  children: ReactNode;
}

const LayoutSwitcher = ({ children }: Props) => {
  const { isAuthenticated, isLoading, logout } = useAuth(); // assuming you have logout()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        logout(); // log the user out
      }, INACTIVITY_TIMEOUT);
    };

    const activityEvents = ["mousemove", "keydown", "click", "scroll"];
    activityEvents.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // Start timer initially

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated, logout]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (isAuthenticated) {
    return (
      <Layout>
        <AntdRegistry>
          {children}
        </AntdRegistry>
      </Layout>
    );
  }

  return (
    <AuthLayout>
      <AntdRegistry>
        {children}
      </AntdRegistry>
    </AuthLayout>
  );
};

export { LayoutSwitcher };
