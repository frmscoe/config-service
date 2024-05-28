import "~/i18n/config";
import "~/styles/globals.scss";
import 'reactflow/dist/style.css';

import type { AppProps } from "next/app";
import React from "react";

import { LayoutSwitcher } from "~/components/layout";
import { AuthProvider } from "~/context/auth";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <LayoutSwitcher>
        <Component {...pageProps} />
      </LayoutSwitcher>
    </AuthProvider>
  );
}

