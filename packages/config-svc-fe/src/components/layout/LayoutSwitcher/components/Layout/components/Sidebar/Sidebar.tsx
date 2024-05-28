/* eslint-disable no-restricted-syntax */
import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "react-responsive";

import { Icon } from "~/components/common/Icon";
import { LanguageSelector } from "~/components/common/LanguageSelector";
import { useAuth } from "~/context/auth";
import { useCommonTranslations } from "~/hooks";

import styles from "./Sidebar.module.scss";
import { getSidebarItems } from "./Sidebar.utils";

type SidebarItem = {
  text: string;
  icon: string;
  url?: string;
  children?: SidebarItem[];
};

type Props = {
  onSetIsSidebarOpen: (value: boolean) => void;
  isSidebarOpen: boolean;
};

export const Sidebar = ({ onSetIsSidebarOpen, isSidebarOpen }: Props) => {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const { t: commonTranslations } = useCommonTranslations();
  const pathname = usePathname();
  const { logout } = useAuth();

  const sidebarItems = useMemo(() => getSidebarItems(commonTranslations), [commonTranslations]);
  const mobileView = useMediaQuery({
    query: "(max-width: 800px)",
  });

  const toggleSidebar = () => onSetIsSidebarOpen(!isSidebarOpen);

  const handleItemClick = (index: number, item: SidebarItem) => {
    if (item.children) setExpandedItem((prevIndex) => (prevIndex === index ? null : index));
    if (mobileView) toggleSidebar();
  };

  useEffect(() => {
    if (mobileView) {
      onSetIsSidebarOpen(false);
    }
  }, [mobileView, onSetIsSidebarOpen]);

  useEffect(() => {
    const currentPath = pathname;
    const foundIndex = sidebarItems.findIndex((item) =>
      item.children?.some((child) => currentPath.includes(child.url)),
    );
    setExpandedItem(foundIndex !== -1 ? foundIndex : null);
  }, [pathname, sidebarItems]);

  return (
    <div
      className={classNames(
        styles["sidebar-container"],
        isSidebarOpen ? styles.open : styles.closed,
      )}
    >
      <div className={styles["sidebar-logo"]}>
        <img
          src={isSidebarOpen ? "/images/logo-full-dark.svg" : "/images/logo-dark.svg"}
          alt="LexTego"
          width="100%"
        />
      </div>

      <div className={classNames(styles["sidebar-toggle"])} onClick={toggleSidebar}>
        {!mobileView && <Icon name={isSidebarOpen ? "rewind-left" : "rewind-right"} size="small" />}
        {mobileView && <span>X</span>}
      </div>

      {isSidebarOpen && (
        <>
          {sidebarItems.map((item, index) => (
            <div key={index.toString()} className={styles.parent}>
              {item.children ? (
                <>
                  <div
                    className={classNames(
                      styles["sidebar-item"],
                      item.url === pathname && styles.selected,
                    )}
                    onClick={() => handleItemClick(index, item)}
                  >
                    <span
                      className={classNames(
                        styles["sidebar-text"],
                        "flex items-center justify-center text-sm",
                      )}
                    >
                      <Icon name={item.icon} className="mr-2" width="23px" height="23px" />
                      {item.text}
                    </span>
                  </div>
                  {expandedItem === index && (
                    <div className={styles["sidebar-subitems"]}>
                      {item.children.map((child, i) => (
                        <Link key={i.toString()} href={child.url}>
                          <div
                            className={classNames(
                              styles["sidebar-item"],
                              styles.child,
                              child.url === pathname && styles.selected,
                            )}
                            onClick={() => handleItemClick(index, item)}
                          >
                            <span
                              className={classNames(
                                styles["sidebar-text"],
                                "flex items-center justify-center text-sm",
                              )}
                            >
                              <Icon
                                name="filled-bullet"
                                className="mr-2"
                                width="18px"
                                height="18px"
                              />
                              {child.text}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={item.url || ("/" as string)}>
                  <div
                    className={classNames(
                      styles["sidebar-item"],
                      item.url === pathname && styles.selected,
                    )}
                  >
                    <span
                      className={classNames(
                        styles["sidebar-text"],
                        "flex items-center justify-center text-sm",
                      )}
                    >
                      <Icon name={item.icon} className="mr-2" width="23px" height="23px" />
                      {item.text}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          ))}
          <div className={styles["sidebar-item"]}>
            <span className={classNames(styles["sidebar-logout"], "flex text-sm")} onClick={logout}>
              <Icon name="logout" className="mr-2" size="medium" />
              {commonTranslations("logout")}
            </span>
          </div>
        </>
      )}
      {!isSidebarOpen && (
        <>
          {sidebarItems.map((item, index) => (
            <div
              key={index.toString()}
              className={classNames(
                styles["sidebar-item"],
                item.url === pathname && styles.selected,
              )}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link href={item.url || ("/" as string)}>
                <span className={classNames(styles["sidebar-text"], "flex")}>
                  <Icon name={item.icon} className="" size="medium" />
                </span>
              </Link>
              {hoveredItem === index && item.children && (
                <div className={styles["sidebar-children-popup"]}>
                  {item.children.map((child, i) => (
                    <div
                      key={i.toString()}
                      className={classNames(
                        styles["sidebar-item"],
                        "w-full",
                        child.url === pathname && styles.selected,
                      )}
                      onClick={() => handleItemClick(index, child)}
                    >
                      <Link href={child.url}>
                        <span
                          className={classNames(
                            styles["sidebar-text"],
                            "flex items-center justify-center text-sm",
                          )}
                        >
                          <Icon name="filled-bullet" className="mr-2" width="18px" height="18px" />
                          {child.text}
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div
            className={classNames(
              styles["sidebar-item"],
              isSidebarOpen ? styles.open : styles.closed,
            )}
          >
            <span className={classNames(styles["sidebar-logout"], "flex")} onClick={logout}>
              <Icon name="logout" className="" size="medium" />
            </span>
          </div>
        </>
      )}

      <div className={styles["language-selector-container"]}>
        <LanguageSelector
          popupPosition={{ bottom: "10", left: "0" }}
          isLabelShown={isSidebarOpen}
        />
      </div>
    </div>
  );
};
