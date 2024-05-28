import type { ChangeEvent } from "react";
import { forwardRef } from "react";

interface RadioOption {
  label: string;
  value: string | number;
}

interface RadioButtonProps {
  name?: string;
  options: RadioOption[];
  error?: string;
  className?: string;
  label?: string;
  value?: string | number;
  onChange?: (value: string) => void;
}

const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ options, error, className = "", label, value, onChange, ...props }, ref) => {
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      if (onChange) {
        onChange(newValue);
      }
    };
    return (
      <div className={className}>
        {label && <p className="mb-1 ml-2 text-gray-light">{label}</p>}
        <div className="flex gap-5">
          {options.map((option) => (
            <label key={option.label} className="block cursor-pointer">
              <input
                type="radio"
                value={option.value}
                ref={ref}
                className={`mx-2 cursor-pointer ${error ? "border-red-light" : ""}`}
                checked={value === option.value}
                onChange={handleInputChange}
                {...props}
              />
              {option.label}
            </label>
          ))}
        </div>
        {error && <p className="text-red-light text-sm mt-2">{error}</p>}
      </div>
    );
  },
);

RadioButton.displayName = "RadioButton";

export { RadioButton };
