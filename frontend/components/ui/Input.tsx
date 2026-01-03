/**
 * Input Component - T027
 * Text input with validation states
 * Follows Phase II design system specifications
 */
'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const hasError = !!error;

    const baseStyles = `
      h-[44px] w-full
      px-12 py-12
      text-base text-gray-900
      border-2 rounded-xl
      shadow-lg
      backdrop-blur-sm
      transition-all duration-300 ease-out
      focus:outline-none focus:shadow-xl focus:scale-[1.02]
      hover:shadow-xl
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300/50
    `;

    const stateStyles = hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-300 bg-red-100/80'
      : 'border-white/60 focus:border-white focus:ring-4 focus:ring-white/30 bg-white/80 hover:bg-white/90';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-white drop-shadow-md mb-4">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`${baseStyles} ${stateStyles} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-4 text-sm text-error" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="mt-4 text-sm text-gray-text">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
