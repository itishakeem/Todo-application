"""Integration tests for Phase I Console Task Application.

Tests cover complete user workflows:
- US1: Add new task
- US2: View all tasks
- US3: Mark task complete
- US4: Update task text
- US5: Delete task
- US6: Exit application cleanly
"""

from io import StringIO
from unittest.mock import patch

from src.storage.task_storage import TaskStorage
from src.ui.console_ui import ConsoleUI


def test_add_task_workflow() -> None:
    """Test US1: Add new task workflow - user can add task and receive confirmation."""
    storage = TaskStorage()
    ConsoleUI()

    # User adds a task
    task = storage.add("Buy groceries")

    assert task.id is not None
    assert len(task.id) == 36  # UUID format
    assert task.text == "Buy groceries"
    assert task.status == "pending"
    assert task.completed_at is None

    # Verify task is stored
    all_tasks = storage.get_all()
    assert len(all_tasks) == 1
    assert all_tasks[0].id == task.id


def test_list_tasks_workflow() -> None:
    """Test US2: View all tasks workflow - user can list tasks sorted newest first."""
    import time

    storage = TaskStorage()
    ConsoleUI()

    # Add multiple tasks
    task1 = storage.add("First task")
    time.sleep(0.01)
    task2 = storage.add("Second task")
    time.sleep(0.01)
    task3 = storage.add("Third task")

    # User lists all tasks
    tasks = storage.get_all()

    assert len(tasks) == 3
    # Verify newest first sorting
    assert tasks[0].id == task3.id
    assert tasks[1].id == task2.id
    assert tasks[2].id == task1.id


def test_mark_complete_workflow() -> None:
    """Test US3: Mark task complete workflow - user can mark task as completed."""
    storage = TaskStorage()
    ConsoleUI()

    # User adds a task
    task = storage.add("Complete this task")

    # User marks it complete
    completed = storage.mark_complete(task.id)

    assert completed.status == "completed"
    assert completed.completed_at is not None
    assert completed.id == task.id
    assert completed.text == task.text


def test_mark_complete_with_partial_id() -> None:
    """Test US3: Mark complete with partial UUID (min 8 chars)."""
    storage = TaskStorage()

    # Add task and get partial ID
    task = storage.add("Task to complete")
    partial_id = task.id[:8]

    # Mark complete with partial ID
    completed = storage.mark_complete(partial_id)

    assert completed.status == "completed"
    assert completed.id == task.id


def test_update_task_workflow() -> None:
    """Test US4: Update task text workflow - user can update task text."""
    import time

    storage = TaskStorage()
    ConsoleUI()

    # User adds a task
    task = storage.add("Buy milk")
    original_updated_at = task.updated_at

    time.sleep(0.01)

    # User updates the text
    updated = storage.update_text(task.id, "Buy milk and eggs")

    assert updated.text == "Buy milk and eggs"
    assert updated.id == task.id
    assert updated.updated_at > original_updated_at
    assert updated.status == task.status  # Status unchanged


def test_delete_task_workflow() -> None:
    """Test US5: Delete task workflow - user can delete task by ID."""
    storage = TaskStorage()
    ConsoleUI()

    # User adds a task
    task = storage.add("Task to delete")

    # Verify task exists
    assert len(storage.get_all()) == 1

    # User deletes the task
    result = storage.delete(task.id)

    assert result is True
    assert len(storage.get_all()) == 0


def test_delete_task_with_partial_id() -> None:
    """Test US5: Delete task with partial UUID (min 8 chars)."""
    storage = TaskStorage()

    # Add task
    task = storage.add("Task to delete")
    partial_id = task.id[:8]

    # Delete with partial ID
    result = storage.delete(partial_id)

    assert result is True
    assert len(storage.get_all()) == 0


def test_delete_nonexistent_task() -> None:
    """Test US5: Delete non-existent task returns False without error."""
    storage = TaskStorage()

    # Try to delete non-existent task
    result = storage.delete("nonexistent-id-12345678")

    assert result is False


def test_empty_text_validation() -> None:
    """Test edge case: Empty text input raises ValueError."""
    storage = TaskStorage()

    try:
        storage.add("")
        raise AssertionError("Expected ValueError for empty text")
    except ValueError as e:
        assert "Task text required" in str(e)


def test_text_too_long_validation() -> None:
    """Test edge case: Text >200 chars raises ValueError."""
    storage = TaskStorage()
    long_text = "A" * 201

    try:
        storage.add(long_text)
        raise AssertionError("Expected ValueError for text too long")
    except ValueError as e:
        assert "Task text too long" in str(e)


def test_invalid_task_id_format() -> None:
    """Test edge case: Task ID <8 chars raises ValueError."""
    storage = TaskStorage()

    try:
        storage.get_by_id("abc123")  # Only 6 chars
        raise AssertionError("Expected ValueError for ID too short")
    except ValueError as e:
        assert "minimum 8 characters" in str(e)


def test_mark_complete_idempotent() -> None:
    """Test edge case: Mark complete is idempotent (can call multiple times)."""
    storage = TaskStorage()

    task = storage.add("Task to complete")

    # Mark complete twice
    first = storage.mark_complete(task.id)
    second = storage.mark_complete(task.id)

    assert first.status == "completed"
    assert second.status == "completed"


