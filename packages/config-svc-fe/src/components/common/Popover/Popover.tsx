import classNames from "classnames";
import React, { useCallback, useEffect, useRef } from "react";

import styles from "./Popover.module.scss";

interface PopoverProps {
  children: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const Popover = ({ children, isVisible, onClose, className }: PopoverProps) => {
  const popoverContentRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (popoverContentRef.current && !popoverContentRef.current.contains(event.target as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div className={styles.popover}>
      {isVisible && (
        <div className={classNames(styles["popover-content"], className)} ref={popoverContentRef}>
          {children}
        </div>
      )}
    </div>
  );
};

export { Popover };
