/**
 * LoadingIndicator Component - TASK-060
 * Animated typing indicator for AI responses
 * User Story 1: Shows "AI is thinking..." while waiting
 */
'use client';

import React from 'react';

export interface LoadingIndicatorProps {
  text?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  text = 'AI is thinking...',
}) => {
  return (
    <div
      className="flex items-start mb-4"
      data-testid="loading-indicator"
    >
      <div className="bg-gray-800 text-white px-4 py-3 rounded-2xl rounded-bl-md border border-yellow-500/20 max-w-[80%]">
        <div className="flex items-center gap-2">
          {/* Animated dots */}
          <div className="flex gap-1">
            <span
              className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
          <span className="text-sm text-gray-400">{text}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
