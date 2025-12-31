"""Unit tests for Task model.

Tests cover:
- Task creation with valid data
- Field validation (text length, status values)
- Factory method for creating tasks
- Timestamp handling
"""

from datetime import UTC, datetime
from typing import Literal

import pytest


def test_task_creation_with_valid_data() -> None:
    """Test creating a Task with all valid fields."""
    from src.models.task import Task

    task_id = "550e8400-e29b-41d4-a716-446655440000"
    text = "Buy groceries"
    status: Literal["pending", "completed"] = "pending"
    created_at = datetime.now(UTC)
    updated_at = datetime.now(UTC)
    completed_at: datetime | None = None

    task = Task(
        id=task_id,
        text=text,
        status=status,
        created_at=created_at,
        completed_at=completed_at,
        updated_at=updated_at,
    )

    assert task.id == task_id
    assert task.text == text
    assert task.status == status
    assert task.created_at == created_at
    assert task.completed_at is None
    assert task.updated_at == updated_at


def test_task_text_minimum_length() -> None:
    """Test that task text must be at least 1 character."""
    from src.models.task import Task

    task_id = "550e8400-e29b-41d4-a716-446655440000"
    text = "A"  # Minimum valid length (1 character)
    created_at = datetime.now(UTC)
    updated_at = datetime.now(UTC)

    task = Task(
        id=task_id,
        text=text,
        status="pending",
        created_at=created_at,
        completed_at=None,
        updated_at=updated_at,
    )

    assert task.text == "A"


def test_task_text_maximum_length() -> None:
    """Test that task text can be up to 200 characters."""
    from src.models.task import Task

    task_id = "550e8400-e29b-41d4-a716-446655440000"
    text = "A" * 200  # Maximum valid length
    created_at = datetime.now(UTC)
    updated_at = datetime.now(UTC)

    task = Task(
        id=task_id,
        text=text,
        status="pending",
        created_at=created_at,
        completed_at=None,
        updated_at=updated_at,
    )

    assert len(task.text) == 200


def test_task_text_empty_raises_error() -> None:
    """Test that empty text raises ValueError."""
    from src.models.task import Task

    task_id = "550e8400-e29b-41d4-a716-446655440000"
    text = ""  # Invalid: empty
    created_at = datetime.now(UTC)
    updated_at = datetime.now(UTC)

    with pytest.raises(ValueError, match="Task text required"):
        Task(
            id=task_id,
            text=text,
            status="pending",
            created_at=created_at,
            completed_at=None,
            updated_at=updated_at,
        )


def test_task_text_too_long_raises_error() -> None:
    """Test that text longer than 200 characters raises ValueError."""
    from src.models.task import Task

    task_id = "550e8400-e29b-41d4-a716-446655440000"
    text = "A" * 201  # Invalid: too long
    created_at = datetime.now(UTC)
    updated_at = datetime.now(UTC)

    with pytest.raises(ValueError, match="Task text too long"):
        Task(
            id=task_id,
            text=text,
            status="pending",
            created_at=created_at,
            completed_at=None,
            updated_at=updated_at,
        )


def test_task_status_pending_valid() -> None:
    """Test that status='pending' is valid."""
    from src.models.task import Task

    task_id = "550e8400-e29b-41d4-a716-446655440000"
    created_at = datetime.now(UTC)
    updated_at = datetime.now(UTC)

    task = Task(
        id=task_id,
        text="Test task",
        status="pending",
        created_at=created_at,
        completed_at=None,
        updated_at=updated_at,
    )

    assert task.status == "pending"


def test_task_status_completed_valid() -> None:
    """Test that status='completed' is valid."""
    from src.models.task import Task

    task_id = "550e8400-e29b-41d4-a716-446655440000"
    created_at = datetime.now(UTC)
    completed_at = datetime.now(UTC)
    updated_at = datetime.now(UTC)

    task = Task(
        id=task_id,
        text="Test task",
        status="completed",
        created_at=created_at,
        completed_at=completed_at,
        updated_at=updated_at,
    )

    assert task.status == "completed"
    assert task.completed_at is not None


def test_task_factory_creates_with_uuid() -> None:
    """Test that Task.create() generates a valid UUID."""
    from src.models.task import Task

    text = "Buy groceries"
    task = Task.create(text)

    assert task.id is not None
    assert len(task.id) == 36  # UUID format: 8-4-4-4-12 with hyphens
    assert task.id.count("-") == 4


def test_task_factory_sets_pending_status() -> None:
    """Test that Task.create() sets status to 'pending'."""
    from src.models.task import Task

    text = "Buy groceries"
    task = Task.create(text)

    assert task.status == "pending"
    assert task.completed_at is None


def test_task_factory_sets_timestamps() -> None:
    """Test that Task.create() initializes timestamps."""
    from src.models.task import Task

    text = "Buy groceries"
    before = datetime.now(UTC)
    task = Task.create(text)
    after = datetime.now(UTC)

    assert task.created_at is not None
    assert task.updated_at is not None
    assert before <= task.created_at <= after
    assert before <= task.updated_at <= after


def test_task_factory_validates_text_length() -> None:
    """Test that Task.create() validates text length."""
    from src.models.task import Task

    # Empty text
    with pytest.raises(ValueError, match="Task text required"):
        Task.create("")

    # Text too long
    with pytest.raises(ValueError, match="Task text too long"):
        Task.create("A" * 201)


def test_task_field_access() -> None:
    """Test direct access to all Task fields."""
    from src.models.task import Task

    text = "Test task"
    task = Task.create(text)

    # All fields should be accessible
    assert hasattr(task, "id")
    assert hasattr(task, "text")
    assert hasattr(task, "status")
    assert hasattr(task, "created_at")
    assert hasattr(task, "completed_at")
    assert hasattr(task, "updated_at")

    # Verify field values
    assert isinstance(task.id, str)
    assert isinstance(task.text, str)
    assert isinstance(task.status, str)
    assert isinstance(task.created_at, datetime)
    assert task.completed_at is None or isinstance(task.completed_at, datetime)
    assert isinstance(task.updated_at, datetime)
