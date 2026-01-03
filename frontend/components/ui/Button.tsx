/**
 * Button Component - T026
 * Base UI component with primary/secondary/danger variants
 * Follows Phase II design system specifications
 */
'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-xl hover:shadow-2xl hover:scale-110 focus:ring-4 focus:ring-white/50 border-2 border-white/30',
  secondary:
    'bg-white/30 backdrop-blur-md text-white border-2 border-white/50 hover:bg-white/40 hover:shadow-xl hover:scale-110 focus:ring-4 focus:ring-white/50',
  danger:
    'bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white shadow-xl hover:shadow-2xl hover:scale-110 focus:ring-4 focus:ring-white/50 border-2 border-white/30',
};

export default function Button({
  variant = 'primary',
  children,
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = `
    min-h-[44px] min-w-[44px]
    px-16
    rounded-lg
    font-semibold text-base
    cursor-pointer
    transition-all duration-300 ease-out
    focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `;

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-8">
          <svg
            className="animate-spin h-16 w-16"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
