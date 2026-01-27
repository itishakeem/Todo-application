"""
MCP Tool: add_task
Creates a new task for the user.
"""
from uuid import UUID
from sqlmodel import Session
from mcp.types import TextContent

from ..types import ToolSuccess, ToolError, success_response, validation_error
from ..validators import validate_title, validate_description
from ...services.task_service import TaskService


async def add_task(
    session: Session,
    user_id: UUID,
    title: str,
    description: str = "",
) -> list[TextContent]:
    """
    Add a new task to the user's todo list.

    Args:
        session: Database session
        user_id: User's UUID
        title: Task title (1-100 characters, required)
        description: Task description (0-500 characters, optional)

    Returns:
        List containing TextContent with JSON response:
        - Success: {success: true, data: {task_id, status: "created", title}}
        - Error: {success: false, error: {code, message}}
    """
    # Validate title
    is_valid, error_msg = validate_title(title)
    if not is_valid:
        error = validation_error(error_msg, field="title")
        return [TextContent(type="text", text=error.to_json())]

    # Validate description
    is_valid, error_msg = validate_description(description)
    if not is_valid:
        error = validation_error(error_msg, field="description")
        return [TextContent(type="text", text=error.to_json())]

    # Create task via service
    task_service = TaskService(session)
    task = task_service.create_task(
        user_id=user_id,
        title=title.strip(),
        description=description.strip() if description else "",
    )

    # Return success response
    response = success_response(
        data={
            "task_id": str(task.id),
            "status": "created",
            "title": task.title,
        },
        message=f"Task '{task.title}' created successfully",
    )
    return [TextContent(type="text", text=response.to_json())]
