import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, style, onKeyDown, ...props }, ref) => {
    // Handle iOS keyboard "Done" button - dismiss keyboard on Enter/Return
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        // Blur (dismiss keyboard) when Enter/Return is pressed
        e.currentTarget.blur();
      }
      // Call any additional onKeyDown handler passed as prop
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    return (
      <input
        type={type}
        className="w-full h-12 px-4 py-3 text-base border-2 border-gray-300 rounded-md bg-white text-black placeholder-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
        style={{
          fontSize: '16px',
          border: '2px solid #d1d5db',
          borderRadius: '6px',
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          color: '#000000',
          outline: 'none',
          boxSizing: 'border-box',
          ...style
        }}
        enterKeyHint="done"
        onKeyDown={handleKeyDown}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
