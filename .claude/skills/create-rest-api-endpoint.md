# Skill: Create REST API Endpoint

**Owner**: Phase II Full-Stack Web Agent
**Phase**: II (Full-Stack Web Application)
**Purpose**: Create a RESTful API endpoint for the FastAPI backend with proper validation, error handling, and OpenAPI documentation

---

## Context

Phase II requires a FastAPI backend with RESTful endpoints for todo CRUD operations. This skill creates a single endpoint following REST best practices, with SQLModel ORM integration, Pydantic validation, and proper HTTP status codes.

## Prerequisites

- [ ] Phase II spec exists at `specs/phase2-fullstack-web/spec.md`
- [ ] Phase II plan exists at `specs/phase2-fullstack-web/plan.md`
- [ ] FastAPI project initialized in `backend/`
- [ ] Database models defined with SQLModel
- [ ] Task ID referenced from tasks.md

## Input Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `endpoint_path` | string | Yes | API endpoint path | "/api/todos" |
| `http_method` | enum | Yes | HTTP method | "GET", "POST", "PATCH", "DELETE" |
| `task_id` | string | Yes | Task ID from tasks.md | "TASK-011" |
| `requires_auth` | bool | No | Endpoint requires authentication | `true` (default) |

## Execution Steps

### Step 1: Define Data Models

**File**: `backend/app/models.py`

```python
from datetime import datetime
from typing import Literal, Optional
from sqlmodel import Field, SQLModel
from pydantic import BaseModel, field_validator


# Database Model (SQLModel)
class Todo(SQLModel, table=True):
    """Todo database model."""
    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)  # From JWT auth
    text: str = Field(max_length=200)
    status: Literal["pending", "completed"] = Field(default="pending")
    priority: Optional[Literal["low", "medium", "high"]] = Field(default="medium")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(default=None)


# Request Models (Pydantic)
class TodoCreate(BaseModel):
    """Request model for creating a todo."""
    text: str
    priority: Optional[Literal["low", "medium", "high"]] = "medium"

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        """Validate todo text."""
        if not v or not v.strip():
            raise ValueError("Todo text required")
        if len(v) > 200:
            raise ValueError("Todo text too long (max 200)")
        return v.strip()


class TodoUpdate(BaseModel):
    """Request model for updating a todo."""
    text: Optional[str] = None
    status: Optional[Literal["pending", "completed"]] = None
    priority: Optional[Literal["low", "medium", "high"]] = None

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: Optional[str]) -> Optional[str]:
        """Validate todo text if provided."""
        if v is not None:
            if not v.strip():
                raise ValueError("Todo text required")
            if len(v) > 200:
                raise ValueError("Todo text too long (max 200)")
            return v.strip()
        return v


# Response Models (Pydantic)
class TodoResponse(BaseModel):
    """Response model for todo operations."""
    id: int
    text: str
    status: Literal["pending", "completed"]
    priority: Literal["low", "medium", "high"]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
```

### Step 2: Implement Endpoint Logic

**File**: `backend/app/routers/todos.py`

