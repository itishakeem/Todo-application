"""
MCP Tool: complete_task
Toggles task completion status.
"""
from uuid import UUID
from sqlmodel import Session
from mcp.types import TextContent

from ..types import success_response, not_found_error, validation_error
from ..validators import validate_task_id
from ...services.task_service import TaskService


async def complete_task(
    session: Session,
    user_id: UUID,
    task_id: str,
) -> list[TextContent]:
    """
    Toggle a task's completion status.
    Marks pending tasks as completed and completed tasks as pending.

    Args:
        session: Database session
        user_id: User's UUID
        task_id: Task UUID string

    Returns:
        List containing TextContent with JSON response:
        - Success: {success: true, data: {task_id, status: "completed"|"pending", title}}
        - Error: {success: false, error: {code, message}}
    """
    # Validate task_id
    is_valid, parsed_task_id, error_msg = validate_task_id(task_id)
    if not is_valid:
        error = validation_error(error_msg, field="task_id")
        return [TextContent(type="text", text=error.to_json())]

    # Toggle completion via service
    task_service = TaskService(session)
    task = task_service.toggle_completion(task_id=parsed_task_id, user_id=user_id)

    if task is None:
        error = not_found_error("Task", task_id)
        return [TextContent(type="text", text=error.to_json())]

    # Determine status message
    new_status = task.status  # "completed" or "pending"

    # Return success response
    response = success_response(
        data={
            "task_id": str(task.id),
            "status": new_status,
            "title": task.title,
        },
        message=f"Task '{task.title}' marked as {new_status}",
    )
    return [TextContent(type="text", text=response.to_json())]
