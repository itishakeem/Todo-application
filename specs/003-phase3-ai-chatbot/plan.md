# Implementation Plan: Phase III AI-Powered Todo Chatbot

**Branch**: `003-phase3-ai-chatbot` | **Date**: 2026-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-phase3-ai-chatbot/spec.md`

## Summary

Phase III transforms the Phase II web application into an AI-powered conversational interface. Users can manage their todo items through natural language commands (add, list, complete, update, delete) via a chatbot instead of traditional UI interactions. The technical approach integrates OpenAI ChatKit for the frontend UI, OpenAI Agents SDK for AI orchestration, and an MCP (Model Context Protocol) server exposing 5 task operation tools. The architecture is stateless - all conversation state persists in the database, enabling horizontal scalability and resilience to server restarts.

## Technical Context

**Language/Version**: TypeScript 5+ (frontend ChatKit), Python 3.13+ (backend MCP server + Agents SDK)
**Primary Dependencies**:
- Frontend: OpenAI ChatKit, React 19+, Next.js 15+
- Backend: FastAPI, OpenAI Agents SDK, Official MCP SDK (Python), SQLModel
**Storage**: Neon DB (PostgreSQL 16+) - reuses Phase II schema, adds conversations and messages tables
**Testing**: Playwright (E2E chat flows), Pytest (MCP tool tests, agent behavior tests)
**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+), deployed on Vercel
**Project Type**: Web application (frontend + backend split with MCP server integration)
**Performance Goals**:
- Chat response latency < 5 seconds for 95% of requests
- Support 100 concurrent chat sessions
- Conversation history loads < 2 seconds for up to 100 messages
- All Phase II performance goals maintained
**Constraints**:
- Stateless server architecture (no in-memory conversation state)
- All MCP tools must be stateless and idempotent
- OpenAI domain allowlist required for hosted ChatKit
- Phase I/II validation rules preserved (title 1-100 chars, description 0-500 chars)
**Scale/Scope**: Single-user MVP, 5 MCP tools, conversation history persistence, 8 user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development ✅ PASS
- ✅ Specification complete and approved ([spec.md](./spec.md) - 342 lines, 8 user stories)
- ✅ All requirements testable and unambiguous (48 acceptance scenarios, zero [NEEDS CLARIFICATION])
- ✅ Plan being created before tasks
- ✅ No manual coding constraint acknowledged
- ✅ PHR will be created for planning session

### Principle II: Phased Progression ✅ PASS
- ✅ Phase I complete (console app working)
- ✅ Phase II complete (full-stack web app with auth, 7 user stories)
- ✅ Phase III builds on Phase II foundation (reuses backend, database, auth)
- ✅ Phase transition criteria defined in spec (5 MCP tools, conversation persistence)

### Principle III: Test-First Development ✅ PASS
- ✅ TDD approach planned: E2E tests (Playwright), integration tests (Pytest)
- ✅ Test coverage target: 100% for MCP tools, 80%+ for business logic
- ✅ Tests will be written before implementation (Red-Green-Refactor)
- ✅ All acceptance scenarios will be automated as tests

### Principle IV: Knowledge Capture & Traceability ✅ PASS
- ✅ PHR will be created for planning session (stage: plan, feature: phase3-ai-chatbot)
- ✅ All tasks will reference task IDs
- ✅ ADRs will be suggested for significant architectural decisions (MCP architecture, stateless design)

### Principle V: Multi-Agent Orchestration ✅ PASS
- ✅ Orchestrator routing to SpecKit Architect and Phase III agent
- ✅ SpecKit validated spec before planning
- ✅ Phase II prerequisite validated (web app complete)

### Principle VI: Clean Architecture & Code Quality ✅ PASS
- ✅ Clear separation planned: ChatKit UI, Chat API, Agents SDK, MCP Server, Task Service
- ✅ TypeScript strict mode (frontend), Python type hints (backend)
- ✅ Environment variables for secrets (OPENAI_API_KEY, DATABASE_URL)
- ✅ YAGNI principle applied (5 MCP tools only, no advanced features)

### Principle VII: Security & Data Privacy ✅ PASS
- ✅ Better Auth reused from Phase II
- ✅ User data isolation (user_id enforced on all MCP tools)
- ✅ Input validation preserved (title 1-100, description 0-500)
- ✅ No secrets in code (.env for OpenAI API key)
- ✅ Domain allowlist for ChatKit security

### Principle VIII: Bonus Features & Innovation ⚠️ NOT IN SCOPE
- ⚠️ No bonus features in Phase III core (voice commands, multi-language deferred)
- ⚠️ Potential for multi-language support as bonus (Urdu +100 points)

**Gate Decision**: ✅ **PASS** - All applicable constitutional principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/003-phase3-ai-chatbot/
├── spec.md              # Feature specification (approved, 342 lines)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (architecture decisions)
├── data-model.md        # Phase 1 output (database schema)
├── quickstart.md        # Phase 1 output (developer onboarding)
├── contracts/           # Phase 1 output (API contracts)
│   └── chat-api.openapi.json
├── checklists/
│   └── requirements.md  # Spec quality validation (passed)
└── tasks.md             # Phase 2 output (/sp.tasks - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Frontend (Next.js)
frontend/
├── app/
│   ├── chat/             # NEW: Chat interface page
│   │   └── page.tsx      # Chat page with drawer integration
│   ├── dashboard/        # Existing Phase II dashboard
│   └── ...               # Other existing pages
├── components/
│   ├── chat/             # NEW: Chat components (10 files)
│   │   ├── index.ts             # Barrel export for all chat components
│   │   ├── ChatContainer.tsx    # Layout wrapper for chat
│   │   ├── ChatDrawer.tsx       # Drawer UI for chat access from any page
│   │   ├── MessageList.tsx      # Conversation display with auto-scroll
│   │   ├── MessageInput.tsx     # User input field with keyboard shortcuts
│   │   ├── MessageBubble.tsx    # Individual message display
│   │   ├── ConversationList.tsx # Sidebar conversation selector
│   │   ├── LoadingIndicator.tsx # Typing indicator animation
│   │   ├── ErrorMessage.tsx     # Error display with retry
│   │   └── TaskPreview.tsx      # Real-time task preview in chat
│   └── ...               # Existing components
├── lib/
│   ├── chat-api.ts       # NEW: Chat API client
│   ├── hooks/
│   │   ├── useChatMessages.ts   # NEW: Hook for chat messages
│   │   └── useConversations.ts  # NEW: Hook for conversations
│   └── context/
│       └── ChatContext.tsx      # NEW: Chat state context
└── tests/
    └── e2e/
        └── chat.spec.ts  # NEW: Chat E2E tests

# Backend (FastAPI + MCP Server)
backend/
├── src/
│   ├── api/
│   │   ├── tasks.py      # Existing task endpoints
│   │   ├── auth.py       # Existing auth endpoints
│   │   └── chat.py       # NEW: Chat endpoint (POST /api/{user_id}/chat)
│   ├── models/
│   │   ├── task.py       # Existing Task model
│   │   ├── user.py       # Existing User model
│   │   ├── conversation.py  # NEW: Conversation model
│   │   └── message.py    # NEW: Message model
│   ├── services/
│   │   ├── task_service.py    # Existing task service
│   │   └── chat_service.py    # NEW: Chat orchestration service
│   ├── mcp/              # NEW: MCP Server implementation (12 files total)
│   │   ├── __init__.py   # MCP module exports
│   │   ├── server.py     # MCP server setup
│   │   ├── types.py      # MCP type definitions
│   │   ├── validators.py # Input validation utilities
│   │   ├── README.md     # MCP implementation documentation
│   │   └── tools/        # MCP tool implementations (7 files)
│   │       ├── __init__.py
│   │       ├── base.py       # Base tool interface
│   │       ├── add_task.py
│   │       ├── list_tasks.py
│   │       ├── complete_task.py
│   │       ├── update_task.py
│   │       └── delete_task.py
│   ├── agent/            # NEW: OpenAI Agents SDK integration (4 files)
│   │   ├── __init__.py
│   │   ├── config.py     # Agent configuration (model, temperature)
│   │   ├── todo_agent.py # Agent definition with tools
│   │   └── runner.py     # Agent execution
│   └── main.py           # FastAPI app (updated with chat routes)
├── migrations/
│   ├── 001_create_tasks.sql    # Existing
│   ├── 002_create_users.sql    # Existing
│   ├── 003_create_conversations.sql  # NEW
│   └── 004_create_messages.sql       # NEW
└── tests/
    ├── integration/
    │   ├── test_tasks.py        # Existing
    │   ├── test_chat.py         # NEW: Chat API tests
    │   └── test_mcp_tools.py    # NEW: MCP tool tests
    └── unit/
        ├── __init__.py
        ├── test_agent.py              # NEW: Agent behavior tests
        ├── test_chat_service.py       # NEW: Chat service tests
        ├── test_mcp_server.py         # NEW: MCP server tests
        ├── test_conversation_model.py # NEW: Conversation model tests
        └── test_message_model.py      # NEW: Message model tests
```

