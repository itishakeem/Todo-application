"""Todo model for Phase I console application.

Defines the Todo dataclass with validation and factory method.
"""

import uuid
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Literal


@dataclass
class Todo:
    """Represents a todo item with unique identifier, text, status, and timestamps.

    Attributes:
        id: Unique identifier (UUID format)
        text: Todo description (1-200 characters)
        status: Completion state ("pending" or "completed")
        created_at: Timestamp when todo was created (UTC)
        completed_at: Timestamp when marked complete (UTC, None if pending)
        updated_at: Timestamp of last text modification (UTC)

    Raises:
        ValueError: If text is empty or longer than 200 characters
    """

    id: str
    text: str
    status: Literal["pending", "completed"]
    created_at: datetime
    completed_at: datetime | None
    updated_at: datetime

    def __post_init__(self) -> None:
        """Validate todo fields after initialization.

        Raises:
            ValueError: If text length is invalid (empty or >200 chars)
        """
        # Validate text length
        if not self.text or len(self.text) == 0:
            raise ValueError("Todo text required")
        if len(self.text) > 200:
            raise ValueError("Todo text too long (max 200 characters)")

    @classmethod
    def create(cls, text: str) -> "Todo":
        """Factory method to create a new Todo with generated UUID and timestamps.

        Args:
            text: Todo description (1-200 characters)

        Returns:
            New Todo instance with:
            - Generated UUID as id
            - status set to "pending"
            - created_at and updated_at set to current UTC time
            - completed_at set to None

        Raises:
            ValueError: If text is empty or longer than 200 characters

        Example:
            >>> todo = Todo.create("Buy groceries")
            >>> todo.status
            'pending'
            >>> todo.completed_at is None
            True
        """
        now = datetime.now(UTC)
        return cls(
            id=str(uuid.uuid4()),
            text=text,
            status="pending",
            created_at=now,
            completed_at=None,
            updated_at=now,
        )
