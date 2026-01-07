"""
User model for authentication with Better Auth.
SQLModel for PostgreSQL integration.
"""
from sqlmodel import Field, SQLModel
from datetime import datetime
from uuid import UUID, uuid4


class User(SQLModel, table=True):
    """
    User entity for authentication.
    Integrates with Better Auth for session management.
    """

    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(max_length=255, unique=True, index=True)
    name: str | None = Field(default=None, max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174001",
                "email": "user@example.com",
                "password_hash": "$2b$12$...",
                "created_at": "2026-01-02T22:00:00Z",
            }
        }
