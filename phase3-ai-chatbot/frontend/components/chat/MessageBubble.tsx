/**
 * MessageBubble Component - TASK-059
 * Renders a single message bubble with role-based styling
 * FR-002: Clear visual distinction between user and assistant
 */
'use client';

import React from 'react';

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string | null;
  tool_calls?: Array<{
    tool: string;
    input: Record<string, unknown>;
    output: unknown;
  }> | null;
}

export interface MessageBubbleProps {
  message: Message;
  showTimestamp?: boolean;
}

function formatTimestamp(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showTimestamp = true,
}) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-4`}
      data-testid={`message-bubble-${message.id}`}
    >
      {/* Message bubble */}
      <div
        className={`
          max-w-[80%] px-4 py-3 rounded-2xl
          ${isUser
            ? 'bg-yellow-500 text-black rounded-br-md'
            : 'bg-gray-800 text-white rounded-bl-md border border-yellow-500/20'
          }
        `}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

        {/* Tool calls indicator for assistant messages */}
        {!isUser && message.tool_calls && Array.isArray(message.tool_calls) && message.tool_calls.length > 0 && (
          <div className="mt-2 pt-2 border-t border-yellow-500/20">
            <p className="text-xs text-yellow-400">
              Actions performed: {message.tool_calls.map(tc => tc?.tool).filter(Boolean).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Timestamp */}
      {showTimestamp && message.created_at && (
        <span
          className={`text-xs text-gray-500 mt-1 ${isUser ? 'mr-1' : 'ml-1'}`}
        >
          {formatTimestamp(message.created_at)}
        </span>
      )}
    </div>
  );
};

export default MessageBubble;
