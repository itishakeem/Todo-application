"""Unit tests for TaskStorage class.

Tests cover:
- Adding tasks with validation
- Retrieving tasks (get_all, get_by_id)
- Updating task text
- Marking tasks complete
- Deleting tasks
- Partial UUID matching
"""

import pytest


def test_add_creates_task_with_uuid() -> None:
    """Test that add() creates a task with valid UUID."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()
    text = "Buy groceries"

    task = storage.add(text)

    assert task.id is not None
    assert len(task.id) == 36  # UUID format
    assert task.text == text
    assert task.status == "pending"


def test_add_stores_task_in_storage() -> None:
    """Test that add() stores the task in internal storage."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()
    text = "Buy groceries"

    task = storage.add(text)
    all_tasks = storage.get_all()

    assert len(all_tasks) == 1
    assert all_tasks[0].id == task.id
    assert all_tasks[0].text == text


def test_add_empty_text_raises_error() -> None:
    """Test that add() with empty text raises ValueError."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()

    with pytest.raises(ValueError, match="Task text required"):
        storage.add("")


def test_add_text_too_long_raises_error() -> None:
    """Test that add() with text >200 chars raises ValueError."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()
    long_text = "A" * 201

    with pytest.raises(ValueError, match="Task text too long"):
        storage.add(long_text)


def test_get_all_returns_empty_list_initially() -> None:
    """Test that get_all() returns empty list for new storage."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()
    tasks = storage.get_all()

    assert tasks == []
    assert len(tasks) == 0


def test_get_all_returns_all_tasks() -> None:
    """Test that get_all() returns all added tasks."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()
    storage.add("Task 1")
    storage.add("Task 2")
    storage.add("Task 3")

    tasks = storage.get_all()

    assert len(tasks) == 3


def test_get_all_sorted_newest_first() -> None:
    """Test that get_all() returns tasks sorted by created_at descending."""
    import time

    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()
    task1 = storage.add("First task")
    time.sleep(0.01)  # Ensure different timestamps
    task2 = storage.add("Second task")
    time.sleep(0.01)
    task3 = storage.add("Third task")

    tasks = storage.get_all()

    # Newest first (task3, task2, task1)
    assert tasks[0].id == task3.id
    assert tasks[1].id == task2.id
    assert tasks[2].id == task1.id


def test_get_by_id_finds_task() -> None:
    """Test that get_by_id() finds a task by full UUID."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()
    task = storage.add("Test task")

    found = storage.get_by_id(task.id)

    assert found is not None
    assert found.id == task.id
    assert found.text == "Test task"


def test_get_by_id_partial_match() -> None:
    """Test that get_by_id() finds task with first 8 characters."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()
    task = storage.add("Test task")
    partial_id = task.id[:8]

    found = storage.get_by_id(partial_id)

    assert found is not None
    assert found.id == task.id


def test_get_by_id_returns_none_if_not_found() -> None:
    """Test that get_by_id() returns None for non-existent ID."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()

    found = storage.get_by_id("nonexistent-id-12345678")

    assert found is None


def test_get_by_id_validates_minimum_length() -> None:
    """Test that get_by_id() requires at least 8 characters."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()

    with pytest.raises(ValueError, match="minimum 8 characters"):
        storage.get_by_id("abc123")  # Only 6 chars


def test_mark_complete_sets_status() -> None:
    """Test that mark_complete() sets status to completed."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()
    task = storage.add("Test task")

    completed = storage.mark_complete(task.id)

    assert completed.status == "completed"
    assert completed.completed_at is not None


def test_mark_complete_idempotent() -> None:
    """Test that mark_complete() is idempotent (can call multiple times)."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()
    task = storage.add("Test task")

    first_complete = storage.mark_complete(task.id)
    second_complete = storage.mark_complete(task.id)

    assert first_complete.status == "completed"
    assert second_complete.status == "completed"


def test_mark_complete_not_found_raises_error() -> None:
    """Test that mark_complete() raises KeyError for non-existent ID."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()

    with pytest.raises(KeyError, match="Task ID not found"):
        storage.mark_complete("nonexistent-id-12345678")


def test_update_text_changes_text() -> None:
    """Test that update_text() changes the task text."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()
    task = storage.add("Old text")

    updated = storage.update_text(task.id, "New text")

    assert updated.text == "New text"
    assert updated.id == task.id


def test_update_text_refreshes_updated_at() -> None:
    """Test that update_text() updates the updated_at timestamp."""
    import time

    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()
    task = storage.add("Original text")
    original_updated_at = task.updated_at

    time.sleep(0.01)
    updated = storage.update_text(task.id, "New text")

    assert updated.updated_at > original_updated_at


def test_update_text_validates_text() -> None:
    """Test that update_text() validates text length."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()
    task = storage.add("Original text")

    # Empty text
    with pytest.raises(ValueError, match="Task text required"):
        storage.update_text(task.id, "")

    # Text too long
    with pytest.raises(ValueError, match="Task text too long"):
        storage.update_text(task.id, "A" * 201)


def test_update_text_not_found_raises_error() -> None:
    """Test that update_text() raises KeyError for non-existent ID."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()

    with pytest.raises(KeyError, match="Task ID not found"):
        storage.update_text("nonexistent-id-12345678", "New text")


def test_delete_removes_task() -> None:
    """Test that delete() removes task from storage."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()
    task = storage.add("To be deleted")

    result = storage.delete(task.id)
    all_tasks = storage.get_all()

    assert result is True
    assert len(all_tasks) == 0


def test_delete_returns_false_if_not_found() -> None:
    """Test that delete() returns False for non-existent ID."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()

    result = storage.delete("nonexistent-id-12345678")

    assert result is False


def test_delete_idempotent() -> None:
    """Test that delete() is idempotent (second call returns False)."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()
    task = storage.add("To be deleted")

    first_delete = storage.delete(task.id)
    second_delete = storage.delete(task.id)

    assert first_delete is True
    assert second_delete is False


def test_delete_invalid_id_format_returns_false() -> None:
    """Test that delete() returns False for invalid ID format (<8 chars)."""
    from src.storage.task_storage import TaskStorage

    storage = TaskStorage()

    result = storage.delete("abc123")  # Only 6 chars

    assert result is False
