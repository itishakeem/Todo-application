"""
Message model for Phase III AI chatbot.
SQLModel for PostgreSQL integration.
"""
from sqlmodel import Field, SQLModel, Column
from sqlalchemy import JSON
from datetime import datetime
from typing import Optional, Any
from uuid import UUID
from enum import Enum


class MessageRole(str, Enum):
    """Enum for message sender role."""
    USER = "user"
    ASSISTANT = "assistant"


class Message(SQLModel, table=True):
    """
    Message entity representing a single chat message.
    Belongs to a conversation and has a role (user or assistant).
    """

    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    role: MessageRole = Field(...)
    content: str = Field(...)
    tool_calls: Optional[dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "conversation_id": 1,
                "user_id": "123e4567-e89b-12d3-a456-426614174001",
                "role": "user",
                "content": "Add a task to buy groceries",
                "tool_calls": None,
                "created_at": "2026-01-12T10:00:00Z",
            }
        }
