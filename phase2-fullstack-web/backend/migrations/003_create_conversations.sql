-- Migration: Create conversations table
-- Phase III AI-Powered Todo Chatbot
-- Stores chat conversation sessions for users

CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_conversation_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Index for fast user conversation lookups
CREATE INDEX idx_conversations_user ON conversations(user_id);

-- Index for ordering by most recent activity
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);

-- Comment for documentation
COMMENT ON TABLE conversations IS 'Chat conversation sessions for Phase III AI chatbot';
COMMENT ON COLUMN conversations.user_id IS 'Owner of the conversation';
COMMENT ON COLUMN conversations.updated_at IS 'Last activity timestamp, updated on new message';
