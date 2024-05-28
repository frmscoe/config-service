/* eslint-disable @typescript-eslint/no-explicit-any */
import classNames from "classnames";
import type { ReactElement } from "react";
import React, { useMemo, useRef } from "react";

import { Icon } from "~/components/common/Icon";
import { usePopup } from "~/hooks";

type Option = {
  label: string;
  value: string | number;
  icon?: ReactElement;
};

export interface PopupPosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  placeholder?: string;
  value?: any;
  onChange?: (val: any) => void;
  className?: string;
  showValue?: boolean;
  popupPosition?: PopupPosition;
  isLabelShown?: boolean;
  disabled?: boolean;
}

const Select = ({
  label,
  options = [],
  placeholder = "Select Option",
  value,
  onChange,
  className,
  showValue = true,
  popupPosition = { bottom: "10", left: "0" },
  isLabelShown,
  disabled,
}: SelectProps) => {
  const ref = useRef(null);
  const { isOpen, toggleMenu, closeMenu } = usePopup(ref);

  const selectedOption = useMemo(
    () => options.find((item) => item.value === value),
    [options, value],
  );

  const handleClick = (option: Option) => {
    onChange?.(option.value);
    closeMenu();
  };

  return (
    <div className={className}>
      {label && <p className="mb-1 text-gray">{label}</p>}

      <div className="relative w-full" ref={ref}>
        <div
          className={classNames("flex w-full rounded", {
            "cursor-pointer": !disabled,
            "w-full rounded outline-0 p-2": showValue,
            "pr-6": !showValue,
          })}
          onClick={() => !disabled && toggleMenu()}
        >
          {isLabelShown && (
            <span className="mr-2">
              {selectedOption && showValue ? selectedOption.label : placeholder}
            </span>
          )}
          <span className="mr-6">{selectedOption && showValue ? selectedOption.icon : ""}</span>

          <Icon
            name="arrow-down"
            className={classNames(
              "absolute transform top-1/2 -translate-y-2/4 right-2",
              isOpen ? "transform rotate-180" : "",
            )}
          />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: popupPosition.bottom ? `${popupPosition.bottom}px` : undefined,
            top: popupPosition.top ? `${popupPosition.top}px` : undefined,
            left: popupPosition.left ? `${popupPosition.left}px` : undefined,
            right: popupPosition.right ? `${popupPosition.right}px` : undefined,
          }}
          className={classNames(
            "bg-white min-w-full z-10 shadow-lg text-left rounded-lg transition-all duration-150 ease-in",
            {
              "max-h-80 overflow-auto": isOpen,
              "opacity-0 max-h-0 overflow-hidden py-0": !isOpen,
            },
          )}
        >
          {options.map((option) => (
            <div
              data-testid="select-option"
              key={option.label}
              className="flex justify-between gap-x-2 py-3 px-4 text-gray hover:text-gray-dark border-b-2 last:border-0 border-gray-200 cursor-pointer whitespace-nowrap"
              onClick={() => handleClick(option)}
            >
              {option.label} {option.icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { Select };
