/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";

interface Option {
  value: string;
  label: string;
}

interface AutoCompleteInputProps {
  control: any;
  name: string;
  options: any[];
  label?: string;
  error?: string;
  optionKey?: Option;
}

const AutoCompleteMultipleInput = ({
  control,
  name,
  options,
  label,
  error,
  optionKey,
}: AutoCompleteInputProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<any[]>(options);
  const [showOptions, setShowOptions] = useState<boolean>(false);

  const handleOptionClick = (option: Option, onChange: (value: any) => void) => {
    const updatedOptions = [...selectedOptions, option];

    setSelectedOptions(updatedOptions);
    onChange(updatedOptions);

    setInputValue("");
    setShowOptions(false);
  };

  const handleRemoveSelected = (optionValue: string, onChange: (value: any) => void) => {
    const updatedExits = selectedOptions.filter(
      (option) => (optionKey ? option[optionKey.value] : option.value) !== optionValue,
    );
    setSelectedOptions(updatedExits);
    onChange(updatedExits);
  };

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        if (field.value && field.value.length > 0 && selectedOptions.length === 0) {
          setSelectedOptions(field.value);
        }
        return (
          <div className="relative">
            {label && <p className="mb-1 ml-2 text-gray-light">{label}</p>}
            {/* Input */}
            <div className="relative">
              <input
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setFilteredOptions(
                    options.filter((option) => {
                      const optionLabel = optionKey ? option[optionKey.label] : option.label;
                      const value = optionKey ? option[optionKey.value] : option.value;
                      return (
                        optionLabel.toLowerCase().includes(e.target.value) &&
                        !selectedOptions.some(
                          (selected) =>
                            (optionKey ? selected[optionKey.value] : selected.value) === value,
                        )
                      );
                    }),
                  );
                  field.onChange(e);
                }}
                onFocus={() => {
                  setShowOptions(true);
                  setFilteredOptions(
                    options.filter((option) => {
                      const value = optionKey ? option[optionKey.value] : option.value;
                      return !selectedOptions.some(
                        (selected) =>
                          (optionKey ? selected[optionKey.value] : selected.value) === value,
                      );
                    }),
                  );
                }}
                onBlur={() => {
                  field.onBlur();
                  setTimeout(() => setShowOptions(false), 100);
                }}
                name={field.value}
                ref={field.ref}
                className={`border-black border border-solid w-full rounded-xl outline-0 p-2 ${
                  error ? "border-red-light" : ""
                }`}
              />

              {/* Options List (Popover) */}
              {showOptions && (
                <div className="absolute top-full left-0 w-full z-10 border border-t-0 rounded-b bg-white">
                  {filteredOptions.map((option) => (
                    <div
                      key={option.label}
                      onClick={() => handleOptionClick(option, field.onChange)}
                      className="cursor-pointer hover:bg-gray-100 p-2"
                    >
                      {optionKey ? option[optionKey.label] : option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Selected Options */}
            <div className="mt-2 px-2">
              {selectedOptions.map((option) => (
                <div key={option.label} className="mr-2 mb-2 flex items-center justify-between">
                  <span>{optionKey ? option[optionKey.label] : option.label}</span>
                  {/* Remove Icon */}
                  <span
                    onClick={() =>
                      handleRemoveSelected(
                        optionKey ? option[optionKey.value] : option.value,
                        field.onChange,
                      )
                    }
                    className="ml-2 cursor-pointer text-red-500"
                  >
                    X {/* Replace with an SVG or font icon if preferred */}
                  </span>
                </div>
              ))}
            </div>
            {error && <p className="text-red-light text-sm ml-2 mt-2">{error}</p>}
          </div>
        );
      }}
    />
  );
};

export { AutoCompleteMultipleInput };
