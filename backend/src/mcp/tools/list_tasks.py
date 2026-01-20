"""
MCP Tool: list_tasks
Lists user's tasks with optional filtering.
"""
from uuid import UUID
from sqlmodel import Session
from mcp.types import TextContent

from ..types import success_response, validation_error
from ..validators import validate_filter
from ...services.task_service import TaskService


async def list_tasks(
    session: Session,
    user_id: UUID,
    filter: str = "all",
) -> list[TextContent]:
    """
    List tasks for the user with optional status filtering.

    Args:
        session: Database session
        user_id: User's UUID
        filter: Filter by status - "all", "pending", or "completed"

    Returns:
        List containing TextContent with JSON response:
        - Success: {success: true, data: {tasks: [...], count: N}}
        - Error: {success: false, error: {code, message}}
    """
    # Validate filter
    is_valid, normalized_filter, error_msg = validate_filter(filter)
    if not is_valid:
        error = validation_error(error_msg, field="filter")
        return [TextContent(type="text", text=error.to_json())]

    # Map filter values to service filter
    filter_status = None
    if normalized_filter == "pending":
        filter_status = "active"  # TaskService uses "active" for pending
    elif normalized_filter == "completed":
        filter_status = "completed"
    # "all" = None (no filter)

    # Get tasks via service
    task_service = TaskService(session)
    tasks = task_service.get_all_tasks(user_id=user_id, filter_status=filter_status)

    # Format task data for response
    task_list = [
        {
            "id": str(task.id)[:8],  # 8-char prefix for display
            "full_id": str(task.id),
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None,
        }
        for task in tasks
    ]

    # Return success response
    response = success_response(
        data={
            "tasks": task_list,
            "count": len(task_list),
            "filter": normalized_filter,
        },
    )
    return [TextContent(type="text", text=response.to_json())]
