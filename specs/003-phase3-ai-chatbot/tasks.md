---
description: "Phase III AI-Powered Todo Chatbot - Task Breakdown"
---

# Tasks: Phase III AI-Powered Todo Chatbot

**Input**: Design documents from `/specs/003-phase3-ai-chatbot/`
**Prerequisites**: plan.md, spec.md
**Branch**: `003-phase3-ai-chatbot`

**Tests**: TDD approach with Pytest (backend) and Playwright (E2E) tests

**Organization**: Tasks grouped by execution phase (EXEC-01 through EXEC-09) to enable structured implementation

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US8)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/`
- **Backend**: `backend/src/`
- **Tests**: `frontend/tests/e2e/`, `backend/tests/`
- **Migrations**: `backend/migrations/`

---

## EXEC-01: Database Schema (Conversations & Messages Tables) [COMPLETE]

**Purpose**: Create database tables for storing chat conversations and messages

**Status**: COMPLETE

**Files Created**:
- `backend/migrations/003_create_conversations.sql`
- `backend/migrations/004_create_messages.sql`
- `backend/src/models/conversation.py`
- `backend/src/models/message.py`
- `backend/src/models/__init__.py` (updated)

### Tasks

- [x] EXEC-01-T001 Create SQL migration for conversations table (`backend/migrations/003_create_conversations.sql`)
  - Fields: id (SERIAL PK), user_id (UUID FK), created_at, updated_at
  - Index on user_id for efficient queries
  - Foreign key to users table with ON DELETE CASCADE

- [x] EXEC-01-T002 Create SQL migration for messages table (`backend/migrations/004_create_messages.sql`)
  - Fields: id (SERIAL PK), conversation_id (INT FK), user_id (UUID FK), role (ENUM), content (TEXT), tool_calls (JSONB), created_at
  - Index on (conversation_id, created_at) for conversation history queries
  - Index on user_id for user isolation

- [x] EXEC-01-T003 Create Conversation SQLModel in `backend/src/models/conversation.py`
  - Typed fields matching migration schema
  - Relationship to User model
  - created_at/updated_at with default timestamps

- [x] EXEC-01-T004 Create Message SQLModel in `backend/src/models/message.py`
  - Typed fields matching migration schema
  - Role enum (user/assistant)
  - JSONB tool_calls field for storing MCP tool invocations
  - Relationship to Conversation model

- [x] EXEC-01-T005 Update `backend/src/models/__init__.py` to export new models

**Acceptance Criteria**:
- Conversations table created with proper indexes
- Messages table created with proper indexes and foreign keys
- SQLModel classes match database schema exactly
- Models importable from `backend.src.models`

---

## EXEC-02: MCP Server Setup [COMPLETE]

**Purpose**: Initialize MCP server infrastructure with Official MCP SDK

**Status**: COMPLETE

**Files Created**:
- `backend/src/mcp/__init__.py`
- `backend/src/mcp/server.py`
- `backend/src/mcp/types.py`
- `backend/src/mcp/validators.py`
- `backend/src/mcp/README.md`
- `backend/src/mcp/tools/__init__.py`
- `backend/src/mcp/tools/base.py`

### Tasks

- [x] EXEC-02-T001 Create MCP module structure (`backend/src/mcp/`)
  - `__init__.py` with module exports
  - `server.py` for MCP server setup
  - `types.py` for shared type definitions
  - `validators.py` for input validation utilities

- [x] EXEC-02-T002 Implement MCP server initialization in `backend/src/mcp/server.py`
  - Server configuration with tool registry
  - In-process communication pattern (no separate service)
  - Tool execution dispatcher

- [x] EXEC-02-T003 Create base tool class in `backend/src/mcp/tools/base.py`
  - Abstract tool interface
  - Common error handling patterns
  - Structured response format (success/error)

- [x] EXEC-02-T004 Define MCP types in `backend/src/mcp/types.py`
  - ToolInput base class
  - ToolOutput with status codes
  - Error taxonomy (VALIDATION_ERROR, NOT_FOUND, INTERNAL_ERROR)

- [x] EXEC-02-T005 Implement validation utilities in `backend/src/mcp/validators.py`
  - Title validation (1-100 chars)
  - Description validation (0-500 chars)
  - UUID validation for task_id

**Acceptance Criteria**:
- MCP server can be instantiated without errors
- Tool registration mechanism working
- Validation utilities tested and working
- Types importable from `backend.src.mcp.types`

---

## EXEC-03: MCP Tools Implementation (5 Tools) [COMPLETE]

**Purpose**: Implement all 5 MCP tools for task operations (FR-015 to FR-021)

**Status**: COMPLETE

**Files Created**:
- `backend/src/mcp/tools/add_task.py`
- `backend/src/mcp/tools/list_tasks.py`
- `backend/src/mcp/tools/complete_task.py`
- `backend/src/mcp/tools/update_task.py`
- `backend/src/mcp/tools/delete_task.py`
- `backend/tests/integration/test_mcp_tools.py`

### Tasks

- [x] EXEC-03-T001 [P] Implement `add_task` tool in `backend/src/mcp/tools/add_task.py`
  - Parameters: user_id (required), title (required), description (optional)
  - Validates title (1-100 chars), description (0-500 chars)
  - Returns: task_id, status="created", title
  - Uses TaskService.create_task()

- [x] EXEC-03-T002 [P] Implement `list_tasks` tool in `backend/src/mcp/tools/list_tasks.py`
  - Parameters: user_id (required), status filter (all/pending/completed)
  - Returns: tasks array with id, title, description, status, created_at
  - Uses TaskService.get_tasks_by_user()

- [x] EXEC-03-T003 [P] Implement `complete_task` tool in `backend/src/mcp/tools/complete_task.py`
  - Parameters: user_id (required), task_id (required), completed (boolean)
  - Validates user owns the task
  - Returns: task_id, status="completed"/"uncompleted", title
  - Uses TaskService.toggle_completion()

- [x] EXEC-03-T004 [P] Implement `update_task` tool in `backend/src/mcp/tools/update_task.py`
  - Parameters: user_id (required), task_id (required), title (optional), description (optional)
  - Validates user owns the task
  - Returns: task_id, status="updated", title
  - Uses TaskService.update_task()

- [x] EXEC-03-T005 [P] Implement `delete_task` tool in `backend/src/mcp/tools/delete_task.py`
  - Parameters: user_id (required), task_id (required)
  - Validates user owns the task
  - Returns: task_id, status="deleted", title
  - Uses TaskService.delete_task()

- [x] EXEC-03-T006 Create integration tests for all MCP tools in `backend/tests/integration/test_mcp_tools.py`
  - Test success cases for all 5 tools
  - Test validation errors (title too long, invalid task_id)
  - Test authorization errors (user doesn't own task)
  - Test NOT_FOUND errors

**Acceptance Criteria**:
- All 5 MCP tools callable and return structured responses
- User ownership validated on all operations
- Validation rules match Phase I/II (title 1-100, description 0-500)
- All tools are stateless (no server-side state)
- Integration tests pass for all tools

---

## EXEC-04: OpenAI Agent Integration [COMPLETE]

**Purpose**: Integrate OpenAI Agents SDK with MCP tools for natural language understanding

**Status**: COMPLETE

**Files Created**:
- `backend/src/agent/__init__.py`
- `backend/src/agent/config.py`
- `backend/src/agent/todo_agent.py`
- `backend/src/agent/runner.py`

### Tasks

- [x] EXEC-04-T001 Create agent configuration in `backend/src/agent/config.py`
  - OPENAI_API_KEY from environment variable
  - Agent model selection (gpt-4o or equivalent)
  - Temperature and max_tokens settings
  - System prompt for TodoAssistant

- [x] EXEC-04-T002 Implement TodoAssistant agent in `backend/src/agent/todo_agent.py`
  - Agent name: "TodoAssistant"
  - System prompt defining capabilities and guidelines
  - Register all 5 MCP tools with agent
  - Define tool schemas for OpenAI function calling

- [x] EXEC-04-T003 Implement agent runner in `backend/src/agent/runner.py`
  - `run_agent(user_id, message, history)` function
  - Builds message array from conversation history
  - Executes agent with registered tools
  - Returns response text and tool_calls array
  - Handles OpenAI API errors gracefully

- [x] EXEC-04-T004 Create agent module exports in `backend/src/agent/__init__.py`
  - Export run_agent function
  - Export agent configuration

**Acceptance Criteria**:
- Agent responds to natural language with appropriate tool calls
- Agent understands variations of task commands (add, create, remember, etc.)
- Agent asks clarifying questions when intent is ambiguous
- Agent provides user-friendly error messages
- OpenAI API key properly loaded from environment

---

## EXEC-05: Chat API Endpoint [COMPLETE]

**Purpose**: Create REST API endpoints for chat functionality (FR-001 to FR-005)

**Status**: COMPLETE

**Files Created**:
- `backend/src/api/chat.py`

### Tasks

- [x] EXEC-05-T001 Implement POST /api/{user_id}/chat endpoint in `backend/src/api/chat.py`
  - Request body: { conversation_id?: int, message: string }
  - Creates new conversation if conversation_id not provided
  - Stores user message in database
  - Calls agent runner with message and history
  - Stores assistant response in database
  - Returns: { conversation_id, response, tool_calls }

- [x] EXEC-05-T002 Implement GET /api/{user_id}/conversations endpoint
  - Returns list of user's conversations
  - Includes: id, created_at, updated_at, message_count, last_message_preview
  - Ordered by updated_at descending

- [x] EXEC-05-T003 Implement GET /api/{user_id}/conversations/{conversation_id}/messages endpoint
  - Query params: limit (default 50, max 100), offset (default 0)
  - Returns: { messages: [...], total, has_more }
  - Messages include: id, role, content, tool_calls, created_at
  - Validates user owns the conversation

- [x] EXEC-05-T004 Add authentication middleware to chat endpoints
  - Reuse Better Auth session validation from Phase II
  - Validate user_id in path matches authenticated user
  - Return 401 for unauthenticated requests

- [x] EXEC-05-T005 Add chat routes to FastAPI app in `backend/src/main.py`
  - Register chat router with /api prefix
  - Include in OpenAPI documentation

**Acceptance Criteria**:
- Chat endpoint accepts messages and returns AI responses
- Conversations endpoint lists user's chat sessions
- Messages endpoint returns paginated history
- All endpoints require authentication
- User isolation enforced (users only see their own data)

---

## EXEC-06: Chat Service Layer [COMPLETE]

**Purpose**: Create service layer for chat orchestration and database operations

**Status**: COMPLETE

**Files Created**:
- `backend/src/services/chat_service.py`

### Tasks

- [x] EXEC-06-T001 Create ChatService class in `backend/src/services/chat_service.py`
  - Dependency injection for database session
  - Methods for conversation CRUD
  - Methods for message CRUD

- [x] EXEC-06-T002 Implement `process_message(user_id, message, conversation_id?)` method
  - Creates or retrieves conversation
  - Loads conversation history (last 50 messages)
  - Stores user message
  - Calls agent runner
  - Stores assistant response with tool_calls
  - Returns ChatResponse object

- [x] EXEC-06-T003 Implement `get_conversations(user_id)` method
  - Query conversations by user_id
  - Calculate message_count per conversation
  - Extract last_message_preview (first 100 chars)
  - Order by updated_at descending

- [x] EXEC-06-T004 Implement `get_messages(user_id, conversation_id, limit, offset)` method
  - Validate user owns conversation
  - Query messages with pagination
  - Return messages with total count and has_more flag

- [x] EXEC-06-T005 Add error handling for database operations
  - Catch connection errors with retry logic
  - Return structured errors for service layer
  - Log errors for debugging

**Acceptance Criteria**:
- ChatService provides clean interface for chat operations
- Conversation history properly loaded for agent context
- Messages persisted to database atomically
- User isolation enforced at service layer
- Errors handled gracefully with retries

---

## EXEC-07: Frontend Chat Components [COMPLETE]

**Purpose**: Create React components for chat interface (FR-001 to FR-005)

**Status**: COMPLETE

**Files Created**:
- `frontend/components/chat/index.ts`
- `frontend/components/chat/ChatContainer.tsx`
- `frontend/components/chat/ChatDrawer.tsx`
- `frontend/components/chat/MessageList.tsx`
- `frontend/components/chat/MessageInput.tsx`
- `frontend/components/chat/MessageBubble.tsx`
- `frontend/components/chat/ConversationList.tsx`
- `frontend/components/chat/LoadingIndicator.tsx`
- `frontend/components/chat/ErrorMessage.tsx`
- `frontend/components/chat/TaskPreview.tsx`
- `frontend/lib/hooks/useChatMessages.ts`
- `frontend/lib/hooks/useConversations.ts`
- `frontend/lib/context/ChatContext.tsx`

### Tasks

- [x] EXEC-07-T001 Create ChatContainer component in `frontend/components/chat/ChatContainer.tsx`
  - Layout wrapper for chat interface
  - Manages conversation state
  - Handles send message action
  - Shows loading state during API calls

- [x] EXEC-07-T002 Create MessageList component in `frontend/components/chat/MessageList.tsx`
  - Displays conversation messages
  - Auto-scrolls to latest message
  - Shows loading state while fetching history
  - Handles empty state (no messages)

- [x] EXEC-07-T003 Create MessageInput component in `frontend/components/chat/MessageInput.tsx`
  - Text input for user messages
  - Send button with loading state
  - Enter key to send (Shift+Enter for newline)
  - Disabled during message sending

- [x] EXEC-07-T004 Create ConversationList component in `frontend/components/chat/ConversationList.tsx`
  - Sidebar listing user's conversations
  - Shows last message preview
  - Click to select conversation
  - "New Chat" button to start fresh conversation

- [x] EXEC-07-T005 [P] Create MessageBubble component in `frontend/components/chat/MessageBubble.tsx`
  - Displays single message with role indicator
  - User messages on right, assistant on left
  - Timestamp display
  - Different styling for user vs assistant

- [x] EXEC-07-T006 [P] Create LoadingIndicator component in `frontend/components/chat/LoadingIndicator.tsx`
  - Typing indicator animation
  - Shows while waiting for AI response
  - Accessible loading text

- [x] EXEC-07-T007 [P] Create ErrorMessage component in `frontend/components/chat/ErrorMessage.tsx`
  - Displays error messages inline
  - Retry button for failed operations
  - Dismissable with X button

- [x] EXEC-07-T008 Create useChatMessages hook in `frontend/lib/hooks/useChatMessages.ts`
  - Fetches messages for a conversation
  - SWR for data fetching and caching
  - Handles loading and error states
  - Supports optimistic updates

- [x] EXEC-07-T009 Create useConversations hook in `frontend/lib/hooks/useConversations.ts`
  - Fetches user's conversations
  - SWR for data fetching and caching
  - Handles loading and error states
  - Supports mutation after new conversation

**Acceptance Criteria**:
- All chat components render correctly
- Messages display with proper role distinction
- Input handles keyboard shortcuts
- Loading states shown during API calls
- Error states handle gracefully
- Hooks provide clean data fetching interface

---

## EXEC-08: Frontend Integration (Chat Page & API Client) [COMPLETE]

**Purpose**: Integrate chat components into Next.js app with routing and API client

**Status**: COMPLETE

**Files Created**:
- `frontend/app/chat/page.tsx`
- `frontend/lib/chat-api.ts`
- Navigation updates to dashboard/page.tsx

### Tasks

- [x] EXEC-08-T001 Create chat page in `frontend/app/chat/page.tsx`
  - Protected route (requires authentication)
  - Layout with ConversationList sidebar + ChatContainer main area
  - URL state for conversation_id (/chat?conversation=123)
  - Suspense boundary for useSearchParams

- [x] EXEC-08-T002 Create chat API client in `frontend/lib/chat-api.ts`
  - `sendMessage(message, conversationId?)` - POST /api/chat
  - `getConversations()` - GET /api/chat/conversations
  - `getMessages(conversationId, limit, offset)` - GET /api/chat/conversations/{id}/messages
  - Error handling with typed ChatApiError class
  - Auth token handling via cookies

- [x] EXEC-08-T003 [P] Add navigation link to chat in dashboard
  - "AI Chat" link in dashboard header navigation
  - Consistent styling with existing UI (yellow accent)
  - Only visible when authenticated

- [x] EXEC-08-T004 [P] Add navigation link to dashboard from chat
  - "Dashboard" link in chat page header
  - Maintains conversation context via URL

- [x] EXEC-08-T005 Implement conversation switching in chat page
  - Click conversation in sidebar to switch
  - Load messages for selected conversation
  - Update URL with conversation_id
  - Handle "New Chat" action via createConversation

- [x] EXEC-08-T006 Implement real-time message sending flow
  - User types message and presses Enter/Send
  - Optimistic UI update via useChatMessages hook
  - Call API and wait for response
  - Show assistant response when received
  - Handle errors with retry option

- [x] EXEC-08-T007 Style chat page with TailwindCSS
  - Consistent black/yellow theme with dashboard
  - Responsive layout with flex containers
  - Loading animations (bouncing dots)
  - Accessible link styling

**Acceptance Criteria**:
- [x] Chat page accessible at /chat route
- [x] Requires authentication (redirects to login if not authenticated)
- [x] API client handles all chat endpoints
- [x] Navigation between dashboard and chat working
- [x] Conversation switching updates messages
- [x] Message sending shows optimistic UI
- [x] Frontend builds successfully

---

## EXEC-09: Testing (E2E & Integration) [COMPLETE]

**Purpose**: Comprehensive test coverage for Phase III functionality

**Status**: COMPLETE

**Files Created**:
- `frontend/tests/e2e/chat.spec.ts`
- `backend/tests/unit/test_agent.py`
- `backend/tests/unit/test_chat_service.py`
- `backend/tests/unit/test_mcp_server.py`
- `backend/tests/unit/test_conversation_model.py`
- `backend/tests/unit/test_message_model.py`
- `backend/tests/integration/test_chat.py`
- `backend/tests/integration/test_mcp_tools.py`

### E2E Tests (Playwright) - Chat Infrastructure

- [X] EXEC-09-T001 [P] E2E test: Chat page renders with authentication in `frontend/tests/e2e/chat.spec.ts`
- [X] EXEC-09-T002 [P] E2E test: Unauthenticated user redirected to login
- [X] EXEC-09-T003 [P] E2E test: Send message and receive AI response
- [X] EXEC-09-T004 [P] E2E test: Create new conversation
- [X] EXEC-09-T005 [P] E2E test: Resume existing conversation
- [X] EXEC-09-T006 [P] E2E test: Conversation list displays correctly
- [X] EXEC-09-T007 [P] E2E test: Switch between conversations
- [X] EXEC-09-T008 [P] E2E test: Message history loads on conversation select

### E2E Tests (Playwright) - Task Operations via Chat

- [X] EXEC-09-T009 [P] E2E test: Add task via natural language ("Add a task to buy groceries")
- [X] EXEC-09-T010 [P] E2E test: List tasks via natural language ("Show me my tasks")
- [X] EXEC-09-T011 [P] E2E test: Complete task via natural language ("Mark task X as done")
- [X] EXEC-09-T012 [P] E2E test: Update task via natural language ("Change task X to...")
- [X] EXEC-09-T013 [P] E2E test: Delete task via natural language ("Delete task X")
- [X] EXEC-09-T014 [P] E2E test: Natural language variations understood (add, create, remember)

### E2E Tests (Playwright) - Error Handling

- [X] EXEC-09-T015 [P] E2E test: Empty message shows validation error
- [X] EXEC-09-T016 [P] E2E test: Network error shows retry option
- [X] EXEC-09-T017 [P] E2E test: Invalid task ID shows helpful error
- [X] EXEC-09-T018 [P] E2E test: Ambiguous command prompts clarification

### Unit Tests (Pytest) - Agent Behavior

- [X] EXEC-09-T019 [P] Unit test: Agent selects correct tool for "add task" in `backend/tests/unit/test_agent.py`
- [X] EXEC-09-T020 [P] Unit test: Agent selects correct tool for "list tasks"
- [X] EXEC-09-T021 [P] Unit test: Agent selects correct tool for "complete task"
- [X] EXEC-09-T022 [P] Unit test: Agent selects correct tool for "update task"
- [X] EXEC-09-T023 [P] Unit test: Agent selects correct tool for "delete task"
- [X] EXEC-09-T024 [P] Unit test: Agent asks clarification for ambiguous input
- [X] EXEC-09-T025 [P] Unit test: Agent handles tool errors gracefully

### Integration Tests (Pytest) - Chat API

- [X] EXEC-09-T026 [P] Integration test: POST /chat creates conversation in `backend/tests/integration/test_chat.py`
- [X] EXEC-09-T027 [P] Integration test: POST /chat resumes existing conversation
- [X] EXEC-09-T028 [P] Integration test: GET /conversations returns user's conversations
- [X] EXEC-09-T029 [P] Integration test: GET /messages returns paginated messages
- [X] EXEC-09-T030 [P] Integration test: Chat endpoints require authentication
- [X] EXEC-09-T031 [P] Integration test: User isolation (can't access other user's conversations)

**Acceptance Criteria**:
- All E2E tests pass for chat infrastructure
- All E2E tests pass for task operations via chat
- All E2E tests pass for error handling
- All unit tests pass for agent behavior
- All integration tests pass for chat API
- Test coverage meets targets (100% MCP tools, 80%+ business logic)

---

## Dependencies & Execution Order

### Phase Dependencies

```
EXEC-01 (Database Schema) → EXEC-02 (MCP Server Setup) → EXEC-03 (MCP Tools)
                                                                  ↓
