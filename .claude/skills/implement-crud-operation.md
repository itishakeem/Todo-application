# Skill: Implement CRUD Operation

**Owner**: Phase I Console App Agent
**Phase**: I (Console Application)
**Purpose**: Implement a specific CRUD operation for the Python console Todo application

---

## Context

Phase I requires four core CRUD operations: Create (Add), Read (List), Update (Complete), and Delete. This skill implements one operation following the approved spec and plan, with proper error handling, type hints, and tests.

## Prerequisites

- [ ] Phase I spec exists at `specs/phase1-console-app/spec.md`
- [ ] Phase I plan exists at `specs/phase1-console-app/plan.md`
- [ ] Phase I tasks exist at `specs/phase1-console-app/tasks.md`
- [ ] Task ID is referenced (e.g., `TASK-001`)
- [ ] Base project structure exists (`src/models.py`, `src/storage.py`, etc.)

## Input Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `operation_type` | enum | Yes | CRUD operation to implement | "create", "read", "update", "delete" |
| `task_id` | string | Yes | Task ID from tasks.md | "TASK-003" |
| `spec_reference` | string | Yes | User story or requirement reference | "US-1", "FR-2" |

## Execution Steps

### Step 1: Load Task Context

Read `specs/phase1-console-app/tasks.md` and locate the task:

```markdown
# Example Task
**TASK-003**: Implement Add Todo Operation
**Ref**: US-1, FR-1, FR-4.1
**Description**: Create add_todo() function in storage.py
**Test Cases**:
- TC-003-1: Add valid todo succeeds
- TC-003-2: Empty text rejected
- TC-003-3: Text > 200 chars rejected
```

### Step 2: Implement Operation

Based on `operation_type`, implement the corresponding function:

#### CREATE (Add Todo)

**File**: `src/storage.py`

```python
from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal, Optional
from uuid import uuid4


@dataclass
class Todo:
    """Represents a single todo item."""
    id: str
    text: str
    status: Literal["pending", "completed"]
    created_at: datetime
    completed_at: Optional[datetime] = None


class TodoStorage:
    """In-memory storage for todos."""

    def __init__(self) -> None:
        """Initialize empty todo storage."""
        self._todos: dict[str, Todo] = {}

    def add_todo(self, text: str) -> Todo:
        """
        Add a new todo item.

        Args:
            text: Todo description (1-200 characters)

        Returns:
            Created Todo instance

        Raises:
            ValueError: If text is empty or exceeds 200 characters

        Example:
            >>> storage = TodoStorage()
            >>> todo = storage.add_todo("Buy groceries")
            >>> print(todo.text)
            Buy groceries
        """
        # Validate input (FR-2, NFR-3)
        if not text or not text.strip():
            raise ValueError("Todo text required")

        if len(text) > 200:
            raise ValueError("Todo text too long (max 200)")

        # Create todo (FR-1)
        todo = Todo(
            id=str(uuid4()),
            text=text.strip(),
            status="pending",
            created_at=datetime.now(),
        )

        # Store (FR-2)
        self._todos[todo.id] = todo

        return todo
```

#### READ (List Todos)

**File**: `src/storage.py`

```python
    def list_todos(self) -> list[Todo]:
        """
        Get all todos sorted by creation date (newest first).

        Returns:
            List of Todo instances, sorted by created_at descending

        Example:
            >>> storage = TodoStorage()
            >>> storage.add_todo("Task 1")
            >>> storage.add_todo("Task 2")
            >>> todos = storage.list_todos()
            >>> len(todos)
            2
        """
        return sorted(
            self._todos.values(),
            key=lambda t: t.created_at,
            reverse=True
        )
```

#### UPDATE (Mark Complete)

**File**: `src/storage.py`

```python
    def complete_todo(self, todo_id: str) -> Todo:
        """
        Mark a todo as completed.

        Args:
            todo_id: UUID of the todo to complete

        Returns:
            Updated Todo instance

        Raises:
            ValueError: If todo_id not found

        Example:
            >>> storage = TodoStorage()
            >>> todo = storage.add_todo("Task")
            >>> completed = storage.complete_todo(todo.id)
            >>> completed.status
            'completed'
        """
        if todo_id not in self._todos:
            raise ValueError("Todo ID not found")

        todo = self._todos[todo_id]
        todo.status = "completed"
        todo.completed_at = datetime.now()

        return todo
```