```python
from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.auth import get_current_user
from app.models import Todo, TodoCreate, TodoUpdate, TodoResponse


router = APIRouter(prefix="/api/todos", tags=["todos"])


# Dependency for authenticated user
async def get_user_id(current_user: Annotated[dict, Depends(get_current_user)]) -> str:
    """Extract user ID from JWT token."""
    return current_user["sub"]


# GET /api/todos - List all todos for authenticated user
@router.get("/", response_model=list[TodoResponse], status_code=status.HTTP_200_OK)
async def list_todos(
    session: Annotated[Session, Depends(get_session)],
    user_id: Annotated[str, Depends(get_user_id)],
    status_filter: Optional[Literal["pending", "completed"]] = None,
) -> list[Todo]:
    """
    List all todos for the authenticated user.

    Args:
        session: Database session
        user_id: Authenticated user ID from JWT
        status_filter: Optional filter by status

    Returns:
        List of todos sorted by creation date (newest first)

    Example:
        GET /api/todos?status_filter=pending
    """
    query = select(Todo).where(Todo.user_id == user_id)

    if status_filter:
        query = query.where(Todo.status == status_filter)

    query = query.order_by(Todo.created_at.desc())

    todos = session.exec(query).all()
    return todos


# POST /api/todos - Create new todo
@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_data: TodoCreate,
    session: Annotated[Session, Depends(get_session)],
    user_id: Annotated[str, Depends(get_user_id)],
) -> Todo:
    """
    Create a new todo for the authenticated user.

    Args:
        todo_data: Todo creation data
        session: Database session
        user_id: Authenticated user ID from JWT

    Returns:
        Created todo

    Raises:
        HTTPException: 400 if validation fails

    Example:
        POST /api/todos
        {
            "text": "Buy groceries",
            "priority": "high"
        }
    """
    # Create todo (validation happens in TodoCreate model)
    todo = Todo(
        user_id=user_id,
        text=todo_data.text,
        priority=todo_data.priority or "medium",
        status="pending",
    )

    session.add(todo)
    session.commit()
    session.refresh(todo)

    return todo


# PATCH /api/todos/{todo_id} - Update todo
@router.patch("/{todo_id}", response_model=TodoResponse, status_code=status.HTTP_200_OK)
async def update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    session: Annotated[Session, Depends(get_session)],
    user_id: Annotated[str, Depends(get_user_id)],
) -> Todo:
    """
    Update a todo by ID (user can only update their own todos).

    Args:
        todo_id: Todo ID to update
        todo_data: Fields to update
        session: Database session
        user_id: Authenticated user ID from JWT

    Returns:
        Updated todo

    Raises:
        HTTPException: 404 if todo not found or not owned by user

    Example:
        PATCH /api/todos/123
        {
            "status": "completed"
        }
    """
    # Find todo (ensure user owns it)
    todo = session.get(Todo, todo_id)
    if not todo or todo.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    # Update fields (only if provided)
    if todo_data.text is not None:
        todo.text = todo_data.text

    if todo_data.status is not None:
        todo.status = todo_data.status
        if todo_data.status == "completed" and not todo.completed_at:
            todo.completed_at = datetime.utcnow()

    if todo_data.priority is not None:
        todo.priority = todo_data.priority

    todo.updated_at = datetime.utcnow()

    session.add(todo)
    session.commit()
    session.refresh(todo)

    return todo


# DELETE /api/todos/{todo_id} - Delete todo
@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: int,
    session: Annotated[Session, Depends(get_session)],
    user_id: Annotated[str, Depends(get_user_id)],
) -> None:
    """
    Delete a todo by ID (user can only delete their own todos).

    Args:
        todo_id: Todo ID to delete
        session: Database session
        user_id: Authenticated user ID from JWT

    Raises:
        HTTPException: 404 if todo not found or not owned by user

    Example:
        DELETE /api/todos/123
    """
    # Find todo (ensure user owns it)
    todo = session.get(Todo, todo_id)
    if not todo or todo.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    session.delete(todo)
    session.commit()
```

### Step 3: Register Router in Main App

**File**: `backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import todos


app = FastAPI(
    title="Todo API",
    description="RESTful API for todo management",
    version="2.0.0",
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(todos.router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
```

### Step 4: Write API Tests

**File**: `backend/tests/test_todos_api.py`

