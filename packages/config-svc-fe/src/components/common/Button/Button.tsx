import classNames from "classnames";
import type { MouseEventHandler, ReactElement } from "react";
import React, { useMemo } from "react";

import { Icon } from "../Icon";
import styles from "./Button.module.scss";

type ButtonVariant = "standard" | "outline";
type ButtonColor =
  | "default"
  | "primary"
  | "info"
  | "green"
  | "red"
  | "white"
  | "default"
  | "lightblue"
  | string;
type IconPosition = "left" | "right";

interface IButtonProps {
  children: React.ReactNode;
  className?: string;
  color?: ButtonColor;
  disabled?: boolean;
  href?: string;
  icon?: ReactElement;
  iconClass?: string;
  iconPosition?: IconPosition;
  link?: string;
  loading?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  responsive?: boolean;
  rounded?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
}

function Button({
  children,
  className = "",
  variant = "standard",
  color = "primary",
  rounded = false,
  iconPosition = "left",
  iconClass = "",
  icon,
  loading = false,
  href,
  ...props
}: IButtonProps) {
  const buttonTheme = useMemo(() => {
    const classes: string[] = [];
    if (variant === "outline") {
      classes.push("border border-black-light hover:bg-black hover:text-white transition-all");
    }
    switch (color) {
      case "primary":
        if (variant === "standard") {
          classes.push(
            "bg-gray-900 border hover:bg-white text-white hover:text-black border-gray-dark",
          );
        } else {
          classes.push("text-black border-gray-dark hover:bg-gray-dark hover:text-white");
        }
        break;
      case "info":
        if (variant === "standard") {
          classes.push("bg-info text-white");
        } else {
          classes.push("text-info border-info hover:bg-info hover:text-white");
        }
        break;
      case "lightblue":
        if (variant === "standard") {
          classes.push("bg-blue-300 hover:bg-blue-400 text-white");
        } else {
          classes.push("text-blue-500 border border-blue-500 hover:bg-blue-300 hover:text-white");
        }
        break;
      case "white":
        if (variant === "standard") {
          classes.push("bg-white text-primary");
        } else {
          classes.push("text-white border-white hover:bg-white hover:text-primary");
        }
        break;
      case "green":
        if (variant === "standard") {
          classes.push("bg-green-600 text-white hover:bg-green-500");
        } else {
          classes.push("text-green-dark border-green-dark hover:bg-green-dark hover:text-white");
        }
        break;
      case "red":
        if (variant === "standard") {
          classes.push("bg-red-600 text-white hover:bg-red-800");
        } else {
          classes.push("text-red border-red hover:bg-red hover:text-white");
        }
        break;
      default:
        if (variant === "standard") {
          classes.push(
            "bg-gray-200 border hover:bg-white text-black hover:text-black border-gray-200",
          );
        } else {
          classes.push("text-black border-gray-dark hover:bg-gray-dark hover:text-white");
        }
        break;
    }

    return classes;
  }, [variant, color]);

  const button = (
    <button
      className={classNames(
        styles["button-main"],
        loading && "bg-gray-light !cursor-not-allowed pointer-events-none",
        rounded && "!rounded-full",
        buttonTheme,
        className,
      )}
      {...props}
    >
      {loading && (
        <div className="absolute -translate-x-1/2 left-1/2">
          <Icon className="animate-spin" name="spinner" />
        </div>
      )}
      {iconPosition === "left" && !!icon && (
        <div className={classNames("flex-shrink-0 flex items-center", iconClass || "mr-2")}>
          {icon}
        </div>
      )}
      {children}
      {iconPosition === "right" && !!icon && (
        <div className={classNames("flex-shrink-0 flex items-center", iconClass || "ml-2")}>
          {icon}
        </div>
      )}
    </button>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {button}
      </a>
    );
  }

  return button;
}

export { Button };
export type { IButtonProps };
