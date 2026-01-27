/**
 * MessageInput Component - TASK-057
 * Text input field with send button
 * FR-001: Send message functionality
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex items-end gap-2 p-4 border-t border-yellow-500/20 bg-black/80"
      data-testid="message-input"
    >
      {/* Text area */}
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        maxLength={2000}
        className={`
          flex-1 resize-none
          px-4 py-4 rounded-xl
          bg-gray-900 text-white
          border border-yellow-500/30
          placeholder-gray-500
          focus:outline-none focus:border-yellow-500/60
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          min-h-[56px]
          max-h-[200px]
        `}
        data-testid="message-input-field"
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className={`
          min-w-[56px] min-h-[56px]
          p-3 rounded-xl
          bg-yellow-500 text-black
          hover:bg-yellow-400
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-500
          transition-colors duration-200
          flex items-center justify-center
        `}
        aria-label="Send message"
        data-testid="send-button"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </div>
  );
};

export default MessageInput;
