# Phase III AI Chatbot Agent

## Purpose
Specialized agent for implementing Phase III: AI-powered chatbot interface using OpenAI Agents SDK and MCP (Model Context Protocol) for natural language todo management.

## Scope
- Conversational interface for all Basic Level features
- OpenAI Agents SDK for AI orchestration
- MCP Server with Official MCP SDK
- Stateless architecture with database persistence
- OpenAI ChatKit frontend

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | OpenAI ChatKit |
| Backend | FastAPI + OpenAI Agents SDK |
| MCP Server | Official MCP SDK (Python) |
| Database | Neon PostgreSQL (conversations + messages) |
| ORM | SQLModel |
| Auth | Better Auth + JWT |

## Architecture

```
┌─────────────┐     ┌──────────────────────────────┐     ┌─────────────┐
│  ChatKit UI │────▶│     FastAPI Backend          │     │   Neon DB   │
│ (Frontend)  │     │  ┌────────────────────────┐  │     │             │
│             │     │  │  POST /api/{user}/chat │  │     │ - tasks     │
│             │     │  └──────────┬─────────────┘  │     │ - convos    │
│             │     │             ▼                │     │ - messages  │
│             │     │  ┌────────────────────────┐  │     │             │
│             │◀────│  │  OpenAI Agents SDK     │  │────▶│             │
│             │     │  │  (Agent + Runner)      │  │     │             │
│             │     │  └──────────┬─────────────┘  │     │             │
│             │     │             ▼                │     │             │
│             │     │  ┌────────────────────────┐  │     │             │
│             │     │  │      MCP Server        │  │────▶│             │
│             │     │  │  (Task CRUD Tools)     │  │◀────│             │
│             │     │  └────────────────────────┘  │     │             │
└─────────────┘     └──────────────────────────────┘     └─────────────┘
```

## Database Models

### Conversation
```python
class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    created_at: datetime
    updated_at: datetime
```

### Message
```python
class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id")
    user_id: str = Field(foreign_key="users.id")
    role: str  # "user" or "assistant"
    content: str
    created_at: datetime
```

## MCP Tools Specification

### Tool: add_task
- **Purpose**: Create a new task
- **Parameters**:
  - user_id: string (required)
  - title: string (required)
  - description: string (optional)
- **Returns**: `{"task_id": 5, "status": "created", "title": "Buy groceries"}`

### Tool: list_tasks
- **Purpose**: Retrieve tasks
- **Parameters**:
  - user_id: string (required)
  - status: string (optional: "all", "pending", "completed")
- **Returns**: Array of task objects

### Tool: complete_task
- **Purpose**: Mark task as complete
- **Parameters**:
  - user_id: string (required)
  - task_id: integer (required)
- **Returns**: `{"task_id": 3, "status": "completed", "title": "Call mom"}`

### Tool: delete_task
- **Purpose**: Remove task
- **Parameters**:
  - user_id: string (required)
  - task_id: integer (required)
- **Returns**: `{"task_id": 2, "status": "deleted"}`

### Tool: update_task
- **Purpose**: Modify task
- **Parameters**:
  - user_id: string (required)
  - task_id: integer (required)
  - title: string (optional)
  - description: string (optional)
- **Returns**: `{"task_id": 1, "status": "updated"}`

## Agent Behavior

| User Intent | Agent Action |
|-------------|--------------|
| "Add a task to buy groceries" | Call add_task |
| "Show me all my tasks" | Call list_tasks with status="all" |
| "What's pending?" | Call list_tasks with status="pending" |
| "Mark task 3 as done" | Call complete_task |
| "Delete the meeting task" | Search then delete_task |
| "Change task 1 title" | Call update_task |

## Stateless Chat Endpoint

### POST /api/{user_id}/chat

**Request**:
```json
{
  "conversation_id": 123,  // optional
  "message": "Add buy milk to my tasks"
}
```

**Response**:
```json
{
  "conversation_id": 123,
  "response": "I've added 'buy milk' to your tasks.",
  "tool_calls": ["add_task"]
}
```

## Conversation Flow (Stateless)
1. Receive user message
2. Fetch conversation history from database
3. Build message array (history + new message)
4. Store user message in database
5. Run OpenAI agent with MCP tools
6. Agent invokes MCP tool(s) as needed
7. Store assistant response in database
8. Return response to client
9. Server holds NO state

## OpenAI ChatKit Setup

### Domain Allowlist
1. Deploy frontend to Vercel/Netlify
2. Add domain to: https://platform.openai.com/settings/organization/security/domain-allowlist
3. Get domain key
4. Set environment variable: `NEXT_PUBLIC_OPENAI_DOMAIN_KEY`

### Environment Variables
```
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=...
BETTER_AUTH_SECRET=...
DATABASE_URL=postgresql://...
```

## Implementation Guidelines

### MCP Server Structure
```python
from mcp.server import Server
from mcp.types import Tool

server = Server("todo-mcp")

@server.tool()
async def add_task(user_id: str, title: str, description: str = ""):
    # Interact with database via SQLModel
    # Return structured response
```

### Agent Configuration
```python
from openai import OpenAI
from openai.agents import Agent

agent = Agent(
    model="gpt-4o",
    instructions="You are a helpful todo assistant...",
    tools=[add_task, list_tasks, complete_task, delete_task, update_task]
)
```

## Acceptance Criteria
- Natural language understanding for all 5 basic features
- MCP tools properly expose task operations
- Conversation history persists across sessions
- Stateless server architecture
- ChatKit UI functional with domain allowlist
- Graceful error handling
- Friendly, confirmatory responses

## Success Metrics
- Users can manage todos through conversation
- Multi-turn conversations work correctly
- Server restarts don't lose conversation state
- MCP tools execute correctly
- Clean integration between Agents SDK and MCP

## Deliverables
- /frontend with ChatKit UI
- /backend with FastAPI + Agents SDK + MCP
- /specs/phase3-chatbot/ with spec/plan/tasks
- Database migrations for conversations/messages
- README with setup instructions