**Structure Decision**: Extends Phase II web application architecture. Frontend adds ChatKit-based chat page alongside existing dashboard. Backend adds MCP server module with 5 tools, OpenAI Agents SDK integration, and chat endpoint. New database tables for conversations and messages. Clear separation maintained: ChatKit (UI) → Chat API → Agents SDK → MCP Tools → Task Service → Database.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations detected - all constitutional principles satisfied.*

---

## Phase 0: Architecture Research & Decisions

### Research Questions

1. **OpenAI ChatKit Integration Pattern**
   - **Decision**: Use hosted ChatKit with domain allowlist
   - **Rationale**: Simplest integration, official OpenAI component, handles message rendering and input
   - **Alternatives Considered**: Custom chat UI (more work), third-party chat libraries (less integration)

2. **OpenAI Agents SDK Architecture**
   - **Decision**: Single agent with 5 MCP tools, stateless execution per request
   - **Rationale**: Matches hackathon requirements exactly, no complex multi-agent orchestration needed
   - **Alternatives Considered**: Multi-agent (overkill for 5 operations), direct function calling (less flexible than MCP)

3. **MCP Server Communication Pattern**
   - **Decision**: In-process MCP server (no separate service)
   - **Rationale**: Simpler deployment, no network overhead, single process for Phase III
   - **Alternatives Considered**: Separate MCP service (complex for MVP), HTTP-based tools (latency)

