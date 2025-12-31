"""Task model for Phase I console application.

Defines the Task dataclass with validation and factory method.
"""

import uuid
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Literal


@dataclass
class Task:
    """Represents a task item with unique identifier, title, description, status, and timestamps.

    Attributes:
        id: Unique identifier (UUID format)
        title: Task title (1-100 characters)
        description: Task description (0-500 characters)
        text: Combined title for backward compatibility (auto-generated from title)
        status: Completion state ("pending" or "completed")
        created_at: Timestamp when task was created (UTC)
        completed_at: Timestamp when marked complete (UTC, None if pending)
        updated_at: Timestamp of last text modification (UTC)

    Raises:
        ValueError: If title is empty or fields exceed length limits
    """

    id: str
    title: str
    description: str
    text: str
    status: Literal["pending", "completed"]
    created_at: datetime
    completed_at: datetime | None
    updated_at: datetime

    def __post_init__(self) -> None:
        """Validate task fields after initialization.

        Raises:
            ValueError: If title is empty or fields exceed length limits
        """
        # Validate title
        if not self.title or len(self.title) == 0:
            raise ValueError("Task title required")
        if len(self.title) > 100:
            raise ValueError("Task title too long (max 100 characters)")

        # Validate description (can be empty)
        if len(self.description) > 500:
            raise ValueError("Task description too long (max 500 characters)")

        # Validate text for backward compatibility
        if not self.text or len(self.text) == 0:
            raise ValueError("Task text required")
        if len(self.text) > 200:
            raise ValueError("Task text too long (max 200 characters)")

    @classmethod
    def create(cls, title: str, description: str = "") -> "Task":
        """Factory method to create a new Task with generated UUID and timestamps.

        Args:
            title: Task title (1-100 characters)
            description: Task description (0-500 characters, optional)

        Returns:
            New Task instance with:
            - Generated UUID as id
            - title and description as provided
            - text set to title for backward compatibility
            - status set to "pending"
            - created_at and updated_at set to current UTC time
            - completed_at set to None

        Raises:
            ValueError: If title is empty or fields exceed length limits

        Example:
            >>> task = Task.create("Buy groceries", "Milk, eggs, bread")
            >>> task.status
            'pending'
            >>> task.completed_at is None
            True
        """
        now = datetime.now(UTC)
        return cls(
            id=str(uuid.uuid4()),
            title=title,
            description=description,
            text=title,  # Backward compatibility
            status="pending",
            created_at=now,
            completed_at=None,
            updated_at=now,
        )
