"""
Conversation model for Phase III AI chatbot.
SQLModel for PostgreSQL integration.
"""
from sqlmodel import Field, SQLModel
from datetime import datetime
from typing import Optional
from uuid import UUID


class Conversation(SQLModel, table=True):
    """
    Conversation entity representing a chat session.
    Contains multiple messages and belongs to a user.
    """

    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": "123e4567-e89b-12d3-a456-426614174001",
                "created_at": "2026-01-12T10:00:00Z",
                "updated_at": "2026-01-12T10:05:00Z",
            }
        }
