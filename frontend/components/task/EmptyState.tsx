/**
 * EmptyState Component
 * T042: Display centered empty state when no tasks exist
 * Spec: FR-020 - Empty state handling
 */

import React from 'react';

interface EmptyStateProps {
  message?: string;
  showIcon?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No tasks yet. Add one to get started!',
  showIcon = true,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[300px] py-12"
      data-testid="empty-state"
    >
      {showIcon && (
        <svg
          className="w-16 h-16 mb-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      )}
      <p className="text-lg text-gray-300 text-center font-medium">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;
