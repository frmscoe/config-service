import type { ChangeEvent } from "react";
import { forwardRef } from "react";

interface InputProps {
  name?: string;
  className?: string;
  label: string;
  id?: string;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: "text" | "number" | "password";
  disabled?: boolean;
}

const generateId = (label: string) =>
  `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).substr(2, 9)}`;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className = "", error, ...props }, ref) => {
    // Generate a unique ID based on the label if no ID is provided
    const inputId = id || generateId(label);

    return (
      <div className={`${className}`}>
        {label && (
          <label htmlFor={inputId} className="block mb-1 ml-2 text-gray-light">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          <input
            ref={ref}
            id={inputId}
            className={`border-black border border-solid w-full rounded-md outline-0 p-2 ${
              error ? "border-red-light" : ""
            }`}
            {...props}
          />
        </div>
        {error && <p className="text-red-light text-sm ml-2">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
