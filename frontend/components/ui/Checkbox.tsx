/**
 * Checkbox Component - T095
 * Task completion checkbox with 44x44px touch target
 * Follows Phase II design system specifications
 */

'use client';

import { ButtonHTMLAttributes } from 'react';

export interface CheckboxProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  checked: boolean;
  onToggle: () => void;
  label?: string;
}

export default function Checkbox({
  checked,
  onToggle,
  label,
  className = '',
  ...props
}: CheckboxProps) {
  // T099: Handle Space key for keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <button
      type="button"
      className={`flex-shrink-0 min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors ${className}`}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      aria-label={label || (checked ? 'Mark as incomplete' : 'Mark as complete')}
      aria-checked={checked}
      role="checkbox"
      {...props}
    >
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          checked
            ? 'bg-success border-success'
            : 'border-gray-400 hover:border-primary'
        }`}
      >
        {checked && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </button>
  );
}
