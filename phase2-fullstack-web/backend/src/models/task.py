"""
Task model - preserves Phase I schema with UUID and timestamps.
SQLModel for PostgreSQL integration.
"""
from sqlmodel import Field, SQLModel
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4


class Task(SQLModel, table=True):
    """
    Task entity matching Phase I console app schema.
    Preserves existing business logic from Phase I.
    """

    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=100, min_length=1)
    description: str = Field(default="", max_length=500)
    status: str = Field(default="pending", regex="^(pending|completed)$")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "user_id": "123e4567-e89b-12d3-a456-426614174001",
                "title": "Complete Phase II implementation",
                "description": "Build full-stack web UI with responsive design",
                "status": "pending",
                "created_at": "2026-01-02T22:00:00Z",
                "completed_at": None,
                "updated_at": None,
            }
        }