4. **Conversation State Management**
   - **Decision**: Database-backed with conversation_id and message history
   - **Rationale**: Stateless server requirement, survives restarts, enables horizontal scaling
   - **Alternatives Considered**: Redis (extra dependency), in-memory (violates stateless), session storage (client-side limits)

5. **Chat API Endpoint Design**
   - **Decision**: Single POST /api/{user_id}/chat endpoint with conversation_id in request body
   - **Rationale**: Matches hackathon spec exactly, RESTful, simple client integration
   - **Alternatives Considered**: WebSocket (complex for MVP), GraphQL subscription (overkill)

6. **Agent Tool Invocation Strategy**
   - **Decision**: Agent autonomously selects tools based on user intent
   - **Rationale**: Natural language understanding is agent's strength, no explicit command parsing needed
   - **Alternatives Considered**: Keyword-based routing (brittle), intent classification model (extra complexity)

7. **Error Handling in MCP Tools**
   - **Decision**: Return structured error objects, agent translates to user-friendly messages
   - **Rationale**: Clean separation between tool errors and user communication
   - **Alternatives Considered**: Throw exceptions (harder for agent to handle), return strings (inconsistent)

8. **Conversation History Loading**
   - **Decision**: Load last 50 messages per conversation for agent context
   - **Rationale**: Balance between context quality and token limits/performance
   - **Alternatives Considered**: Load all (token limits), summarization (complexity), last 10 (insufficient context)

