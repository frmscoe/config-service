import classNames from "classnames";
import React, { forwardRef } from "react";

import styles from "./Slider.module.scss";

interface SliderComponentProps {
  min: number | string;
  max: number | string;
  orientation: "horizontal" | "vertical";
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: number;
  disabled?: boolean;
  className?: string;
}

const Slider = forwardRef<HTMLInputElement, SliderComponentProps>(
  ({ value, min, max, orientation, onChange, className, ...props }, ref) => (
    <div className={classNames(styles["slider-container"], orientation)}>
      <div className={styles["slider-wrapper"]}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          className={classNames(styles["slider-input"], className)}
          {...props}
        />
      </div>
      {/* Conditional rendering based on `value` could be re-enabled if needed */}
      {/* value !== undefined && <div className={styles["slider-value"]}>{value}</div> */}
    </div>
  ),
);

Slider.displayName = "Slider";

export { Slider };
