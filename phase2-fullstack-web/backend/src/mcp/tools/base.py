"""
Base utilities for MCP tools.
Provides common functionality for tool implementations.
"""
from uuid import UUID
from sqlmodel import Session
from mcp.types import TextContent
from typing import Callable, Awaitable, TypeVar

from ..types import ToolSuccess, ToolError, success_response, validation_error, not_found_error
from ..validators import validate_task_id
from ...models.task import Task

T = TypeVar("T")


def get_task_or_error(
    session: Session,
    user_id: UUID,
    task_id_str: str,
) -> tuple[Task | None, TextContent | None]:
    """
    Validate task_id and get task if it exists and belongs to user.

    Args:
        session: Database session
        user_id: User's UUID
        task_id_str: Task ID string

    Returns:
        Tuple of (task, error_response):
        - If valid: (Task, None)
        - If invalid task_id: (None, TextContent with error)
        - If not found: (None, TextContent with error)
    """
    # Validate task_id format
    is_valid, parsed_task_id, error_msg = validate_task_id(task_id_str)
    if not is_valid:
        error = validation_error(error_msg, field="task_id")
        return None, TextContent(type="text", text=error.to_json())

    # Get task and verify ownership
    task = session.get(Task, parsed_task_id)
    if task is None or task.user_id != user_id:
        error = not_found_error("Task", task_id_str)
        return None, TextContent(type="text", text=error.to_json())

    return task, None


def make_error_response(error: ToolError) -> list[TextContent]:
    """Convert ToolError to TextContent list."""
    return [TextContent(type="text", text=error.to_json())]


def make_success_response(response: ToolSuccess) -> list[TextContent]:
    """Convert ToolSuccess to TextContent list."""
    return [TextContent(type="text", text=response.to_json())]