9. **Task Identification in Natural Language**
   - **Decision**: Support both task ID ("task 5") and keyword matching ("the grocery task")
   - **Rationale**: User-friendly, matches acceptance scenarios in spec
   - **Alternatives Considered**: ID only (poor UX), full-text search (overkill for MVP)

10. **OpenAI API Key Management**
    - **Decision**: Environment variable OPENAI_API_KEY, server-side only
    - **Rationale**: Security best practice, never exposed to client
    - **Alternatives Considered**: Client-side key (insecure), key in database (unnecessary complexity)

### Technology Choices

| Technology | Version | Justification |
|------------|---------|---------------|
| OpenAI ChatKit | Latest | Official chat UI component from OpenAI, handles message display |
| OpenAI Agents SDK | Latest | Official agent orchestration, integrates with MCP natively |
| Official MCP SDK | Latest | Python SDK for Model Context Protocol, defines tool interface |
| FastAPI | Latest | Existing backend framework from Phase II, async support |
| SQLModel | Latest | Existing ORM from Phase II, type-safe queries |
| Neon DB | PostgreSQL 16+ | Existing database from Phase II, serverless |
| Better Auth | Latest | Existing auth from Phase II, session cookies |
| Playwright | Latest | E2E testing for chat flows |
| Pytest | Latest | Backend testing for MCP tools and agent |

### Integration Patterns

1. **Frontend ↔ Chat API Communication**
   - **Pattern**: RESTful JSON with POST /api/{user_id}/chat
   - **Auth**: Session cookies from Better Auth (same as Phase II)
   - **Request**: `{ conversation_id?: number, message: string }`
   - **Response**: `{ conversation_id: number, response: string, tool_calls: array }`

2. **Chat API ↔ OpenAI Agents SDK**
   - **Pattern**: Agent Runner executes per request, receives message + history
   - **Context**: Last 50 messages from database loaded as agent context
   - **Tools**: 5 MCP tools registered with agent

3. **Agents SDK ↔ MCP Tools**
   - **Pattern**: Agent invokes tools via MCP protocol, tools return structured results
   - **Validation**: Each tool validates user_id ownership before operating
   - **Errors**: Structured error objects returned to agent for translation

4. **MCP Tools ↔ Database**
   - **Pattern**: SQLModel queries via existing task_service.py
   - **Reuse**: All existing CRUD logic from Phase II preserved
   - **Transactions**: Single-task operations, no multi-step transactions needed

---

## Phase 1: Data Model & API Contracts

### Data Model

**Existing Entities** (from Phase II - unchanged):

```text
Table: tasks
├── id: UUID (primary key)
├── user_id: UUID (foreign key → users.id)
├── title: VARCHAR(100) (NOT NULL, 1-100 chars)
├── description: VARCHAR(500) (default '', 0-500 chars)
├── status: ENUM('pending', 'completed')
├── created_at: TIMESTAMP WITH TIME ZONE
├── completed_at: TIMESTAMP WITH TIME ZONE (nullable)
└── updated_at: TIMESTAMP WITH TIME ZONE (nullable)

Table: users
├── id: UUID (primary key)
├── email: VARCHAR(255) (UNIQUE)
├── name: VARCHAR(255) (nullable)
├── password_hash: VARCHAR(255)
└── created_at: TIMESTAMP WITH TIME ZONE
```

**New Entities for Phase III**:

