"""Unit tests for ConsoleUI class.

Tests cover:
- Display methods (success, error, tasks, menu)
- Input methods (menu choice, task text, task ID)
- Formatting and validation
"""

from datetime import UTC, datetime
from io import StringIO
from unittest.mock import patch

from src.models.task import Task


def test_display_success_formats_message() -> None:
    """Test that display_success() prints message with checkmark."""
    from src.ui.console_ui import ConsoleUI

    ui = ConsoleUI()

    with patch("sys.stdout", new=StringIO()) as fake_out:
        ui.display_success("Task added successfully")
        output = fake_out.getvalue()

    assert "✅" in output
    assert "Task added successfully" in output


def test_display_error_formats_message() -> None:
    """Test that display_error() prints message with X mark."""
    from src.ui.console_ui import ConsoleUI

    ui = ConsoleUI()

    with patch("sys.stdout", new=StringIO()) as fake_out:
        ui.display_error("Task text required")
        output = fake_out.getvalue()

    assert "❌" in output
    assert "Task text required" in output


def test_display_menu_shows_all_options() -> None:
    """Test that display_menu() shows 6 numbered options."""
    from src.ui.console_ui import ConsoleUI

    ui = ConsoleUI()

    with patch("sys.stdout", new=StringIO()) as fake_out:
        ui.display_menu()
        output = fake_out.getvalue()

    assert "1." in output and "Add task" in output
    assert "2." in output and "List tasks" in output
    assert "3." in output and "Mark complete" in output
    assert "4." in output and "Update task" in output
    assert "5." in output and "Delete task" in output
    assert "6." in output and "Exit" in output


def test_get_menu_choice_returns_valid_number() -> None:
    """Test that get_menu_choice() returns number between 1-6."""
    from src.ui.console_ui import ConsoleUI

    ui = ConsoleUI()

    with patch("builtins.input", return_value="3"):
        choice = ui.get_menu_choice()

    assert choice == 3


def test_get_menu_choice_reprompts_on_invalid_input() -> None:
    """Test that get_menu_choice() loops on invalid input."""
    from src.ui.console_ui import ConsoleUI

    ui = ConsoleUI()

    # First two inputs invalid, third valid
    with patch("builtins.input", side_effect=["invalid", "0", "4"]):
        with patch("sys.stdout", new=StringIO()):
            choice = ui.get_menu_choice()

    assert choice == 4


def test_get_menu_choice_rejects_out_of_range() -> None:
    """Test that get_menu_choice() rejects numbers outside 1-6."""
    from src.ui.console_ui import ConsoleUI

    ui = ConsoleUI()

    # 7 is out of range, then valid 2
    with patch("builtins.input", side_effect=["7", "2"]):
        with patch("sys.stdout", new=StringIO()):
            choice = ui.get_menu_choice()

    assert choice == 2


def test_prompt_task_text_returns_stripped_input() -> None:
    """Test that prompt_task_text() returns stripped text."""
    from src.ui.console_ui import ConsoleUI

    ui = ConsoleUI()

    with patch("builtins.input", return_value="  Buy groceries  "):
        text = ui.prompt_task_text()

    assert text == "Buy groceries"


def test_prompt_task_text_reprompts_on_empty() -> None:
    """Test that prompt_task_text() loops on empty input."""
    from src.ui.console_ui import ConsoleUI

    ui = ConsoleUI()

    # Empty strings, then valid
    with patch("builtins.input", side_effect=["", "   ", "Valid text"]):
        with patch("sys.stdout", new=StringIO()):
            text = ui.prompt_task_text()

    assert text == "Valid text"


def test_prompt_task_text_reprompts_on_too_long() -> None:
    """Test that prompt_task_text() loops on text >200 chars."""
    from src.ui.console_ui import ConsoleUI

    ui = ConsoleUI()

    long_text = "A" * 201
    valid_text = "Valid text"

    with patch("builtins.input", side_effect=[long_text, valid_text]):
        with patch("sys.stdout", new=StringIO()):
            text = ui.prompt_task_text()

    assert text == valid_text


def test_prompt_task_id_returns_stripped_input() -> None:
    """Test that prompt_task_id() returns stripped ID."""
    from src.ui.console_ui import ConsoleUI

    ui = ConsoleUI()

    with patch("builtins.input", return_value="  abc12345  "):
        task_id = ui.prompt_task_id()

    assert task_id == "abc12345"


def test_prompt_task_id_validates_minimum_length() -> None:
    """Test that prompt_task_id() requires at least 8 characters."""
    from src.ui.console_ui import ConsoleUI

    ui = ConsoleUI()

    # Too short, then valid
    with patch("builtins.input", side_effect=["abc", "abc12345"]):
        with patch("sys.stdout", new=StringIO()):
            task_id = ui.prompt_task_id()

    assert task_id == "abc12345"


def test_display_tasks_shows_all_tasks() -> None:
    """Test that display_tasks() shows all task details."""
    from src.ui.console_ui import ConsoleUI

    ui = ConsoleUI()

    tasks = [
        Task.create("Task 1"),
        Task.create("Task 2"),
    ]

    with patch("sys.stdout", new=StringIO()) as fake_out:
        ui.display_tasks(tasks)
        output = fake_out.getvalue()

    assert "Task 1" in output
    assert "Task 2" in output
    assert tasks[0].id[:8] in output
    assert tasks[1].id[:8] in output


def test_display_tasks_shows_empty_message() -> None:
    """Test that display_tasks() shows message when no tasks."""
    from src.ui.console_ui import ConsoleUI

    ui = ConsoleUI()

    with patch("sys.stdout", new=StringIO()) as fake_out:
        ui.display_tasks([])
        output = fake_out.getvalue()

    assert "No tasks yet" in output


def test_display_tasks_shows_status_indicators() -> None:
    """Test that display_tasks() shows status with indicators."""
    from src.ui.console_ui import ConsoleUI

    ui = ConsoleUI()

    pending_task = Task.create("Pending task")
    completed_task = Task(
        id=pending_task.id,
        text="Completed task",
        status="completed",
        created_at=datetime.now(UTC),
        completed_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    with patch("sys.stdout", new=StringIO()) as fake_out:
        ui.display_tasks([pending_task, completed_task])
        output = fake_out.getvalue()

    assert "[ ]" in output or "pending" in output.lower()
    assert "[✓]" in output or "completed" in output.lower()


def test_confirm_exit_shows_warning_and_goodbye() -> None:
    """Test that confirm_exit() shows data loss warning."""
    from src.ui.console_ui import ConsoleUI

    ui = ConsoleUI()

    with patch("sys.stdout", new=StringIO()) as fake_out:
        ui.confirm_exit()
        output = fake_out.getvalue()

    assert "lost" in output.lower() or "⚠" in output
    assert "goodbye" in output.lower() or "Goodbye" in output