EXEC-04 (OpenAI Agent) → EXEC-05 (Chat API) → EXEC-06 (Chat Service)
                                                      ↓
EXEC-07 (Frontend Components) → EXEC-08 (Frontend Integration) → EXEC-09 (Testing)
```

### Completed vs Pending

**All EXEC Phases Complete (EXEC-01 through EXEC-09)**:
- EXEC-01: Database schema with conversations and messages tables
- EXEC-02: MCP server infrastructure with Official MCP SDK
- EXEC-03: 5 MCP tools (add, list, complete, update, delete)
- EXEC-04: OpenAI Agent integration with natural language understanding
- EXEC-05: Chat API endpoints (POST /chat, GET /conversations, GET /messages)
- EXEC-06: Chat service layer with process_message orchestration
- EXEC-07: Frontend chat components (ChatContainer, MessageList, MessageInput, etc.)
- EXEC-08: Frontend chat page integration (/chat route), API client, navigation
- EXEC-09: Comprehensive E2E tests (Playwright) and unit/integration tests (Pytest)

**Pending**: None - Phase III implementation complete

### Parallel Opportunities

Within EXEC-08:
```
# Can run in parallel:
EXEC-08-T003 (Navigation to chat), EXEC-08-T004 (Navigation to dashboard)
```

Within EXEC-09:
```
# All E2E tests can run in parallel:
EXEC-09-T001 through EXEC-09-T018