#### DELETE (Remove Todo)

**File**: `src/storage.py`

```python
    def delete_todo(self, todo_id: str) -> None:
        """
        Delete a todo by ID.

        Args:
            todo_id: UUID of the todo to delete

        Raises:
            ValueError: If todo_id not found

        Example:
            >>> storage = TodoStorage()
            >>> todo = storage.add_todo("Task")
            >>> storage.delete_todo(todo.id)
            >>> len(storage.list_todos())
            0
        """
        if todo_id not in self._todos:
            raise ValueError("Todo ID not found")

        del self._todos[todo_id]
```

### Step 3: Implement UI Layer

**File**: `src/ui.py`

```python
from src.storage import TodoStorage


class ConsoleUI:
    """Console user interface for todo operations."""

    def __init__(self, storage: TodoStorage) -> None:
        """Initialize UI with storage backend."""
        self.storage = storage

    def add_todo_interactive(self) -> None:
        """Prompt user to add a new todo."""
        print("\n=== Add Todo ===")
        text = input("Enter todo text: ").strip()

        try:
            todo = self.storage.add_todo(text)
            print(f"✅ Todo added with ID: {todo.id[:8]}...")
        except ValueError as e:
            print(f"❌ Error: {e}")

    def list_todos_interactive(self) -> None:
        """Display all todos in table format."""
        print("\n=== Your Todos ===")
        todos = self.storage.list_todos()

        if not todos:
            print("No todos yet. Add one to get started!")
            return

        print(f"\n{'ID':<10} {'Status':<12} {'Created':<20} {'Text':<50}")
        print("-" * 92)

        for todo in todos:
            id_short = todo.id[:8]
            created = todo.created_at.strftime("%Y-%m-%d %H:%M")
            print(f"{id_short:<10} {todo.status:<12} {created:<20} {todo.text:<50}")

    def complete_todo_interactive(self) -> None:
        """Prompt user to mark a todo as complete."""
        print("\n=== Mark Complete ===")
        todo_id = input("Enter todo ID (first 8 chars OK): ").strip()

        # Find matching todo (allow short ID)
        full_id = self._find_todo_id(todo_id)
        if not full_id:
            print(f"❌ Error: Todo ID not found")
            return

        try:
            todo = self.storage.complete_todo(full_id)
            print(f"✅ Marked complete: {todo.text}")
        except ValueError as e:
            print(f"❌ Error: {e}")

    def delete_todo_interactive(self) -> None:
        """Prompt user to delete a todo."""
        print("\n=== Delete Todo ===")
        todo_id = input("Enter todo ID (first 8 chars OK): ").strip()

        # Find matching todo
        full_id = self._find_todo_id(todo_id)
        if not full_id:
            print(f"❌ Error: Todo ID not found")
            return

        try:
            self.storage.delete_todo(full_id)
            print(f"✅ Todo deleted")
        except ValueError as e:
            print(f"❌ Error: {e}")

    def _find_todo_id(self, partial_id: str) -> str | None:
        """Find full todo ID from partial match."""
        todos = self.storage.list_todos()
        for todo in todos:
            if todo.id.startswith(partial_id):
                return todo.id
        return None
```

### Step 4: Write Tests

**File**: `tests/test_storage.py`