```python
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from app.main import app
from app.database import get_session
from app.auth import get_current_user
from app.models import Todo


# Test database setup
@pytest.fixture(name="session")
def session_fixture():
    """Create in-memory test database."""
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
    """Create test client with mocked auth."""
    def get_session_override():
        return session

    def get_current_user_override():
        return {"sub": "test-user-123"}

    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_current_user] = get_current_user_override

    client = TestClient(app)
    yield client

    app.dependency_overrides.clear()


def test_create_todo_success(client: TestClient):
    """Test POST /api/todos with valid data."""
    response = client.post(
        "/api/todos",
        json={"text": "Buy groceries", "priority": "high"}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["text"] == "Buy groceries"
    assert data["priority"] == "high"
    assert data["status"] == "pending"
    assert "id" in data


def test_create_todo_empty_text_rejected(client: TestClient):
    """Test POST /api/todos rejects empty text."""
    response = client.post(
        "/api/todos",
        json={"text": ""}
    )

    assert response.status_code == 422  # Validation error


def test_list_todos_empty(client: TestClient):
    """Test GET /api/todos with no todos."""
    response = client.get("/api/todos")

    assert response.status_code == 200
    assert response.json() == []


def test_list_todos_sorted_newest_first(client: TestClient, session: Session):
    """Test GET /api/todos returns newest first."""
    # Create two todos
    todo1 = Todo(user_id="test-user-123", text="First", status="pending")
    todo2 = Todo(user_id="test-user-123", text="Second", status="pending")
    session.add(todo1)
    session.add(todo2)
    session.commit()

    response = client.get("/api/todos")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["text"] == "Second"  # Newest first


def test_list_todos_filter_by_status(client: TestClient, session: Session):
    """Test GET /api/todos?status_filter=completed."""
    # Create mixed todos
    todo1 = Todo(user_id="test-user-123", text="Pending", status="pending")
    todo2 = Todo(user_id="test-user-123", text="Done", status="completed")
    session.add_all([todo1, todo2])
    session.commit()

    response = client.get("/api/todos?status_filter=completed")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["text"] == "Done"


def test_update_todo_success(client: TestClient, session: Session):
    """Test PATCH /api/todos/{id} updates todo."""
    # Create todo
    todo = Todo(user_id="test-user-123", text="Original", status="pending")
    session.add(todo)
    session.commit()
    session.refresh(todo)

    response = client.patch(
        f"/api/todos/{todo.id}",
        json={"status": "completed"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["completed_at"] is not None


def test_update_todo_not_found(client: TestClient):
    """Test PATCH /api/todos/{id} with invalid ID."""
    response = client.patch(
        "/api/todos/9999",
        json={"status": "completed"}
    )

    assert response.status_code == 404


def test_delete_todo_success(client: TestClient, session: Session):
    """Test DELETE /api/todos/{id} removes todo."""
    # Create todo
    todo = Todo(user_id="test-user-123", text="To delete", status="pending")
    session.add(todo)
    session.commit()
    session.refresh(todo)

    response = client.delete(f"/api/todos/{todo.id}")

    assert response.status_code == 204

    # Verify deleted
    assert session.get(Todo, todo.id) is None


def test_delete_todo_not_found(client: TestClient):
    """Test DELETE /api/todos/{id} with invalid ID."""
    response = client.delete("/api/todos/9999")

    assert response.status_code == 404


def test_user_isolation(client: TestClient, session: Session):
    """Test users can only access their own todos."""
    # Create todo for different user
    other_todo = Todo(user_id="other-user-456", text="Other user's todo", status="pending")
    session.add(other_todo)
    session.commit()

    # Current user (test-user-123) should not see it
    response = client.get("/api/todos")

    assert response.status_code == 200
    assert response.json() == []
```

### Step 5: Test OpenAPI Documentation

```bash
# Start server
uvicorn app.main:app --reload

# Visit OpenAPI docs
# http://localhost:8000/docs

# Verify:
# - Endpoint appears in docs
# - Request/response schemas correct
# - Authentication noted
# - Examples provided
```

## Output Artifacts

1. **Models**: `backend/app/models.py` (updated)
2. **Router**: `backend/app/routers/todos.py` (created/updated)
3. **Tests**: `backend/tests/test_todos_api.py` (created/updated)
4. **OpenAPI**: Auto-generated at `/docs`

## Validation Rules

### MUST Pass:
- All test cases pass (pytest)
- OpenAPI docs generate correctly
- Authentication enforced
- User isolation enforced (users only see their todos)
- Proper HTTP status codes (200, 201, 204, 404, 422)
- Pydantic validation on inputs
- Type hints on all functions

### REST Best Practices:
- Use proper HTTP methods (GET, POST, PATCH, DELETE)
- Return correct status codes
- Use plural resource names (/todos not /todo)
- Idempotent operations where appropriate
- Consistent error format

## Example Usage

```bash
# Create endpoint for TASK-011 (Create Todo)
Input:
- endpoint_path: "/api/todos"
- http_method: "POST"
- task_id: "TASK-011"

Agent executes:
1. Creates TodoCreate, TodoResponse models
2. Implements POST /api/todos in router
3. Adds authentication dependency
4. Writes 3 test cases
5. Verifies OpenAPI docs
6. Marks TASK-011 complete
```

## Success Indicators

- ✅ Endpoint accessible via HTTP
- ✅ Authentication enforced
- ✅ Validation working (Pydantic)
- ✅ All tests pass
- ✅ OpenAPI docs complete
- ✅ User isolation enforced
- ✅ Proper status codes returned

## Failure Modes & Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Test fails | Debug endpoint logic, fix, retest |
| Validation not working | Check Pydantic validators |
| Auth not enforced | Add Depends(get_current_user) |
| Wrong status code | Review REST standards, fix |

---

**Last Updated**: 2025-12-30
**Version**: 1.0
**Hackathon**: Todo Spec-Driven Development
