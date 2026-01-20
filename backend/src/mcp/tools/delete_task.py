"""
MCP Tool: delete_task
Permanently deletes a task.
"""
from uuid import UUID
from sqlmodel import Session
from mcp.types import TextContent

from ..types import success_response, not_found_error, validation_error
from ..validators import validate_task_id
from ...services.task_service import TaskService
from ...models.task import Task


async def delete_task(
    session: Session,
    user_id: UUID,
    task_id: str,
) -> list[TextContent]:
    """
    Permanently delete a task from the user's todo list.

    Args:
        session: Database session
        user_id: User's UUID
        task_id: Task UUID string

    Returns:
        List containing TextContent with JSON response:
        - Success: {success: true, data: {task_id, status: "deleted", title}}
        - Error: {success: false, error: {code, message}}
    """
    # Validate task_id
    is_valid, parsed_task_id, error_msg = validate_task_id(task_id)
    if not is_valid:
        error = validation_error(error_msg, field="task_id")
        return [TextContent(type="text", text=error.to_json())]

    # Get task title before deletion (for response message)
    existing_task = session.get(Task, parsed_task_id)
    if existing_task is None or existing_task.user_id != user_id:
        error = not_found_error("Task", task_id)
        return [TextContent(type="text", text=error.to_json())]

    task_title = existing_task.title

    # Delete task via service
    task_service = TaskService(session)
    success = task_service.delete_task(task_id=parsed_task_id, user_id=user_id)

    if not success:
        error = not_found_error("Task", task_id)
        return [TextContent(type="text", text=error.to_json())]

    # Return success response
    response = success_response(
        data={
            "task_id": task_id,
            "status": "deleted",
            "title": task_title,
        },
        message=f"Task '{task_title}' deleted successfully",
    )
    return [TextContent(type="text", text=response.to_json())]