```python
import pytest
from datetime import datetime
from src.storage import TodoStorage, Todo


def test_add_todo_success():
    """TC-003-1: Add valid todo succeeds."""
    storage = TodoStorage()
    todo = storage.add_todo("Buy groceries")

    assert todo.text == "Buy groceries"
    assert todo.status == "pending"
    assert todo.created_at <= datetime.now()
    assert todo.id  # UUID assigned
    assert len(storage.list_todos()) == 1


def test_add_todo_empty_text_rejected():
    """TC-003-2: Empty text rejected."""
    storage = TodoStorage()

    with pytest.raises(ValueError, match="Todo text required"):
        storage.add_todo("")

    with pytest.raises(ValueError, match="Todo text required"):
        storage.add_todo("   ")


def test_add_todo_long_text_rejected():
    """TC-003-3: Text > 200 chars rejected."""
    storage = TodoStorage()
    long_text = "x" * 201

    with pytest.raises(ValueError, match="Todo text too long"):
        storage.add_todo(long_text)


def test_list_todos_empty():
    """TC-004-1: Empty list shows no todos."""
    storage = TodoStorage()
    assert storage.list_todos() == []


def test_list_todos_sorted_newest_first():
    """TC-004-2: Todos sorted by creation date."""
    storage = TodoStorage()

    todo1 = storage.add_todo("First")
    todo2 = storage.add_todo("Second")

    todos = storage.list_todos()
    assert todos[0].id == todo2.id  # Newest first
    assert todos[1].id == todo1.id


def test_complete_todo_success():
    """TC-005-1: Mark todo complete succeeds."""
    storage = TodoStorage()
    todo = storage.add_todo("Task")

    completed = storage.complete_todo(todo.id)

    assert completed.status == "completed"
    assert completed.completed_at is not None


def test_complete_todo_invalid_id():
    """TC-005-2: Invalid ID raises error."""
    storage = TodoStorage()

    with pytest.raises(ValueError, match="Todo ID not found"):
        storage.complete_todo("invalid-id")


def test_delete_todo_success():
    """TC-006-1: Delete todo succeeds."""
    storage = TodoStorage()
    todo = storage.add_todo("Task")

    storage.delete_todo(todo.id)

    assert len(storage.list_todos()) == 0


def test_delete_todo_invalid_id():
    """TC-006-2: Invalid ID raises error."""
    storage = TodoStorage()

    with pytest.raises(ValueError, match="Todo ID not found"):
        storage.delete_todo("invalid-id")
```

### Step 5: Run Tests

```bash
# Run tests for this task
pytest tests/test_storage.py -v

# Expected output:
# test_add_todo_success PASSED
# test_add_todo_empty_text_rejected PASSED
# test_add_todo_long_text_rejected PASSED
# ...
```

### Step 6: Update Task Status

Mark task as complete in `specs/phase1-console-app/tasks.md`:

```markdown
- [x] **TASK-003**: Implement Add Todo Operation ✅
```

## Output Artifacts

1. **Implementation**: `src/storage.py` (updated)
2. **UI Layer**: `src/ui.py` (updated)
3. **Tests**: `tests/test_storage.py` (created/updated)
4. **Task Update**: Task marked complete in tasks.md

## Validation Rules

### MUST Pass:
- All test cases from task spec pass
- Type hints on all functions
- Docstrings with examples
- Error handling for edge cases (from spec)
- Code follows PEP 8
- No hardcoded values

### Code Quality Checks:
```bash
# Type checking
mypy src/

# Linting
ruff check src/

# Tests
pytest tests/ --cov=src
```

## Example Usage

```bash
# Agent receives task:
Task: Implement TASK-003 (Add Todo Operation)

# Agent executes this skill:
1. Reads TASK-003 from tasks.md
2. Implements add_todo() in storage.py
3. Implements add_todo_interactive() in ui.py
4. Writes 3 test cases in test_storage.py
5. Runs pytest - all pass ✅
6. Marks TASK-003 complete
```

## Edge Case Handling

| Edge Case | Implementation | Test Case |
|-----------|----------------|-----------|
| Empty text | Raise ValueError | TC-003-2 |
| Whitespace only | Strip and reject if empty | TC-003-2 |
| Text > 200 chars | Raise ValueError | TC-003-3 |
| Non-existent ID | Raise ValueError | TC-005-2, TC-006-2 |
| Complete twice | Idempotent (update timestamp) | TC-005-3 |

## Related Skills

- **create-phase1-spec**: Creates the spec this implements
- **validate-console-ui**: Validates the UI layer
- **Phase II**: create-rest-api-endpoint (similar pattern)

## Success Indicators

- ✅ Function implemented with correct signature
- ✅ All test cases pass
- ✅ Type hints present (mypy clean)
- ✅ Docstrings with examples
- ✅ Edge cases handled
- ✅ Task marked complete in tasks.md
- ✅ Code reference includes task ID in comments

## Failure Modes & Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Test fails | Debug, fix implementation, rerun |
| Type error | Add/fix type hints |
| Missing edge case | Add validation logic and test |
| Task ID mismatch | Verify task exists in tasks.md |

---

**Last Updated**: 2025-12-30
**Version**: 1.0
**Hackathon**: Todo Spec-Driven Development
