# MCP Server for Todo Application

Phase III AI-Powered Todo Chatbot - Model Context Protocol (MCP) Server

## Overview

This MCP server provides 5 tools for managing todo tasks through natural language via the OpenAI Agent. All tools are stateless and operate on the user's tasks in the database.

## Tools

### 1. add_task

Creates a new task for the user.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| title | string | Yes | Task title (1-100 characters) |
| description | string | No | Task description (0-500 characters) |

**Example Input:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, bread, eggs"
}
```

**Example Success Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "12345678-1234-1234-1234-123456789012",
    "status": "created",
    "title": "Buy groceries"
  },
  "message": "Task 'Buy groceries' created successfully"
}
```

---

### 2. list_tasks

Lists user's tasks with optional filtering.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| filter | string | No | Filter by status: "all" (default), "pending", "completed" |

**Example Input:**
```json
{
  "filter": "pending"
}
```

**Example Success Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "12345678",
        "full_id": "12345678-1234-1234-1234-123456789012",
        "title": "Buy groceries",
        "description": "Milk, bread, eggs",
        "status": "pending",
        "created_at": "2026-01-13T10:00:00",
        "completed_at": null
      }
    ],
    "count": 1,
    "filter": "pending"
  }
}
```

---

### 3. complete_task

Toggles a task's completion status (pending ↔ completed).

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | string | Yes | UUID of the task to toggle |

**Example Input:**
```json
{
  "task_id": "12345678-1234-1234-1234-123456789012"
}
```

**Example Success Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "12345678-1234-1234-1234-123456789012",
    "status": "completed",
    "title": "Buy groceries"
  },
  "message": "Task 'Buy groceries' marked as completed"
}
```

---

### 4. update_task

Updates a task's title and/or description.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | string | Yes | UUID of the task to update |
| title | string | Yes | New task title (1-100 characters) |
| description | string | No | New task description (0-500 characters) |

**Example Input:**
```json
{
  "task_id": "12345678-1234-1234-1234-123456789012",
  "title": "Buy groceries and snacks",
  "description": "Milk, bread, eggs, chips"
}
```

**Example Success Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "12345678-1234-1234-1234-123456789012",
    "status": "updated",
    "title": "Buy groceries and snacks"
  },
  "message": "Task 'Buy groceries and snacks' updated successfully"
}
```

---

### 5. delete_task

Permanently deletes a task.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | string | Yes | UUID of the task to delete |

**Example Input:**
```json
{
  "task_id": "12345678-1234-1234-1234-123456789012"
}
```

**Example Success Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "12345678-1234-1234-1234-123456789012",
    "status": "deleted",
    "title": "Buy groceries"
  },
  "message": "Task 'Buy groceries' deleted successfully"
}
```

---

## Error Codes

All tools return standardized error responses:

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Invalid input (e.g., title too long, empty title) |
| NOT_FOUND | Task not found or user doesn't own the task |
| INTERNAL_ERROR | Unexpected server error |
| UNAUTHORIZED | User not authenticated |
| CONFLICT | Resource conflict (reserved for future use) |

**Example Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title must not exceed 100 characters",
    "details": {
      "field": "title"
    }
  }
}
```

---

## Security

- **User Isolation**: All tools require a `user_id` and only operate on tasks owned by that user
- **Ownership Validation**: Attempting to access another user's task returns `NOT_FOUND` (not `UNAUTHORIZED`) to prevent task enumeration
- **Input Validation**: All inputs are validated before database operations

---

## Usage

```python
from src.mcp import mcp_server, register_tools
from src.mcp.tools import add_task, list_tasks, complete_task, update_task, delete_task

# Register tools with the MCP server at startup
register_tools()

# Tools are then available via the MCP server for the OpenAI Agent
```

---

## Testing

```bash
# Run MCP tool tests
cd backend
uv run python -m pytest tests/integration/test_mcp_tools.py -v

# Run all Phase III tests
uv run python -m pytest tests/unit/ tests/integration/test_mcp_tools.py -v
```
