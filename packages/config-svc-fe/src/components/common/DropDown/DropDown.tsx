import classNames from "classnames";
import React, { cloneElement, useCallback, useEffect, useRef, useState } from "react";

import type { Option } from "~/services/Interfaces";

import styles from "./DropDown.module.scss";

interface DropdownProps {
  trigger: React.ReactElement;
  options: Array<Option & { disabled: boolean }>;
  onSelect: (id: string) => void;
  isVisible?: boolean;
  onTriggerClick?: () => void;
  className?: string;
}

const Dropdown = ({
  trigger,
  options,
  onSelect,
  isVisible,
  onTriggerClick,
  className,
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (onTriggerClick) {
          onTriggerClick();
        } else {
          setOpen(false);
        }
      }
    },
    [onTriggerClick, setOpen, dropdownRef],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      {cloneElement(trigger, {
        onClick: () => (onTriggerClick ? onTriggerClick() : setOpen(!open)),
      })}
      {isVisible !== undefined
        ? isVisible
        : open && (
            <div className={classNames(styles["dropdown-menu"], className)}>
              {options.map((option) => (
                <div
                  key={option.id}
                  className={classNames(
                    styles["dropdown-item"],
                    "hover:bg-gray-200",
                    option.disabled ? "text-gray-300" : "cursor-pointer",
                  )}
                  onClick={() => {
                    onSelect(option.id);
                    if (onTriggerClick) {
                      onTriggerClick();
                    } else {
                      setOpen(false);
                    }
                  }}
                >
                  {option.name}
                </div>
              ))}
            </div>
          )}
    </div>
  );
};

export { Dropdown };
