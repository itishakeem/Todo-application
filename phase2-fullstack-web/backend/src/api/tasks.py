"""
Task API endpoints.
T039: Implement GET /api/tasks endpoint with filter param
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlmodel import Session
from typing import List, Optional
from uuid import UUID
from ..db.connection import get_session
from ..services.task_service import TaskService
from ..models.task import Task
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


# Request/Response Models
class TaskCreate(BaseModel):
    """Request model for creating a task."""

    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)


class TaskUpdate(BaseModel):
    """Request model for updating a task."""

    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)


class TaskResponse(BaseModel):
    """Response model for a single task."""

    id: str
    title: str
    description: str
    status: str
    created_at: str
    completed_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Response model for task list."""

    tasks: List[TaskResponse]


# Dependency to get current user ID from header
async def get_current_user_id(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
) -> UUID:
    """
    Get current user ID from X-User-Id header.
    Phase 2: Simple header-based auth (will be replaced with proper sessions in Phase 3)
    """
    if not x_user_id:
        raise HTTPException(
            status_code=401,
            detail="User ID required. Please login first."
        )

    try:
        return UUID(x_user_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID format"
        )


# T039: GET /api/tasks endpoint with filter param
@router.get("", response_model=TaskListResponse)
async def get_tasks(
    filter: Optional[str] = Query(default="all", regex="^(all|active|completed)$"),
    session: Session = Depends(get_session),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Get all tasks for the current user with optional filter.

    Query Parameters:
    - filter: "all" (default), "active", or "completed"

    Returns:
    - 200: List of tasks (sorted by created_at DESC)
    - 401: Unauthorized (if not logged in)
    - 500: Server error
    """
    try:
        service = TaskService(session)
        filter_status = None if filter == "all" else filter
        tasks = service.get_all_tasks(user_id, filter_status)

        # Convert Task objects to TaskResponse format
        task_responses = [
            TaskResponse(
                id=str(task.id),
                title=task.title,
                description=task.description or "",
                status=task.status,
                created_at=task.created_at.isoformat() if task.created_at else "",
                completed_at=(
                    task.completed_at.isoformat() if task.completed_at else None
                ),
                updated_at=task.updated_at.isoformat() if task.updated_at else None,
            )
            for task in tasks
        ]

        return TaskListResponse(tasks=task_responses)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    task_data: TaskCreate,
    session: Session = Depends(get_session),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Create a new task.

    Returns:
    - 201: Task created successfully
    - 400: Validation error
    - 401: Unauthorized
    """
    try:
        service = TaskService(session)
        task = service.create_task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
        )

        return TaskResponse(
            id=str(task.id),
            title=task.title,
            description=task.description or "",
            status=task.status,
            created_at=task.created_at.isoformat() if task.created_at else "",
            completed_at=task.completed_at.isoformat() if task.completed_at else None,
            updated_at=task.updated_at.isoformat() if task.updated_at else None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    session: Session = Depends(get_session),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Update a task's title and description.

    Returns:
    - 200: Task updated successfully
    - 404: Task not found or not owned by user
    - 400: Validation error
    - 401: Unauthorized
    """
    try:
        task_uuid = UUID(task_id)
        service = TaskService(session)
        task = service.update_task(
            task_id=task_uuid,
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
        )

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        return TaskResponse(
            id=str(task.id),
            title=task.title,
            description=task.description or "",
            status=task.status,
            created_at=task.created_at.isoformat() if task.created_at else "",
            completed_at=task.completed_at.isoformat() if task.completed_at else None,
            updated_at=task.updated_at.isoformat() if task.updated_at else None,
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid task ID format")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_completion(
    task_id: str,
    session: Session = Depends(get_session),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Toggle task completion status.

    Returns:
    - 200: Task status toggled successfully
    - 404: Task not found or not owned by user
    - 401: Unauthorized
    """
    try:
        task_uuid = UUID(task_id)
        service = TaskService(session)
        task = service.toggle_completion(task_uuid, user_id)

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        return TaskResponse(
            id=str(task.id),
            title=task.title,
            description=task.description or "",
            status=task.status,
            created_at=task.created_at.isoformat() if task.created_at else "",
            completed_at=task.completed_at.isoformat() if task.completed_at else None,
            updated_at=task.updated_at.isoformat() if task.updated_at else None,
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid task ID format")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: str,
    session: Session = Depends(get_session),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Delete a task.

    Returns:
    - 204: Task deleted successfully (no content)
    - 404: Task not found or not owned by user
    - 401: Unauthorized
    """
    try:
        task_uuid = UUID(task_id)
        service = TaskService(session)
        deleted = service.delete_task(task_uuid, user_id)

        if not deleted:
            raise HTTPException(status_code=404, detail="Task not found")

        return None
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid task ID format")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