```text
Table: conversations
├── id: SERIAL (primary key, auto-increment integer)
├── user_id: UUID (foreign key → users.id, NOT NULL)
├── created_at: TIMESTAMP WITH TIME ZONE (default NOW())
├── updated_at: TIMESTAMP WITH TIME ZONE (default NOW())
└── INDEX idx_conversations_user (user_id)

Table: messages
├── id: SERIAL (primary key, auto-increment integer)
├── conversation_id: INTEGER (foreign key → conversations.id, NOT NULL)
├── user_id: UUID (foreign key → users.id, NOT NULL)
├── role: ENUM('user', 'assistant') (NOT NULL)
├── content: TEXT (NOT NULL)
├── tool_calls: JSONB (nullable, stores tool invocation details)
├── created_at: TIMESTAMP WITH TIME ZONE (default NOW())
├── INDEX idx_messages_conversation (conversation_id, created_at)
└── INDEX idx_messages_user (user_id)
```

**Relationships**:
- User 1:N Conversation (one user has many conversations)
- Conversation 1:N Message (one conversation has many messages)
- Foreign key constraints with ON DELETE CASCADE

### API Contracts

**Base URL**: `/api`
**Authentication**: Session cookie required (Better Auth, same as Phase II)
**Content-Type**: `application/json`

#### Chat Endpoint

```yaml
POST /api/{user_id}/chat
Description: Send a message and receive AI response

Path Parameters:
  - user_id: UUID (required) - authenticated user's ID

Request Body:
  {
    "conversation_id": integer | null,  # Optional - creates new if not provided
    "message": string                   # Required - user's natural language message
  }

Response 200:
  {
    "conversation_id": integer,         # The conversation ID (new or existing)
    "response": string,                 # AI assistant's response text
    "tool_calls": [                     # List of MCP tools invoked
      {
        "tool": string,                 # Tool name (e.g., "add_task")
        "input": object,                # Tool input parameters
        "output": object                # Tool result
      }
    ]
  }

Response 400:
  {
    "error": {
      "message": "Message is required",
      "code": "VALIDATION_ERROR"
    }
  }

Response 401:
  {
    "error": {
      "message": "Authentication required",
      "code": "UNAUTHORIZED"
    }
  }

Response 500:
  {
    "error": {
      "message": "Internal server error",
      "code": "INTERNAL_ERROR"
    }
  }
```

#### Conversation History Endpoint

```yaml
GET /api/{user_id}/conversations
Description: List user's conversations

Response 200:
  {
    "conversations": [
      {
        "id": integer,
        "created_at": ISO8601 timestamp,
        "updated_at": ISO8601 timestamp,
        "message_count": integer,
        "last_message_preview": string (first 100 chars)
      }
    ]
  }

GET /api/{user_id}/conversations/{conversation_id}/messages
Description: Get messages for a conversation

Query Parameters:
  - limit: integer (default 50, max 100)
  - offset: integer (default 0)

Response 200:
  {
    "messages": [
      {
        "id": integer,
        "role": "user" | "assistant",
        "content": string,
        "tool_calls": array | null,
        "created_at": ISO8601 timestamp
      }
    ],
    "total": integer,
    "has_more": boolean
  }
```

### MCP Tools Specification

**Tool: add_task**
```yaml
Name: add_task
Description: Create a new task for the user
Parameters:
  - user_id: string (required) - User's UUID
  - title: string (required) - Task title (1-100 chars)
  - description: string (optional) - Task description (0-500 chars)
Returns:
  {
    "task_id": UUID,
    "status": "created",
    "title": string
  }
Errors:
  - VALIDATION_ERROR: Title too long/short
  - INTERNAL_ERROR: Database failure
```

**Tool: list_tasks**
```yaml
Name: list_tasks
Description: Retrieve tasks for the user
Parameters:
  - user_id: string (required) - User's UUID
  - status: string (optional) - Filter: "all" | "pending" | "completed" (default: "all")
Returns:
  {
    "tasks": [
      {
        "id": UUID (8-char prefix displayed),
        "title": string,
        "description": string,
        "status": "pending" | "completed",
        "created_at": ISO8601 timestamp
      }
    ],
    "count": integer
  }
```

