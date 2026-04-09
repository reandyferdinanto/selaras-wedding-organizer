"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  touched?: boolean;
};

export function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  error,
  touched,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="select-field" ref={wrapperRef}>
      {label ? (
        <label className="neo-label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <button
        id={id}
        ref={triggerRef}
        type="button"
        className={["select-trigger", open ? "is-open" : ""].filter(Boolean).join(" ")}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
      >
        <span className="select-trigger-text">{selected?.label ?? "Pilih"}</span>
        <span className={["select-trigger-icon", open ? "is-open" : ""].filter(Boolean).join(" ")}>
          <ChevronDown size={16} />
        </span>
      </button>

      {open ? (
        <div id={listboxId} className="select-popover" role="listbox" aria-labelledby={id}>
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                className={["select-option", isSelected ? "is-selected" : ""].filter(Boolean).join(" ")}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                <span className="select-option-label">{option.label}</span>
                <span className={["select-option-check", isSelected ? "is-visible" : ""].filter(Boolean).join(" ")}>
                  <Check size={15} />
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {touched && error ? <p className="neo-field-error">{error}</p> : null}
    </div>
  );
}
