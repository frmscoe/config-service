import type { ReactNode } from "react";
import React from "react";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { useAuth } from "~/context/auth";

import { AuthLayout, Layout } from "./components";
import FullScreenLoader from "~/components/common/FullScreenLoader";

interface Props {
  children: ReactNode;
}

const LayoutSwitcher = ({ children }: Props) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenLoader />
  }

  if(isAuthenticated) {
    return (
      <Layout>
        <AntdRegistry>
          {children}
        </AntdRegistry>
      </Layout>)
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