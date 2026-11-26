"use client";

import type { InputHTMLAttributes } from "react";
import { sanitizePhoneInput } from "@/lib/phone";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "inputMode" | "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
};

/** Phone field: digits and optional leading + only. */
export function PhoneInput({ value, onChange, className = "input", ...rest }: Props) {
  return (
    <input
      {...rest}
      className={className}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      pattern="[0-9+]*"
      value={value}
      onChange={(e) => onChange(sanitizePhoneInput(e.target.value))}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text");
        onChange(sanitizePhoneInput(text));
      }}
      onKeyDown={(e) => {
        // Allow control/navigation keys; block letters and other symbols
        if (
          e.ctrlKey ||
          e.metaKey ||
          e.altKey ||
          e.key.length !== 1
        ) {
          return;
        }
        if (!/[0-9+]/.test(e.key)) {
          e.preventDefault();
        }
        if (e.key === "+" && (value.includes("+") || (e.currentTarget.selectionStart ?? 0) > 0)) {
          e.preventDefault();
        }
      }}
    />
  );
}
