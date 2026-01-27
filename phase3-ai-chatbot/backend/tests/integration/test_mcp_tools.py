"""
Integration tests for MCP tools.
TASK-015 through TASK-024: TDD tests for all 5 MCP tools.
"""
import pytest
import json
from uuid import UUID
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from src.models.task import Task
from src.mcp.types import ErrorCode

# Configure pytest-asyncio
pytestmark = pytest.mark.asyncio(loop_scope="function")


# Test fixtures
@pytest.fixture(name="session")
def session_fixture():
    """Create a fresh database session for each test."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="user_id")
def user_id_fixture():
    """Provide a test user ID."""
    return UUID("12345678-1234-1234-1234-123456789012")


@pytest.fixture(name="other_user_id")
def other_user_id_fixture():
    """Provide a different user ID for security tests."""
    return UUID("98765432-9876-9876-9876-987654321098")


@pytest.fixture(name="sample_task")
def sample_task_fixture(session: Session, user_id: UUID):
    """Create a sample task for testing."""
    task = Task(
        user_id=user_id,
        title="Sample Task",
        description="Sample description",
        status="pending",
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


# =============================================================================
# TASK-015: add_task tool tests
# =============================================================================

class TestAddTaskTool:
    """Test suite for add_task MCP tool."""

    @pytest.mark.asyncio
    async def test_add_task_success(self, session: Session, user_id: UUID):
        """Test adding a task with valid data returns task_id."""
        from src.mcp.tools.add_task import add_task

        result = await add_task(
            session=session,
            user_id=user_id,
            title="Buy groceries",
            description="Milk, bread, eggs",
        )

        # Parse result
        data = json.loads(result[0].text)
        assert data["success"] is True
        assert "task_id" in data["data"]
        assert data["data"]["status"] == "created"
        assert data["data"]["title"] == "Buy groceries"

    @pytest.mark.asyncio
    async def test_add_task_title_only(self, session: Session, user_id: UUID):
        """Test adding a task with only title (description optional)."""
        from src.mcp.tools.add_task import add_task

        result = await add_task(
            session=session,
            user_id=user_id,
            title="Simple task",
        )

        data = json.loads(result[0].text)
        assert data["success"] is True
        assert data["data"]["title"] == "Simple task"

    @pytest.mark.asyncio
    async def test_add_task_title_too_long(self, session: Session, user_id: UUID):
        """Test adding a task with title >100 chars returns VALIDATION_ERROR."""
        from src.mcp.tools.add_task import add_task

        long_title = "A" * 101
        result = await add_task(
            session=session,
            user_id=user_id,
            title=long_title,
        )

        data = json.loads(result[0].text)
        assert data["success"] is False
        assert data["error"]["code"] == ErrorCode.VALIDATION_ERROR.value

    @pytest.mark.asyncio
    async def test_add_task_empty_title(self, session: Session, user_id: UUID):
        """Test adding a task with empty title returns VALIDATION_ERROR."""
        from src.mcp.tools.add_task import add_task

        result = await add_task(
            session=session,
            user_id=user_id,
            title="",
        )

        data = json.loads(result[0].text)
        assert data["success"] is False
        assert data["error"]["code"] == ErrorCode.VALIDATION_ERROR.value

    @pytest.mark.asyncio
    async def test_add_task_description_too_long(self, session: Session, user_id: UUID):
        """Test adding a task with description >500 chars returns VALIDATION_ERROR."""
        from src.mcp.tools.add_task import add_task

        long_desc = "B" * 501
        result = await add_task(
            session=session,
            user_id=user_id,
            title="Valid title",
            description=long_desc,
        )

        data = json.loads(result[0].text)
        assert data["success"] is False
        assert data["error"]["code"] == ErrorCode.VALIDATION_ERROR.value


# =============================================================================
# TASK-017: list_tasks tool tests
# =============================================================================

class TestListTasksTool:
    """Test suite for list_tasks MCP tool."""

    @pytest.mark.asyncio
    async def test_list_tasks_all(self, session: Session, user_id: UUID):
        """Test listing all tasks returns all user's tasks."""
        from src.mcp.tools.list_tasks import list_tasks

        # Create test tasks
        task1 = Task(user_id=user_id, title="Task 1", status="pending")
        task2 = Task(user_id=user_id, title="Task 2", status="completed")
        session.add(task1)
        session.add(task2)
        session.commit()

        result = await list_tasks(
            session=session,
            user_id=user_id,
            filter="all",
        )

        data = json.loads(result[0].text)
        assert data["success"] is True
        assert data["data"]["count"] == 2
        assert len(data["data"]["tasks"]) == 2

    @pytest.mark.asyncio
    async def test_list_tasks_pending(self, session: Session, user_id: UUID):
        """Test listing pending tasks returns only pending."""
        from src.mcp.tools.list_tasks import list_tasks

        # Create test tasks
        task1 = Task(user_id=user_id, title="Pending Task", status="pending")
        task2 = Task(user_id=user_id, title="Completed Task", status="completed")
        session.add(task1)
        session.add(task2)
        session.commit()

        result = await list_tasks(
            session=session,
            user_id=user_id,
            filter="pending",
        )

        data = json.loads(result[0].text)
        assert data["success"] is True
        assert data["data"]["count"] == 1
        assert data["data"]["tasks"][0]["title"] == "Pending Task"

    @pytest.mark.asyncio
    async def test_list_tasks_completed(self, session: Session, user_id: UUID):
        """Test listing completed tasks returns only completed."""
        from src.mcp.tools.list_tasks import list_tasks

        # Create test tasks
        task1 = Task(user_id=user_id, title="Pending Task", status="pending")
        task2 = Task(user_id=user_id, title="Completed Task", status="completed")
        session.add(task1)
        session.add(task2)
        session.commit()

        result = await list_tasks(
            session=session,
            user_id=user_id,
            filter="completed",
        )

        data = json.loads(result[0].text)
        assert data["success"] is True
        assert data["data"]["count"] == 1
        assert data["data"]["tasks"][0]["title"] == "Completed Task"

    @pytest.mark.asyncio
    async def test_list_tasks_empty(self, session: Session, user_id: UUID):
        """Test listing tasks when user has none returns empty array."""
        from src.mcp.tools.list_tasks import list_tasks

        result = await list_tasks(
            session=session,
            user_id=user_id,
            filter="all",
        )

        data = json.loads(result[0].text)
        assert data["success"] is True
        assert data["data"]["count"] == 0
        assert data["data"]["tasks"] == []

    @pytest.mark.asyncio
    async def test_list_tasks_user_isolation(
        self, session: Session, user_id: UUID, other_user_id: UUID
    ):
        """Test that users can only see their own tasks."""
        from src.mcp.tools.list_tasks import list_tasks

        # Create tasks for both users
        task1 = Task(user_id=user_id, title="My Task", status="pending")
        task2 = Task(user_id=other_user_id, title="Other Task", status="pending")
        session.add(task1)
        session.add(task2)
        session.commit()

        result = await list_tasks(
            session=session,
            user_id=user_id,
            filter="all",
        )

        data = json.loads(result[0].text)
        assert data["data"]["count"] == 1
        assert data["data"]["tasks"][0]["title"] == "My Task"


