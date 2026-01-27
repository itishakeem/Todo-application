"""TaskStorage class for in-memory task management.

Provides CRUD operations for tasks with dict-based storage.
"""

from datetime import UTC, datetime

from models.task import Task


class TaskStorage:
    """In-memory storage for Task items using dictionary.

    Provides O(1) lookup by UUID and supports partial UUID matching
    (minimum 8 characters). All tasks stored in memory are lost on exit.

    Attributes:
        _tasks: Internal dictionary mapping UUID strings to Task instances
    """

    def __init__(self) -> None:
        """Initialize empty task storage."""
        self._tasks: dict[str, Task] = {}

    def add(self, title: str, description: str = "") -> Task:
        """Create and store a new task.

        Args:
            title: Task title (1-100 characters)
            description: Task description (0-500 characters, optional)

        Returns:
            Created Task instance with generated UUID and pending status

        Raises:
            ValueError: If title is empty or fields exceed length limits

        Example:
            >>> storage = TaskStorage()
            >>> task = storage.add("Buy groceries", "Milk, eggs, bread")
            >>> task.status
            'pending'
        """
        task = Task.create(title, description)
        self._tasks[task.id] = task
        return task

    def get_all(self) -> list[Task]:
        """Retrieve all tasks sorted by creation date (newest first).

        Returns:
            List of all tasks sorted by created_at descending,
            or empty list if no tasks exist

        Example:
            >>> storage = TaskStorage()
            >>> storage.add("Task 1")
            >>> storage.add("Task 2")
            >>> tasks = storage.get_all()
            >>> len(tasks)
            2
        """
        return sorted(
            self._tasks.values(),
            key=lambda task: task.created_at,
            reverse=True,
        )

    def get_by_id(self, task_id: str) -> Task | None:
        """Find task by full or partial UUID.

        Args:
            task_id: Full UUID or first 8+ characters

        Returns:
            Task if found, None if not found

        Raises:
            ValueError: If task_id is less than 8 characters

        Example:
            >>> storage = TaskStorage()
            >>> task = storage.add("Test")
            >>> found = storage.get_by_id(task.id[:8])
            >>> found.id == task.id
            True
        """
        if len(task_id) < 8:
            raise ValueError("Task ID must be at least 8 characters (minimum 8 characters)")

        # Try exact match first (O(1))
        if task_id in self._tasks:
            return self._tasks[task_id]

        # Try partial match (O(n) scan)
        for full_id, task in self._tasks.items():
            if full_id.startswith(task_id):
                return task

        return None

    def mark_complete(self, task_id: str) -> Task:
        """Mark a task as completed.

        Args:
            task_id: Full or partial UUID (minimum 8 characters)

        Returns:
            Updated Task with status="completed" and completed_at timestamp

        Raises:
            KeyError: If task_id not found
            ValueError: If task_id less than 8 characters

        Example:
            >>> storage = TaskStorage()
            >>> task = storage.add("Task")
            >>> completed = storage.mark_complete(task.id)
            >>> completed.status
            'completed'
        """
        task = self.get_by_id(task_id)
        if task is None:
            raise KeyError("Task ID not found")

        # Create updated task with completed status
        updated_task = Task(
            id=task.id,
            title=task.title,
            description=task.description,
            text=task.text,
            status="completed",
            created_at=task.created_at,
            completed_at=datetime.now(UTC),
            updated_at=task.updated_at,
        )

        self._tasks[task.id] = updated_task
        return updated_task

    def update_text(self, task_id: str, new_text: str) -> Task:
        """Update the text of an existing task.

        Args:
            task_id: Full or partial UUID (minimum 8 characters)
            new_text: New task description (1-200 characters)

        Returns:
            Updated Task with new text and refreshed updated_at timestamp

        Raises:
            KeyError: If task_id not found
            ValueError: If new_text is invalid or task_id less than 8 characters

        Example:
            >>> storage = TaskStorage()
            >>> task = storage.add("Old text")
            >>> updated = storage.update_text(task.id, "New text")
            >>> updated.text
            'New text'
        """
        task = self.get_by_id(task_id)
        if task is None:
            raise KeyError("Task ID not found")

        # Create updated task with new text (validation happens in Task.__post_init__)
        updated_task = Task(
            id=task.id,
            title=task.title,
            description=task.description,
            text=new_text,
            status=task.status,
            created_at=task.created_at,
            completed_at=task.completed_at,
            updated_at=datetime.now(UTC),
        )

        self._tasks[task.id] = updated_task
        return updated_task

    def delete(self, task_id: str) -> bool:
        """Delete a task from storage.

        Args:
            task_id: Full or partial UUID (minimum 8 characters)

        Returns:
            True if task was deleted, False if not found

        Example:
            >>> storage = TaskStorage()
            >>> task = storage.add("To delete")
            >>> storage.delete(task.id)
            True
            >>> storage.delete(task.id)
            False
        """
        try:
            task = self.get_by_id(task_id)
            if task is None:
                return False

            del self._tasks[task.id]
            return True
        except ValueError:
            # Invalid ID format (< 8 chars)
            return False
