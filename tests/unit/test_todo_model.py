"""Unit tests for Todo model.

Tests cover:
- Todo creation with valid data
- Field validation (text length, status values)
- Factory method for creating todos
- Timestamp handling
"""

from datetime import UTC, datetime

import pytest


def test_todo_creation_with_valid_data() -> None:
    """Test creating a Todo with all valid fields."""
    from src.models.todo import Todo

    todo_id = "550e8400-e29b-41d4-a716-446655440000"
    text = "Buy groceries"
    status = "pending"
    created_at = datetime.now(UTC)
    updated_at = datetime.now(UTC)
    completed_at: datetime | None = None

    todo = Todo(
        id=todo_id,
        text=text,
        status=status,
        created_at=created_at,
        completed_at=completed_at,
        updated_at=updated_at,
    )

    assert todo.id == todo_id
    assert todo.text == text
    assert todo.status == status
    assert todo.created_at == created_at
    assert todo.completed_at is None
    assert todo.updated_at == updated_at


def test_todo_text_minimum_length() -> None:
    """Test that todo text must be at least 1 character."""
    from src.models.todo import Todo

    todo_id = "550e8400-e29b-41d4-a716-446655440000"
    text = "A"  # Minimum valid length (1 character)
    created_at = datetime.now(UTC)
    updated_at = datetime.now(UTC)

    todo = Todo(
        id=todo_id,
        text=text,
        status="pending",
        created_at=created_at,
        completed_at=None,
        updated_at=updated_at,
    )

    assert todo.text == "A"


def test_todo_text_maximum_length() -> None:
    """Test that todo text can be up to 200 characters."""
    from src.models.todo import Todo

    todo_id = "550e8400-e29b-41d4-a716-446655440000"
    text = "A" * 200  # Maximum valid length
    created_at = datetime.now(UTC)
    updated_at = datetime.now(UTC)

    todo = Todo(
        id=todo_id,
        text=text,
        status="pending",
        created_at=created_at,
        completed_at=None,
        updated_at=updated_at,
    )

    assert len(todo.text) == 200


def test_todo_text_empty_raises_error() -> None:
    """Test that empty text raises ValueError."""
    from src.models.todo import Todo

    todo_id = "550e8400-e29b-41d4-a716-446655440000"
    text = ""  # Invalid: empty
    created_at = datetime.now(UTC)
    updated_at = datetime.now(UTC)

    with pytest.raises(ValueError, match="Todo text required"):
        Todo(
            id=todo_id,
            text=text,
            status="pending",
            created_at=created_at,
            completed_at=None,
            updated_at=updated_at,
        )


def test_todo_text_too_long_raises_error() -> None:
    """Test that text longer than 200 characters raises ValueError."""
    from src.models.todo import Todo

    todo_id = "550e8400-e29b-41d4-a716-446655440000"
    text = "A" * 201  # Invalid: too long
    created_at = datetime.now(UTC)
    updated_at = datetime.now(UTC)

    with pytest.raises(ValueError, match="Todo text too long"):
        Todo(
            id=todo_id,
            text=text,
            status="pending",
            created_at=created_at,
            completed_at=None,
            updated_at=updated_at,
        )


def test_todo_status_pending_valid() -> None:
    """Test that status='pending' is valid."""
    from src.models.todo import Todo

    todo_id = "550e8400-e29b-41d4-a716-446655440000"
    created_at = datetime.now(UTC)
    updated_at = datetime.now(UTC)

    todo = Todo(
        id=todo_id,
        text="Test todo",
        status="pending",
        created_at=created_at,
        completed_at=None,
        updated_at=updated_at,
    )

    assert todo.status == "pending"


def test_todo_status_completed_valid() -> None:
    """Test that status='completed' is valid."""
    from src.models.todo import Todo

    todo_id = "550e8400-e29b-41d4-a716-446655440000"
    created_at = datetime.now(UTC)
    completed_at = datetime.now(UTC)
    updated_at = datetime.now(UTC)

    todo = Todo(
        id=todo_id,
        text="Test todo",
        status="completed",
        created_at=created_at,
        completed_at=completed_at,
        updated_at=updated_at,
    )

    assert todo.status == "completed"
    assert todo.completed_at is not None


def test_todo_factory_creates_with_uuid() -> None:
    """Test that Todo.create() generates a valid UUID."""
    from src.models.todo import Todo

    text = "Buy groceries"
    todo = Todo.create(text)

    assert todo.id is not None
    assert len(todo.id) == 36  # UUID format: 8-4-4-4-12 with hyphens
    assert todo.id.count("-") == 4


def test_todo_factory_sets_pending_status() -> None:
    """Test that Todo.create() sets status to 'pending'."""
    from src.models.todo import Todo

    text = "Buy groceries"
    todo = Todo.create(text)

    assert todo.status == "pending"
    assert todo.completed_at is None


def test_todo_factory_sets_timestamps() -> None:
    """Test that Todo.create() initializes timestamps."""
    from src.models.todo import Todo

    text = "Buy groceries"
    before = datetime.now(UTC)
    todo = Todo.create(text)
    after = datetime.now(UTC)

    assert todo.created_at is not None
    assert todo.updated_at is not None
    assert before <= todo.created_at <= after
    assert before <= todo.updated_at <= after


def test_todo_factory_validates_text_length() -> None:
    """Test that Todo.create() validates text length."""
    from src.models.todo import Todo

    # Empty text
    with pytest.raises(ValueError, match="Todo text required"):
        Todo.create("")

    # Text too long
    with pytest.raises(ValueError, match="Todo text too long"):
        Todo.create("A" * 201)


def test_todo_field_access() -> None:
    """Test direct access to all Todo fields."""
    from src.models.todo import Todo

    text = "Test todo"
    todo = Todo.create(text)

    # All fields should be accessible
    assert hasattr(todo, "id")
    assert hasattr(todo, "text")
    assert hasattr(todo, "status")
    assert hasattr(todo, "created_at")
    assert hasattr(todo, "completed_at")
    assert hasattr(todo, "updated_at")

    # Verify field values
    assert isinstance(todo.id, str)
    assert isinstance(todo.text, str)
    assert isinstance(todo.status, str)
    assert isinstance(todo.created_at, datetime)
    assert todo.completed_at is None or isinstance(todo.completed_at, datetime)
    assert isinstance(todo.updated_at, datetime)