# =============================================================================
# TASK-019: complete_task tool tests
# =============================================================================

class TestCompleteTaskTool:
    """Test suite for complete_task MCP tool."""

    @pytest.mark.asyncio
    async def test_complete_task_success(
        self, session: Session, user_id: UUID, sample_task: Task
    ):
        """Test marking a pending task as completed."""
        from src.mcp.tools.complete_task import complete_task

        result = await complete_task(
            session=session,
            user_id=user_id,
            task_id=str(sample_task.id),
        )

        data = json.loads(result[0].text)
        assert data["success"] is True
        assert data["data"]["status"] == "completed"

    @pytest.mark.asyncio
    async def test_uncomplete_task(self, session: Session, user_id: UUID):
        """Test reverting a completed task to pending."""
        from src.mcp.tools.complete_task import complete_task

        # Create completed task
        task = Task(user_id=user_id, title="Done Task", status="completed")
        session.add(task)
        session.commit()
        session.refresh(task)

        result = await complete_task(
            session=session,
            user_id=user_id,
            task_id=str(task.id),
        )

        data = json.loads(result[0].text)
        assert data["success"] is True
        assert data["data"]["status"] == "pending"

    @pytest.mark.asyncio
    async def test_complete_task_not_found(self, session: Session, user_id: UUID):
        """Test completing a non-existent task returns NOT_FOUND."""
        from src.mcp.tools.complete_task import complete_task

        fake_id = "12345678-1234-1234-1234-999999999999"
        result = await complete_task(
            session=session,
            user_id=user_id,
            task_id=fake_id,
        )

        data = json.loads(result[0].text)
        assert data["success"] is False
        assert data["error"]["code"] == ErrorCode.NOT_FOUND.value

    @pytest.mark.asyncio
    async def test_complete_task_wrong_user(
        self, session: Session, user_id: UUID, other_user_id: UUID, sample_task: Task
    ):
        """Test completing another user's task returns NOT_FOUND (security)."""
        from src.mcp.tools.complete_task import complete_task

        result = await complete_task(
            session=session,
            user_id=other_user_id,  # Wrong user
            task_id=str(sample_task.id),
        )

        data = json.loads(result[0].text)
        assert data["success"] is False
        assert data["error"]["code"] == ErrorCode.NOT_FOUND.value


# =============================================================================
# TASK-021: update_task tool tests
# =============================================================================