**Tool: complete_task**
```yaml
Name: complete_task
Description: Mark a task as complete or uncomplete
Parameters:
  - user_id: string (required) - User's UUID
  - task_id: string (required) - Task UUID or 8-char prefix
  - completed: boolean (required) - true to complete, false to uncomplete
Returns:
  {
    "task_id": UUID,
    "status": "completed" | "uncompleted",
    "title": string
  }
Errors:
  - NOT_FOUND: Task not found or not owned by user
```

**Tool: update_task**
```yaml
Name: update_task
Description: Update task title or description
Parameters:
  - user_id: string (required) - User's UUID
  - task_id: string (required) - Task UUID or 8-char prefix
  - title: string (optional) - New title (1-100 chars)
  - description: string (optional) - New description (0-500 chars)
Returns:
  {
    "task_id": UUID,
    "status": "updated",
    "title": string
  }
Errors:
  - NOT_FOUND: Task not found
  - VALIDATION_ERROR: Title/description too long
```

**Tool: delete_task**
```yaml
Name: delete_task
Description: Remove a task from the user's list
Parameters:
  - user_id: string (required) - User's UUID
  - task_id: string (required) - Task UUID or 8-char prefix
Returns:
  {
    "task_id": UUID,
    "status": "deleted",
    "title": string
  }
Errors:
  - NOT_FOUND: Task not found or not owned by user
```

### Agent Configuration

