/**
 * ErrorMessage Component - TASK-061
 * Displays error with retry button
 * FR-012, User Story 8: User-friendly error handling
 */
'use client';

import React from 'react';
import Button from '../ui/Button';

export interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
}) => {
  return (
    <div
      className="flex items-start mb-4"
      data-testid="error-message"
    >
      <div className="bg-red-900/30 text-white px-4 py-3 rounded-2xl rounded-bl-md border border-red-500/40 max-w-[80%]">
        <div className="flex items-center gap-2 mb-2">
          {/* Warning icon */}
          <svg
            className="w-5 h-5 text-red-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-sm text-red-300">{message}</span>
        </div>
        {onRetry && (
          <Button
            variant="secondary"
            onClick={onRetry}
            className="text-xs px-3 py-1 min-h-[32px]"
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
