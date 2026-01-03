"""
TaskService base class for business logic.
T024: Implement TaskService base class
Handles CRUD operations for tasks with database session management.
"""
from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from ..models.task import Task
from datetime import datetime


class TaskService:
    """
    Service layer for task operations.
    Preserves Phase I business logic with database persistence.
    """

    def __init__(self, session: Session):
        self.session = session

    def get_all_tasks(
        self, user_id: UUID, filter_status: Optional[str] = None
    ) -> List[Task]:
        """
        Get all tasks for a user, optionally filtered by status.
        Preserves Phase I filtering logic: all, active, completed.
        """
        statement = select(Task).where(Task.user_id == user_id)

        if filter_status == "active":
            statement = statement.where(Task.status == "pending")
        elif filter_status == "completed":
            statement = statement.where(Task.status == "completed")

        # Order by created_at descending (newest first)
        statement = statement.order_by(Task.created_at.desc())

        tasks = self.session.exec(statement).all()
        return list(tasks)

    def create_task(self, user_id: UUID, title: str, description: str = "") -> Task:
        """
        Create a new task.
        Preserves Phase I validation: title 1-100 chars, description 0-500 chars.
        """
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            status="pending",
        )
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def toggle_completion(self, task_id: UUID, user_id: UUID) -> Optional[Task]:
        """
        Toggle task completion status.
        Sets completed_at timestamp when marking complete.
        """
        task = self.session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return None

        if task.status == "pending":
            task.status = "completed"
            task.completed_at = datetime.utcnow()
        else:
            task.status = "pending"
            task.completed_at = None

        task.updated_at = datetime.utcnow()
        self.session.commit()
        self.session.refresh(task)
        return task

    def update_task(
        self, task_id: UUID, user_id: UUID, title: str, description: str
    ) -> Optional[Task]:
        """
        Update task title and description.
        Preserves Phase I validation rules.
        """
        task = self.session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return None

        task.title = title
        task.description = description
        task.updated_at = datetime.utcnow()
        self.session.commit()
        self.session.refresh(task)
        return task

    def delete_task(self, task_id: UUID, user_id: UUID) -> bool:
        """
        Delete a task.
        Returns True if deleted, False if not found or unauthorized.
        """
        task = self.session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return False

        self.session.delete(task)
        self.session.commit()
        return True
