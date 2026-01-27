/**
 * Textarea Component - T028
 * Multi-line text input with validation states
 * Follows Phase II design system specifications
 */
'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const hasError = !!error;

    const baseStyles = `
      min-h-[88px] w-full
      px-12 py-12
      text-base text-white placeholder-gray-500
      border-2 rounded-xl
      shadow-lg
      backdrop-blur-sm
      transition-all duration-300 ease-out
      resize-y
      focus:outline-none focus:shadow-xl focus:scale-[1.02]
      hover:shadow-xl
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800/50
    `;

    const stateStyles = hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-300 bg-black/60'
      : 'border-yellow-500/30 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-400/30 bg-black/60 hover:bg-black/70';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-white drop-shadow-md mb-4">
            {label}
          </label>
        )}
        <textarea
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

Textarea.displayName = 'Textarea';

export default Textarea;