```yaml
Agent Name: TodoAssistant
Model: gpt-4o
System Prompt: |
  You are a friendly and helpful todo list assistant. You help users manage their tasks through natural conversation.

  LANGUAGE: Respond in the SAME LANGUAGE as the user (supports Urdu for +100 bonus points).

  Your capabilities:
  - Add new tasks (when user mentions adding, creating, remembering something)
  - List tasks (when user asks to see, show, or list tasks)
  - Complete tasks (when user says done, finished, completed, "ho gaya", "mukammal")
  - Update tasks (when user wants to change, rename, or modify)
  - Delete tasks (when user says delete, remove, cancel, "hatao", "delete karo")

  Guidelines:
  - Always confirm destructive actions ONCE before executing
  - Use "full_id" from list_tasks when calling delete/update/complete tools
  - When listing tasks, format them clearly with numbers (1, 2, 3...) - don't show UUIDs
  - If user intent is unclear, ask clarifying questions
  - Handle errors gracefully with helpful suggestions
  - Never expose technical error details or UUIDs to users

Tools: [add_task, list_tasks, complete_task, update_task, delete_task]
Max Tokens: 1024
Temperature: 0.3  # Lower for reliable tool calling
History Limit: 50 messages
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         /app/chat/page.tsx                              │ │
│  │  ┌──────────────────┐  ┌───────────────────┐  ┌────────────────────┐   │ │
│  │  │ ConversationList │  │   ChatContainer   │  │    MessageInput    │   │ │
│  │  │ (sidebar)        │  │   (OpenAI ChatKit)│  │    (user input)    │   │ │
│  │  └────────┬─────────┘  └─────────┬─────────┘  └──────────┬─────────┘   │ │
│  │           │                      │                       │              │ │
│  │           └──────────────────────┼───────────────────────┘              │ │
│  │                                  │                                       │ │
│  │                         ┌────────▼────────┐                             │ │
│  │                         │   chat-api.ts   │                             │ │
│  │                         │  (API client)   │                             │ │
│  │                         └────────┬────────┘                             │ │
│  └──────────────────────────────────┼──────────────────────────────────────┘ │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │ HTTP POST /api/{user_id}/chat
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (FastAPI)                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         /api/chat.py                                    │ │
│  │                    (Chat Endpoint Handler)                              │ │
│  │  1. Validate auth                                                       │ │
│  │  2. Load conversation history from DB                                   │ │
│  │  3. Store user message                                                  │ │
│  │  4. Run agent                                                           │ │
│  │  5. Store assistant response                                            │ │
│  │  6. Return response                                                     │ │
│  └─────────────────────────────────────┬───────────────────────────────────┘ │
│                                        │                                     │
│  ┌─────────────────────────────────────▼───────────────────────────────────┐ │
│  │                         /agent/runner.py                                │ │
│  │                    (OpenAI Agents SDK Runner)                           │ │
│  │  - Builds message array from history + new message                      │ │
│  │  - Executes agent with MCP tools                                        │ │
│  │  - Returns response + tool_calls                                        │ │
│  └─────────────────────────────────────┬───────────────────────────────────┘ │
│                                        │ Tool invocations                    │
│  ┌─────────────────────────────────────▼───────────────────────────────────┐ │
│  │                         /mcp/server.py                                  │ │
│  │                    (MCP Server with 5 Tools)                            │ │
│  │  ┌─────────┐ ┌───────────┐ ┌──────────────┐ ┌───────────┐ ┌───────────┐│ │
│  │  │add_task │ │list_tasks │ │complete_task │ │update_task│ │delete_task││ │
│  │  └────┬────┘ └─────┬─────┘ └──────┬───────┘ └─────┬─────┘ └─────┬─────┘│ │
│  │       │            │              │               │             │       │ │
│  │       └────────────┴──────────────┼───────────────┴─────────────┘       │ │
│  └───────────────────────────────────┼─────────────────────────────────────┘ │
│                                      │                                       │
│  ┌───────────────────────────────────▼─────────────────────────────────────┐ │
│  │                    /services/task_service.py                            │ │
│  │                    (Existing Phase II Service)                          │ │
│  │  - create_task(), get_tasks(), update_task()                            │ │
│  │  - toggle_complete(), delete_task()                                     │ │
│  └───────────────────────────────────┬─────────────────────────────────────┘ │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NEON DB (PostgreSQL)                           │
│  ┌─────────┐  ┌─────────┐  ┌───────────────┐  ┌──────────────┐             │
│  │  users  │  │  tasks  │  │ conversations │  │   messages   │             │
│  │ (Phase2)│  │ (Phase2)│  │   (Phase3)    │  │   (Phase3)   │             │
│  └─────────┘  └─────────┘  └───────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Quickstart for Developers

**Prerequisites**:
- Node.js 18+ with npm
- Python 3.13+ with uv
- PostgreSQL (via Neon DB account)
- OpenAI API key with Agents SDK access

**Setup Steps**:

1. Clone repository and checkout Phase III branch:
   ```bash
   git clone <repo-url>
   cd Todo-application
   git checkout 003-phase3-ai-chatbot
   ```

2. Frontend setup:
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   # Add: NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key
   npm run dev  # Starts on localhost:3000
   ```

3. Backend setup:
   ```bash
   cd backend
   uv pip install -r requirements.txt
   cp .env.example .env
   # Add: OPENAI_API_KEY=your-openai-key
   # Add: DATABASE_URL=your-neon-connection-string
   uvicorn src.main:app --reload  # Starts on localhost:8000
   ```

4. Database migrations (new tables):
   ```bash
   psql $DATABASE_URL < migrations/003_create_conversations.sql
   psql $DATABASE_URL < migrations/004_create_messages.sql
   ```

5. OpenAI Domain Allowlist (for production):
   - Deploy frontend to Vercel first
   - Go to https://platform.openai.com/settings/organization/security/domain-allowlist
   - Add your Vercel domain (e.g., `https://your-app.vercel.app`)
   - Get domain key and add to frontend .env

6. Run tests:
   ```bash
   # Backend tests
   cd backend && pytest

   # Frontend E2E tests
   cd frontend && npm run test:e2e
   ```

**Environment Variables**:

