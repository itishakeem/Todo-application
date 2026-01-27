/**
 * ConversationList Component - TASK-058
 * Lists user's conversations in sidebar
 * FR-004: Conversation history management
 */
'use client';

import React from 'react';

export interface ConversationSummary {
  id: number;
  created_at?: string | null;
  updated_at?: string | null;
  message_count: number;
  last_message_preview: string;
}

export interface ConversationListProps {
  conversations: ConversationSummary[];
  activeConversationId?: number | null;
  onSelect: (conversationId: number) => void;
  onNewConversation: () => void;
  onDelete?: (conversationId: number) => void;
  isLoading?: boolean;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelect,
  onNewConversation,
  onDelete,
  isLoading = false,
}) => {
  const handleDelete = (e: React.MouseEvent, conversationId: number) => {
    e.stopPropagation(); // Prevent selecting the conversation
    if (onDelete && window.confirm('Delete this conversation? This cannot be undone.')) {
      onDelete(conversationId);
    }
  };
  return (
    <div
      className="flex flex-col h-full bg-gray-900/50 border-r border-yellow-500/20"
      data-testid="conversation-list"
    >
      {/* Header with New Conversation button */}
      <div className="p-4 border-b border-yellow-500/20">
        <button
          onClick={onNewConversation}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-yellow-500 text-black font-semibold
            hover:bg-yellow-400
            transition-colors duration-200
            flex items-center justify-center gap-2
          `}
          data-testid="new-conversation-button"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Chat
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
              <span
                className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-gray-500">No conversations yet</p>
          </div>
        ) : (
          <div className="py-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`
                  relative group
                  border-l-2
                  ${activeConversationId === conv.id
                    ? 'bg-yellow-500/10 border-yellow-500'
                    : 'border-transparent hover:bg-yellow-500/10'
                  }
                `}
              >
                <button
                  onClick={() => onSelect(conv.id)}
                  className="w-full px-4 py-3 text-left transition-colors duration-200"
                  data-testid={`conversation-item-${conv.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-white truncate flex-1 pr-6">
                      {conv.last_message_preview || 'New conversation'}
                    </p>
                    {conv.updated_at && (
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(conv.updated_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {conv.message_count} message{conv.message_count !== 1 ? 's' : ''}
                  </p>
                </button>
                {/* Delete button - larger touch target for better UX */}
                {onDelete && (
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg
                      opacity-0 group-hover:opacity-100 transition-all duration-200
                      text-gray-400 hover:text-red-400 hover:bg-red-500/20
                      focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    title="Delete conversation"
                    aria-label="Delete conversation"
                    data-testid={`delete-conversation-${conv.id}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
