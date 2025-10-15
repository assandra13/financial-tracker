import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const ModernSelect = ({ value, onChange, options, placeholder = "Select...", disabled = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue) => {
    // Create a synthetic event object to match the expected format
    const syntheticEvent = {
      target: {
        value: optionValue,
        name: "modern-select",
      },
    };
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 text-left bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${isOpen ? "border-blue-500 ring-2 ring-blue-200" : ""}`}
      >
        <div className="flex items-center justify-between">
          <span className={`${selectedOption ? "text-gray-900" : "text-gray-500"}`}>{selectedOption ? selectedOption.label : placeholder}</span>
          {!disabled && <div className="text-gray-400 transition-transform duration-300">{isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>}
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-fade-in custom-scrollbar">
          <div className="py-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-3 text-left transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 ${value === option.value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}
              >
                {option.label}
              </button>
            ))}
            {options.length === 0 && <div className="px-4 py-3 text-gray-500 text-center">No options available</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernSelect;