Frontend (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key
```

Backend (`.env`):
```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
OPENAI_API_KEY=sk-your-openai-api-key
AUTH_SECRET=random-64-char-string
CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
```

---

## Testing Strategy

### Test Coverage Goals
- **MCP Tools**: 100% coverage (all 5 tools, success and error paths)
- **Agent Behavior**: 90%+ coverage (intent recognition, tool selection)
- **E2E Chat Flows**: All 8 user stories covered (48 acceptance scenarios)
- **Integration**: Chat API, conversation persistence

### E2E Test Plan (Playwright)

**Test Suite 1: Chat Infrastructure**
- Send message, receive response
- Create new conversation
- Resume existing conversation
- Load conversation history
- Handle network errors

**Test Suite 2: Task Operations via Chat**
- Add task with title only
- Add task with title + description
- Add multiple tasks in one message
- List all tasks
- List pending tasks only
- List completed tasks only
- Complete task by ID
- Uncomplete task
- Update task title
- Update task description
- Delete task by ID

**Test Suite 3: Natural Language Understanding**
- Understand "add", "create", "remember" for task creation
- Understand "show", "list", "what's" for listing
- Understand "done", "finished", "complete" for completion
- Understand "change", "update", "rename" for updates
- Understand "delete", "remove", "cancel" for deletion
- Handle ambiguous commands with clarification

**Test Suite 4: Error Handling**
- Empty message handling
- Invalid task ID handling
- Task not found handling
- Validation error handling (title too long)
- Network timeout handling

### Integration Test Plan (Pytest)

**MCP Tool Tests**:
- `test_add_task_success`
- `test_add_task_title_too_long`
- `test_list_tasks_all`
- `test_list_tasks_pending_only`
- `test_complete_task_success`
- `test_complete_task_not_found`
- `test_update_task_title`
- `test_delete_task_success`
- `test_delete_task_wrong_user`

**Chat API Tests**:
- `test_chat_creates_conversation`
- `test_chat_resumes_conversation`
- `test_chat_stores_messages`
- `test_chat_requires_auth`
- `test_chat_user_isolation`

---

## Non-Functional Requirements

### Performance
- **Chat Response**: < 5 seconds for 95% of requests (includes OpenAI API latency)
- **Conversation Load**: < 2 seconds for up to 100 messages
- **Concurrent Sessions**: Support 100 simultaneous chat users

### Reliability
- **Stateless**: Server restart loses no data (all state in database)
- **Horizontal Scaling**: Any backend instance can handle any request
- **Error Recovery**: All errors return user-friendly messages

### Security
- **Auth**: Better Auth session cookies (same as Phase II)
- **User Isolation**: user_id enforced on all MCP tools
- **API Key**: OPENAI_API_KEY server-side only, never exposed
- **Domain Allowlist**: ChatKit restricted to configured domains

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **OpenAI API rate limits** | Chat slowdowns | Medium | Implement retry with exponential backoff |
| **ChatKit domain allowlist issues** | Frontend can't load | Low | Test deployment workflow early |
| **Agent misunderstanding intent** | Poor UX | Medium | Comprehensive prompt engineering, fallback to clarification |
| **MCP tool errors** | Failed operations | Low | Defensive coding, structured error handling |
| **Context token limits** | Long conversations fail | Medium | Limit history to 50 messages |
| **Neon DB connection limits** | API failures | Low | Connection pooling (reuse Phase II config) |

---

## Success Criteria

Phase 3 is complete when:

✅ Chat interface loads and accepts user messages
✅ AI responds with contextual, helpful messages
✅ All 5 MCP tools work correctly (add, list, complete, update, delete)
✅ Conversation history persists across sessions
✅ Server is stateless (survives restart without data loss)
✅ All 48 acceptance scenarios pass as tests
✅ Phase II web UI continues to work (no regression)
✅ Authentication shared between web UI and chat
✅ E2E test coverage for all 8 user stories
✅ MCP tools have 100% test coverage
✅ Demo video recorded (<90 seconds)
✅ Deployed to Vercel with ChatKit domain allowlist configured
✅ PHRs created for planning and implementation sessions

**Next Steps**: Run `/sp.tasks` to generate task breakdown (tasks.md)
