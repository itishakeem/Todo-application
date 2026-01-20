"""
Validation utilities for MCP tools.
Implements Phase I/II validation rules for task operations.
"""
from uuid import UUID
from sqlmodel import Session
from typing import Tuple
from src.models.task import Task
from .types import ToolError, validation_error, not_found_error, ErrorCode


# Validation constants (from Phase I/II)
TITLE_MIN_LENGTH = 1
TITLE_MAX_LENGTH = 100
DESCRIPTION_MAX_LENGTH = 500


def validate_title(title: str | None) -> Tuple[bool, str | None]:
    """
    Validate task title.

    Args:
        title: Task title to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if title is None:
        return False, "Title is required"

    if not isinstance(title, str):
        return False, "Title must be a string"

    title = title.strip()
    if len(title) < TITLE_MIN_LENGTH:
        return False, f"Title must be at least {TITLE_MIN_LENGTH} character(s)"

    if len(title) > TITLE_MAX_LENGTH:
        return False, f"Title must not exceed {TITLE_MAX_LENGTH} characters"

    return True, None


def validate_description(description: str | None) -> Tuple[bool, str | None]:
    """
    Validate task description.

    Args:
        description: Task description to validate (optional)

    Returns:
        Tuple of (is_valid, error_message)
    """
    if description is None:
        return True, None  # Description is optional

    if not isinstance(description, str):
        return False, "Description must be a string"

    if len(description) > DESCRIPTION_MAX_LENGTH:
        return False, f"Description must not exceed {DESCRIPTION_MAX_LENGTH} characters"

    return True, None


def validate_task_id(task_id: str | None) -> Tuple[bool, UUID | None, str | None]:
    """
    Validate and parse task ID as UUID.

    Args:
        task_id: Task ID string to validate

    Returns:
        Tuple of (is_valid, parsed_uuid, error_message)
    """
    if task_id is None:
        return False, None, "Task ID is required"

    if not isinstance(task_id, str):
        return False, None, "Task ID must be a string"

    try:
        parsed_uuid = UUID(task_id)
        return True, parsed_uuid, None
    except ValueError:
        return False, None, "Task ID must be a valid UUID"


def validate_filter(filter_value: str | None) -> Tuple[bool, str, str | None]:
    """
    Validate task filter value.

    Args:
        filter_value: Filter value to validate

    Returns:
        Tuple of (is_valid, normalized_filter, error_message)
    """
    valid_filters = {"all", "pending", "completed"}

    if filter_value is None:
        return True, "all", None  # Default to "all"

    if not isinstance(filter_value, str):
        return False, "", "Filter must be a string"

    normalized = filter_value.lower().strip()
    if normalized not in valid_filters:
        return False, "", f"Filter must be one of: {', '.join(valid_filters)}"

    return True, normalized, None


def validate_user_owns_task(
    session: Session,
    user_id: UUID,
    task_id: UUID,
) -> Tuple[bool, Task | None, ToolError | None]:
    """
    Validate that a user owns a specific task.

    Args:
        session: Database session
        user_id: User ID to check ownership
        task_id: Task ID to check

    Returns:
        Tuple of (is_valid, task, error)
    """
    task = session.get(Task, task_id)

    if task is None:
        return False, None, not_found_error("Task", str(task_id))

    if task.user_id != user_id:
        # Return not found to avoid leaking existence of other users' tasks
        return False, None, not_found_error("Task", str(task_id))

    return True, task, None


def get_validation_error(field: str, message: str) -> ToolError:
    """
    Create a validation error for a specific field.

    Args:
        field: Field name that failed validation
        message: Error message

    Returns:
        ToolError instance
    """
    return validation_error(message, field)
