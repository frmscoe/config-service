import { toString } from "lodash";
import { forwardRef } from "react";

interface RadioOption {
  label: string;
  value: string | number | boolean;
}

interface RadioButtonProps {
  name?: string;
  options: RadioOption[];
  error?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
}

const RFHRadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ options, error, className = "", label, ...props }, ref) => (
    <div className={className}>
      {label && <p className="mb-1 ml-2 text-gray-light">{label}</p>}
      <div className="flex gap-5">
        {options.map((option) => (
          <label key={option.label} className="block cursor-pointer">
            <input
              type="radio"
              // name={name}
              value={toString(option.value)}
              ref={ref}
              className={`mx-2 cursor-pointer ${error ? "border-red-light" : ""}`}
              {...props}
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && <p className="text-red-light text-sm mt-2">{error}</p>}
    </div>
  ),
);

RFHRadioButton.displayName = "RFHRadioButton";

export { RFHRadioButton };
