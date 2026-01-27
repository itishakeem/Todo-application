"""
MCP Tool: update_task
Updates a task's title and/or description.
"""
from uuid import UUID
from sqlmodel import Session
from mcp.types import TextContent

from ..types import success_response, not_found_error, validation_error
from ..validators import validate_task_id, validate_title, validate_description
from ...services.task_service import TaskService


async def update_task(
    session: Session,
    user_id: UUID,
    task_id: str,
    title: str,
    description: str | None = None,
) -> list[TextContent]:
    """
    Update a task's title and/or description.

    Args:
        session: Database session
        user_id: User's UUID
        task_id: Task UUID string
        title: New task title (1-100 characters, required)
        description: New task description (0-500 characters, optional)

    Returns:
        List containing TextContent with JSON response:
        - Success: {success: true, data: {task_id, status: "updated", title}}
        - Error: {success: false, error: {code, message}}
    """
    # Validate task_id
    is_valid, parsed_task_id, error_msg = validate_task_id(task_id)
    if not is_valid:
        error = validation_error(error_msg, field="task_id")
        return [TextContent(type="text", text=error.to_json())]

    # Validate title
    is_valid, error_msg = validate_title(title)
    if not is_valid:
        error = validation_error(error_msg, field="title")
        return [TextContent(type="text", text=error.to_json())]

    # Validate description if provided
    if description is not None:
        is_valid, error_msg = validate_description(description)
        if not is_valid:
            error = validation_error(error_msg, field="description")
            return [TextContent(type="text", text=error.to_json())]

    # Get current task to preserve description if not provided
    task_service = TaskService(session)

    # Check task exists and belongs to user
    from ...models.task import Task
    existing_task = session.get(Task, parsed_task_id)
    if existing_task is None or existing_task.user_id != user_id:
        error = not_found_error("Task", task_id)
        return [TextContent(type="text", text=error.to_json())]

    # Use existing description if not provided
    new_description = description if description is not None else existing_task.description

    # Update task via service
    task = task_service.update_task(
        task_id=parsed_task_id,
        user_id=user_id,
        title=title.strip(),
        description=new_description.strip() if new_description else "",
    )

    if task is None:
        error = not_found_error("Task", task_id)
        return [TextContent(type="text", text=error.to_json())]

    # Return success response
    response = success_response(
        data={
            "task_id": str(task.id),
            "status": "updated",
            "title": task.title,
        },
        message=f"Task '{task.title}' updated successfully",
    )
    return [TextContent(type="text", text=response.to_json())]
