import classNames from "classnames";
import type { ReactNode } from "react";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";

import { Icon } from "~/components/common/Icon";

import { Sidebar } from "./components/Sidebar";
import { UserCard } from "./components/UserCard";
import styles from "./Layout.module.scss";

type LayoutPropsType = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutPropsType) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mobileView = useMediaQuery({ query: "(max-width: 800px)" });

  return (
    <div className={styles["layout-container"]}>
      <Sidebar onSetIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} />

      {!(mobileView && isSidebarOpen) && (
        <div className={styles["layout-right"]}>
          <div className={styles["layout-header"]}>
            {mobileView && (
              <Icon
                name="menu"
                className={classNames("mx-5", "cursor-pointer")}
                size="medium"
                onClick={() => setIsSidebarOpen(true)}
              />
            )}

            {!mobileView && (
              <div className={styles["layout-header-buttons"]}>
                <UserCard
                  name="Joey Goksu"
                  accountRole="Admin"
                  image="/images/LinkedIn_profile.jpg"
                />
              </div>
            )}
          </div>
        {children}
        </div>
      )}
    </div>
  );
};