# All unit tests can run in parallel:
EXEC-09-T019 through EXEC-09-T025

# All integration tests can run in parallel:
EXEC-09-T026 through EXEC-09-T031
```

---

## Success Criteria

Phase III is complete when:

- [x] Database schema for conversations and messages created
- [x] MCP server with 5 tools implemented and tested
- [x] OpenAI Agent integration working with tool selection
- [x] Chat API endpoints implemented with authentication
- [x] Chat service layer orchestrating agent execution
- [x] Frontend chat components created
- [x] Chat page accessible at /chat route
- [x] API client handles all chat operations
- [x] Navigation between dashboard and chat working
- [x] All E2E tests pass (48 acceptance scenarios from spec)
- [x] All MCP tools have 100% test coverage
- [x] Stateless architecture verified (survives server restart)
- [x] Phase II web UI continues to work (no regression)
- [x] Demo video recorded (<90 seconds)
- [x] PHRs created for implementation sessions

---

## Notes

- **Total Tasks**: 77 tasks across 9 execution phases
- **Completed**: 77/77 tasks (EXEC-01 through EXEC-09) - **ALL COMPLETE**
- **Test Strategy**: TDD with Pytest (backend) and Playwright (E2E)
- **E2E Test Coverage**: 31 scenarios covering all 8 user stories
- **Tech Stack**: Next.js 15+, FastAPI, OpenAI Agents SDK, Official MCP SDK, Neon PostgreSQL
- **Stateless Architecture**: All state persisted in database, no server-side session state
- **Performance Target**: Chat response < 5 seconds for 95% of requests
- **Multi-language Support**: Urdu language support added (+100 bonus points)
- **Agent Configuration**: gpt-4o model with temperature 0.3 for reliable tool calling

**Phase III Status**: COMPLETE - Ready for Phase IV (Kubernetes)
