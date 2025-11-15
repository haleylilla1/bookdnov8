import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'inputMode' | 'onChange' | 'onBlur'> {
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value?: string;
}

/**
 * MOBILE-SAFE CURRENCY INPUT
 * Fixes iOS Safari bug where type="number" changes values when scrolling (e.g., 800 → 797)
 * Uses type="text" with inputMode="decimal" to get numeric keyboard without the bug
 * Auto-formats to 2 decimals on blur for consistent display
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ onChange, onBlur, value, ...props }, ref) => {
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Format to 2 decimals when user leaves the field
      const numValue = parseFloat(e.target.value);
      if (!isNaN(numValue)) {
        const formatted = numValue.toFixed(2);
        onChange?.(formatted);
      }
      onBlur?.(e);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          // Only allow numbers and decimal point
          const cleanValue = e.target.value.replace(/[^0-9.]/g, '');
          
          // Prevent multiple decimal points
          const parts = cleanValue.split('.');
          const finalValue = parts.length > 2 
            ? parts[0] + '.' + parts.slice(1).join('')
            : cleanValue;
          
          onChange?.(finalValue);
        }}
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
