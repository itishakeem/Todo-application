/**
 * MessageList Component - TASK-056
 * Displays array of messages with auto-scroll
 * FR-002: Message display with role distinction
 */
'use client';

import React, { useEffect, useRef } from 'react';
import MessageBubble, { Message } from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import ErrorMessage from './ErrorMessage';

export interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-2"
      data-testid="message-list"
    >
      {/* Empty state */}
      {messages.length === 0 && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <div className="text-4xl mb-4 opacity-80">💬</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Start a conversation
          </h3>
          <p className="text-sm text-gray-400 max-w-sm">
            Ask me to help manage your tasks. Try saying &quot;Add a task to buy groceries&quot; or &quot;Show me my tasks&quot;.
          </p>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Loading indicator */}
      {isLoading && <LoadingIndicator />}

      {/* Error message */}
      {error && <ErrorMessage message={error} onRetry={onRetry} />}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
