-- Migration: Create messages table
-- Phase III AI-Powered Todo Chatbot
-- Stores individual chat messages within conversations

CREATE TYPE message_role AS ENUM ('user', 'assistant');

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    user_id UUID NOT NULL,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_message_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_message_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Composite index for loading conversation history efficiently
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- Index for user message lookups
CREATE INDEX idx_messages_user ON messages(user_id);

-- Comment for documentation
COMMENT ON TABLE messages IS 'Individual chat messages for Phase III AI chatbot';
COMMENT ON COLUMN messages.role IS 'Message sender: user or assistant';
COMMENT ON COLUMN messages.content IS 'Message text content';
COMMENT ON COLUMN messages.tool_calls IS 'JSON array of MCP tool invocations (for assistant messages)';
