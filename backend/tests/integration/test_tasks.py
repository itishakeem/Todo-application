"""
Integration tests for tasks API endpoints
T041: Add integration test for GET /api/tasks
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from uuid import UUID
from src.main import app
from src.db.connection import get_session
from src.models.task import Task
from src.models.user import User


# Create in-memory test database
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


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create test client with overridden database session."""

    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def test_get_tasks_empty_list(client: TestClient):
    """T041: GET /api/tasks returns empty list when no tasks exist"""
    response = client.get("/api/tasks")
    assert response.status_code == 200
    data = response.json()
    assert "tasks" in data
    assert data["tasks"] == []


def test_get_tasks_with_data(client: TestClient, session: Session):
    """T041: GET /api/tasks returns list of tasks"""
    # Create test user
    user_id = UUID("12345678-1234-1234-1234-123456789012")

    # Create test tasks
    task1 = Task(
        user_id=user_id,
        title="Test Task 1",
        description="Description 1",
        status="pending",
    )
    task2 = Task(
        user_id=user_id,
        title="Test Task 2",
        description="Description 2",
        status="completed",
    )

    session.add(task1)
    session.add(task2)
    session.commit()

    # Get all tasks
    response = client.get("/api/tasks")
    assert response.status_code == 200
    data = response.json()
    assert "tasks" in data
    assert len(data["tasks"]) == 2

    # Verify task data
    tasks = data["tasks"]
    assert any(t["title"] == "Test Task 1" for t in tasks)
    assert any(t["title"] == "Test Task 2" for t in tasks)


def test_get_tasks_filter_active(client: TestClient, session: Session):
    """T041: GET /api/tasks?filter=active returns only pending tasks"""
    user_id = UUID("12345678-1234-1234-1234-123456789012")

    # Create mixed status tasks
    task1 = Task(user_id=user_id, title="Pending Task", status="pending")
    task2 = Task(user_id=user_id, title="Completed Task", status="completed")

    session.add(task1)
    session.add(task2)
    session.commit()

    # Get only active (pending) tasks
    response = client.get("/api/tasks?filter=active")
    assert response.status_code == 200
    data = response.json()

    tasks = data["tasks"]
    assert len(tasks) == 1
    assert tasks[0]["title"] == "Pending Task"
    assert tasks[0]["status"] == "pending"


def test_get_tasks_filter_completed(client: TestClient, session: Session):
    """T041: GET /api/tasks?filter=completed returns only completed tasks"""
    user_id = UUID("12345678-1234-1234-1234-123456789012")

    # Create mixed status tasks
    task1 = Task(user_id=user_id, title="Pending Task", status="pending")
    task2 = Task(user_id=user_id, title="Completed Task", status="completed")

    session.add(task1)
    session.add(task2)
    session.commit()

    # Get only completed tasks
    response = client.get("/api/tasks?filter=completed")
    assert response.status_code == 200
    data = response.json()

    tasks = data["tasks"]
    assert len(tasks) == 1
    assert tasks[0]["title"] == "Completed Task"
    assert tasks[0]["status"] == "completed"


def test_get_tasks_invalid_filter(client: TestClient):
    """T041: GET /api/tasks with invalid filter returns 422"""
    response = client.get("/api/tasks?filter=invalid")
    assert response.status_code == 422  # Validation error


# T059-T062: POST /api/tasks integration tests
def test_create_task_with_valid_data(client: TestClient, session: Session):
    """T059: POST /api/tasks creates task with valid title and description"""
    task_data = {"title": "New Task", "description": "Task description"}

    response = client.post("/api/tasks", json=task_data)
    assert response.status_code == 201

    data = response.json()
    assert data["title"] == "New Task"
    assert data["description"] == "Task description"
    assert data["status"] == "pending"
    assert "id" in data
    assert "created_at" in data
    assert data["completed_at"] is None
    assert data["updated_at"] is None


def test_create_task_with_title_only(client: TestClient, session: Session):
    """T060: POST /api/tasks creates task with only title (description optional)"""
    task_data = {"title": "Title Only Task"}

    response = client.post("/api/tasks", json=task_data)
    assert response.status_code == 201

    data = response.json()
    assert data["title"] == "Title Only Task"
    assert data["description"] == ""  # Default empty string
    assert data["status"] == "pending"


def test_create_task_validation_empty_title(client: TestClient):
    """T061: POST /api/tasks with empty title returns 422"""
    task_data = {"title": "", "description": "Some description"}

    response = client.post("/api/tasks", json=task_data)
    assert response.status_code == 422  # Validation error


def test_create_task_validation_title_too_long(client: TestClient):
    """T061: POST /api/tasks with title >100 chars returns 422"""
    task_data = {"title": "A" * 101, "description": "Description"}

    response = client.post("/api/tasks", json=task_data)
    assert response.status_code == 422  # Validation error


def test_create_task_validation_description_too_long(client: TestClient):
    """T061: POST /api/tasks with description >500 chars returns 422"""
    task_data = {"title": "Valid Title", "description": "B" * 501}

    response = client.post("/api/tasks", json=task_data)
    assert response.status_code == 422  # Validation error


def test_create_task_persists_to_database(client: TestClient, session: Session):
    """T062: Created task persists to database and appears in GET /api/tasks"""
    task_data = {"title": "Persistent Task", "description": "Should persist"}

    # Create task
    create_response = client.post("/api/tasks", json=task_data)
    assert create_response.status_code == 201
    created_task = create_response.json()

    # Verify it appears in GET request
    get_response = client.get("/api/tasks")
    assert get_response.status_code == 200
    tasks = get_response.json()["tasks"]

    assert len(tasks) == 1
    assert tasks[0]["id"] == created_task["id"]
    assert tasks[0]["title"] == "Persistent Task"
    assert tasks[0]["description"] == "Should persist"