def test_delete_idempotent() -> None:
    """Test edge case: Delete is idempotent (second call returns False)."""
    storage = TaskStorage()

    task = storage.add("Task to delete")

    # Delete twice
    first = storage.delete(task.id)
    second = storage.delete(task.id)

    assert first is True
    assert second is False


def test_full_crud_workflow() -> None:
    """Test complete CRUD workflow: Create, Read, Update, Delete."""
    import time

    storage = TaskStorage()

    # CREATE
    task1 = storage.add("Buy groceries")
    task2 = storage.add("Clean room")
    time.sleep(0.01)
    task3 = storage.add("Do homework")

    # READ - Get all
    all_tasks = storage.get_all()
    assert len(all_tasks) == 3
    assert all_tasks[0].id == task3.id  # Newest first

    # READ - Get by ID
    found = storage.get_by_id(task1.id[:8])
    assert found is not None
    assert found.id == task1.id

    # UPDATE
    time.sleep(0.01)
    updated = storage.update_text(task2.id, "Clean room and organize")
    assert updated.text == "Clean room and organize"
    assert updated.updated_at > task2.updated_at

    # MARK COMPLETE
    completed = storage.mark_complete(task1.id)
    assert completed.status == "completed"

    # DELETE
    deleted = storage.delete(task3.id)
    assert deleted is True

    # Verify final state
    final_tasks = storage.get_all()
    assert len(final_tasks) == 2


def test_ui_display_tasks_with_mixed_status() -> None:
    """Test UI displays tasks with different statuses correctly."""
    storage = TaskStorage()
    ui = ConsoleUI()

    # Add tasks with different statuses
    storage.add("Pending task")
    task2 = storage.add("Another pending")
    storage.mark_complete(task2.id)

    # Display tasks
    tasks = storage.get_all()
    with patch("sys.stdout", new=StringIO()) as fake_out:
        ui.display_tasks(tasks)
        output = fake_out.getvalue()

    assert "Pending task" in output
    assert "Another pending" in output
    assert "[✓]" in output  # Completed indicator
    assert "[ ]" in output  # Pending indicator


def test_ui_display_empty_task_list() -> None:
    """Test UI displays appropriate message for empty task list."""
    storage = TaskStorage()
    ui = ConsoleUI()

    tasks = storage.get_all()
    with patch("sys.stdout", new=StringIO()) as fake_out:
        ui.display_tasks(tasks)
        output = fake_out.getvalue()

    assert "No tasks yet" in output


def test_ui_menu_display() -> None:
    """Test UI displays menu with all 6 options."""
    ui = ConsoleUI()

    with patch("sys.stdout", new=StringIO()) as fake_out:
        ui.display_menu()
        output = fake_out.getvalue()

    assert "TASK APPLICATION" in output
    assert "1. Add task" in output
    assert "2. List tasks" in output
    assert "3. Mark complete" in output
    assert "4. Update task" in output
    assert "5. Delete task" in output
    assert "6. Exit" in output


def test_ui_confirm_exit_message() -> None:
    """Test UI displays exit confirmation with data loss warning."""
    ui = ConsoleUI()

    with patch("sys.stdout", new=StringIO()) as fake_out:
        ui.confirm_exit()
        output = fake_out.getvalue()

    assert "lost" in output.lower() or "⚠" in output
    assert "goodbye" in output.lower() or "Goodbye" in output


def test_large_task_list_performance() -> None:
    """Test edge case: Large task list (100 items) performs adequately."""
    import time

    storage = TaskStorage()

    # Add 100 tasks
    for i in range(100):
        storage.add(f"Task {i+1}")

    # Measure list retrieval time
    start = time.time()
    tasks = storage.get_all()
    elapsed = time.time() - start

    assert len(tasks) == 100
    assert elapsed < 0.5  # Should complete in <500ms per spec
    assert tasks[0].text == "Task 100"  # Newest first


def test_task_text_boundary_conditions() -> None:
    """Test edge case: Task text at min (1 char) and max (200 chars) boundaries."""
    storage = TaskStorage()

    # Minimum length (1 char)
    min_task = storage.add("A")
    assert min_task.text == "A"

    # Maximum length (200 chars)
    max_text = "B" * 200
    max_task = storage.add(max_text)
    assert len(max_task.text) == 200


def test_update_task_validation() -> None:
    """Test US4: Update task validates new text."""
    storage = TaskStorage()

    task = storage.add("Original text")

    # Empty text should fail
    try:
        storage.update_text(task.id, "")
        raise AssertionError("Expected ValueError for empty text")
    except ValueError as e:
        assert "Task text required" in str(e)

    # Text too long should fail
    try:
        storage.update_text(task.id, "C" * 201)
        raise AssertionError("Expected ValueError for text too long")
    except ValueError as e:
        assert "Task text too long" in str(e)


def test_mark_complete_nonexistent_task() -> None:
    """Test US3: Mark complete with non-existent ID raises KeyError."""
    storage = TaskStorage()

    try:
        storage.mark_complete("nonexistent-id-12345678")
        raise AssertionError("Expected KeyError for non-existent task")
    except KeyError as e:
        assert "Task ID not found" in str(e)


def test_update_nonexistent_task() -> None:
    """Test US4: Update non-existent task raises KeyError."""
    storage = TaskStorage()

    try:
        storage.update_text("nonexistent-id-12345678", "New text")
        raise AssertionError("Expected KeyError for non-existent task")
    except KeyError as e:
        assert "Task ID not found" in str(e)