class TestUpdateTaskTool:
    """Test suite for update_task MCP tool."""

    @pytest.mark.asyncio
    async def test_update_task_title(
        self, session: Session, user_id: UUID, sample_task: Task
    ):
        """Test updating task title."""
        from src.mcp.tools.update_task import update_task

        result = await update_task(
            session=session,
            user_id=user_id,
            task_id=str(sample_task.id),
            title="Updated Title",
        )

        data = json.loads(result[0].text)
        assert data["success"] is True
        assert data["data"]["title"] == "Updated Title"
        assert data["data"]["status"] == "updated"

    @pytest.mark.asyncio
    async def test_update_task_description(
        self, session: Session, user_id: UUID, sample_task: Task
    ):
        """Test updating task description."""
        from src.mcp.tools.update_task import update_task

        result = await update_task(
            session=session,
            user_id=user_id,
            task_id=str(sample_task.id),
            title=sample_task.title,
            description="New description",
        )

        data = json.loads(result[0].text)
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_update_task_both(
        self, session: Session, user_id: UUID, sample_task: Task
    ):
        """Test updating both title and description."""
        from src.mcp.tools.update_task import update_task

        result = await update_task(
            session=session,
            user_id=user_id,
            task_id=str(sample_task.id),
            title="New Title",
            description="New Description",
        )

        data = json.loads(result[0].text)
        assert data["success"] is True
        assert data["data"]["title"] == "New Title"

    @pytest.mark.asyncio
    async def test_update_task_not_found(self, session: Session, user_id: UUID):
        """Test updating a non-existent task returns NOT_FOUND."""
        from src.mcp.tools.update_task import update_task

        fake_id = "12345678-1234-1234-1234-999999999999"
        result = await update_task(
            session=session,
            user_id=user_id,
            task_id=fake_id,
            title="New Title",
        )

        data = json.loads(result[0].text)
        assert data["success"] is False
        assert data["error"]["code"] == ErrorCode.NOT_FOUND.value

    @pytest.mark.asyncio
    async def test_update_task_title_too_long(
        self, session: Session, user_id: UUID, sample_task: Task
    ):
        """Test updating with title >100 chars returns VALIDATION_ERROR."""
        from src.mcp.tools.update_task import update_task

        long_title = "A" * 101
        result = await update_task(
            session=session,
            user_id=user_id,
            task_id=str(sample_task.id),
            title=long_title,
        )

        data = json.loads(result[0].text)
        assert data["success"] is False
        assert data["error"]["code"] == ErrorCode.VALIDATION_ERROR.value

    @pytest.mark.asyncio
    async def test_update_task_wrong_user(
        self, session: Session, user_id: UUID, other_user_id: UUID, sample_task: Task
    ):
        """Test updating another user's task returns NOT_FOUND."""
        from src.mcp.tools.update_task import update_task

        result = await update_task(
            session=session,
            user_id=other_user_id,
            task_id=str(sample_task.id),
            title="Hacked Title",
        )

        data = json.loads(result[0].text)
        assert data["success"] is False
        assert data["error"]["code"] == ErrorCode.NOT_FOUND.value


# =============================================================================
# TASK-023: delete_task tool tests
# =============================================================================

class TestDeleteTaskTool:
    """Test suite for delete_task MCP tool."""

    @pytest.mark.asyncio
    async def test_delete_task_success(
        self, session: Session, user_id: UUID, sample_task: Task
    ):
        """Test deleting a task successfully."""
        from src.mcp.tools.delete_task import delete_task

        task_id = str(sample_task.id)
        result = await delete_task(
            session=session,
            user_id=user_id,
            task_id=task_id,
        )

        data = json.loads(result[0].text)
        assert data["success"] is True
        assert data["data"]["status"] == "deleted"

        # Verify task is actually deleted
        deleted_task = session.get(Task, sample_task.id)
        assert deleted_task is None

    @pytest.mark.asyncio
    async def test_delete_task_not_found(self, session: Session, user_id: UUID):
        """Test deleting a non-existent task returns NOT_FOUND."""
        from src.mcp.tools.delete_task import delete_task

        fake_id = "12345678-1234-1234-1234-999999999999"
        result = await delete_task(
            session=session,
            user_id=user_id,
            task_id=fake_id,
        )

        data = json.loads(result[0].text)
        assert data["success"] is False
        assert data["error"]["code"] == ErrorCode.NOT_FOUND.value

    @pytest.mark.asyncio
    async def test_delete_task_wrong_user(
        self, session: Session, user_id: UUID, other_user_id: UUID, sample_task: Task
    ):
        """Test deleting another user's task returns NOT_FOUND (security)."""
        from src.mcp.tools.delete_task import delete_task

        result = await delete_task(
            session=session,
            user_id=other_user_id,
            task_id=str(sample_task.id),
        )

        data = json.loads(result[0].text)
        assert data["success"] is False
        assert data["error"]["code"] == ErrorCode.NOT_FOUND.value

        # Verify task still exists
        task = session.get(Task, sample_task.id)
        assert task is not None