# T091-T094: PATCH /api/tasks/{id}/complete integration tests
def test_toggle_task_completion_pending_to_completed(
    client: TestClient, session: Session
):
    """T091: PATCH /api/tasks/{id}/complete toggles pending task to completed"""
    user_id = UUID("12345678-1234-1234-1234-123456789012")

    # Create pending task
    task = Task(user_id=user_id, title="Pending Task", status="pending")
    session.add(task)
    session.commit()
    session.refresh(task)

    # Toggle to completed
    response = client.patch(f"/api/tasks/{task.id}/complete")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "completed"
    assert data["completed_at"] is not None
    assert data["title"] == "Pending Task"


def test_toggle_task_completion_completed_to_pending(
    client: TestClient, session: Session
):
    """T092: PATCH /api/tasks/{id}/complete toggles completed task to pending"""
    user_id = UUID("12345678-1234-1234-1234-123456789012")

    # Create completed task
    task = Task(user_id=user_id, title="Completed Task", status="completed")
    session.add(task)
    session.commit()
    session.refresh(task)

    # Toggle to pending
    response = client.patch(f"/api/tasks/{task.id}/complete")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "pending"
    assert data["completed_at"] is None


def test_toggle_completion_sets_timestamp(client: TestClient, session: Session):
    """T093: Toggling to completed sets completed_at timestamp"""
    user_id = UUID("12345678-1234-1234-1234-123456789012")

    # Create pending task
    task = Task(user_id=user_id, title="Test Task", status="pending")
    session.add(task)
    session.commit()
    session.refresh(task)

    # Toggle to completed
    response = client.patch(f"/api/tasks/{task.id}/complete")
    assert response.status_code == 200

    data = response.json()
    assert data["completed_at"] is not None

    # Verify timestamp format
    from datetime import datetime

    completed_at = datetime.fromisoformat(data["completed_at"].replace("Z", "+00:00"))
    assert completed_at is not None


def test_toggle_completion_invalid_task_id(client: TestClient):
    """T094: PATCH with invalid task ID returns 404"""
    fake_uuid = "12345678-1234-1234-1234-999999999999"
    response = client.patch(f"/api/tasks/{fake_uuid}/complete")
    assert response.status_code == 404


# T110-T113: PUT /api/tasks/{id} integration tests
def test_update_task_with_valid_data(client: TestClient, session: Session):
    """T110: PUT /api/tasks/{id} updates task title and description"""
    user_id = UUID("12345678-1234-1234-1234-123456789012")

    # Create task
    task = Task(
        user_id=user_id,
        title="Original Title",
        description="Original Description",
        status="pending",
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    # Update task
    update_data = {"title": "Updated Title", "description": "Updated Description"}
    response = client.put(f"/api/tasks/{task.id}", json=update_data)
    assert response.status_code == 200

    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["description"] == "Updated Description"
    assert data["updated_at"] is not None


def test_update_task_validation_empty_title(client: TestClient, session: Session):
    """T112: PUT with empty title returns 422"""
    user_id = UUID("12345678-1234-1234-1234-123456789012")

    # Create task
    task = Task(user_id=user_id, title="Original Title", status="pending")
    session.add(task)
    session.commit()
    session.refresh(task)

    # Try to update with empty title
    update_data = {"title": "", "description": "Description"}
    response = client.put(f"/api/tasks/{task.id}", json=update_data)
    assert response.status_code == 422


def test_update_task_validation_title_too_long(client: TestClient, session: Session):
    """T112: PUT with title >100 chars returns 422"""
    user_id = UUID("12345678-1234-1234-1234-123456789012")

    # Create task
    task = Task(user_id=user_id, title="Original Title", status="pending")
    session.add(task)
    session.commit()
    session.refresh(task)

    # Try to update with title too long
    update_data = {"title": "A" * 101, "description": "Description"}
    response = client.put(f"/api/tasks/{task.id}", json=update_data)
    assert response.status_code == 422


def test_update_task_not_found(client: TestClient):
    """T113: PUT with invalid task ID returns 404"""
    fake_uuid = "12345678-1234-1234-1234-999999999999"
    update_data = {"title": "Updated Title", "description": "Description"}
    response = client.put(f"/api/tasks/{fake_uuid}", json=update_data)
    assert response.status_code == 404


# T128-T130: DELETE /api/tasks/{id} integration tests
def test_delete_task_success(client: TestClient, session: Session):
    """T128: DELETE /api/tasks/{id} successfully deletes task"""
    user_id = UUID("12345678-1234-1234-1234-123456789012")

    # Create task
    task = Task(user_id=user_id, title="Task to Delete", status="pending")
    session.add(task)
    session.commit()
    session.refresh(task)

    # Delete task
    response = client.delete(f"/api/tasks/{task.id}")
    assert response.status_code == 204

    # Verify task no longer exists
    get_response = client.get("/api/tasks")
    tasks = get_response.json()["tasks"]
    assert len(tasks) == 0


def test_delete_task_not_found(client: TestClient):
    """T130: DELETE with invalid task ID returns 404"""
    fake_uuid = "12345678-1234-1234-1234-999999999999"
    response = client.delete(f"/api/tasks/{fake_uuid}")
    assert response.status_code == 404
