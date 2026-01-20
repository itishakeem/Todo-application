# Feature Specification: Phase III AI-Powered Todo Chatbot

**Feature Branch**: `003-phase3-ai-chatbot`
**Created**: 2026-01-12
**Status**: Draft
**Input**: User description: "Phase III AI-powered Todo Chatbot with MCP server and OpenAI Agents SDK - Create conversational interface for managing todos through natural language"

---

## Overview

Phase III transforms the Phase II web application into an AI-powered conversational interface. Users can manage their todo items through natural language commands instead of traditional UI interactions. The chatbot understands user intent, translates natural language into task operations, and provides helpful, conversational responses.

**Key Objectives**:
1. Enable natural language task management (add, list, complete, update, delete)
2. Maintain conversation context across multiple interactions
3. Preserve all Phase I/II functionality (CRUD operations work identically)
4. Implement stateless architecture for horizontal scalability

**Scope Boundaries**:
- **In Scope**: Basic Level features via natural language (5 CRUD operations)
- **Out of Scope**: Intermediate/Advanced features (due dates, priorities, recurring tasks, reminders) - deferred to Phase V
- **Out of Scope**: Voice input - deferred to bonus features
- **Out of Scope**: Multi-language support beyond English - deferred to bonus features

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send Chat Message and Receive AI Response (Priority: P1)

As a user, I want to send a natural language message to the chatbot and receive an intelligent response so that I can interact with my todo list conversationally.

**Why this priority**: This is the foundational capability - without message send/receive, no other chatbot features work. This establishes the core communication channel between user and AI.

**Independent Test**: Can be fully tested by typing any message in the chat interface and verifying a contextual response appears. Delivers immediate value by enabling human-AI conversation.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the chat interface, **When** user types "Hello" and sends the message, **Then** the AI responds with a friendly greeting within 3 seconds
2. **Given** a logged-in user, **When** user sends a message, **Then** the message appears in the conversation thread with a "user" label
3. **Given** a user message sent, **When** the AI generates a response, **Then** the response appears in the conversation thread with an "assistant" label
4. **Given** a conversation in progress, **When** user sends a new message, **Then** both the user message and AI response are persisted to the database
5. **Given** a user with existing conversation history, **When** user returns to the chat, **Then** previous messages are displayed (conversation continuity)
6. **Given** a network error during message send, **When** the request fails, **Then** user sees an error message and can retry

---

### User Story 2 - Add Task via Natural Language (Priority: P1)

As a user, I want to create new tasks by typing natural phrases like "Add a task to buy groceries" so that I don't need to navigate forms or click buttons.

**Why this priority**: Task creation is the most fundamental todo operation. Without it, the chatbot cannot help users manage their work.

**Independent Test**: Can be fully tested by saying "Add a task to [task name]" and verifying the task appears in the user's task list via the web dashboard or subsequent "show my tasks" command.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** user says "Add a task to buy groceries", **Then** a task with title "Buy groceries" is created and AI confirms "I've added 'Buy groceries' to your list"
2. **Given** a user, **When** user says "I need to remember to call mom", **Then** a task with title "Call mom" is created (AI understands intent variations)
3. **Given** a user, **When** user says "Add task buy milk with description get 2% from Costco", **Then** task is created with title "Buy milk" and description "Get 2% from Costco"
4. **Given** a user, **When** user says "Create tasks: call dentist, pay bills, clean room", **Then** three separate tasks are created and AI confirms all three
5. **Given** a user, **When** user provides a title exceeding 100 characters, **Then** AI responds with a friendly error asking for a shorter title
6. **Given** a user, **When** user says "Add a task" without specifying what, **Then** AI asks "What would you like to add?" (clarifying question)

---

### User Story 3 - List Tasks via Natural Language (Priority: P1)

As a user, I want to view my tasks by asking "Show me my tasks" so that I can see what I need to do without navigating to a separate page.

**Why this priority**: Viewing tasks is essential for task management. Users need to see their work before they can complete, update, or delete it.

**Independent Test**: Can be fully tested by having existing tasks and saying "Show my tasks" - the AI should list all tasks with their IDs, titles, and status.

**Acceptance Scenarios**:

1. **Given** a user with 3 pending tasks, **When** user says "Show me my tasks", **Then** AI lists all 3 tasks with task IDs, titles, and status (pending/completed)
2. **Given** a user with mixed tasks, **When** user says "What's pending?", **Then** AI shows only pending tasks
3. **Given** a user with completed tasks, **When** user says "What have I completed?", **Then** AI shows only completed tasks
4. **Given** a user with no tasks, **When** user says "Show my tasks", **Then** AI responds "You don't have any tasks yet. Would you like to add one?"
5. **Given** a user with 10+ tasks, **When** user says "List all tasks", **Then** AI presents tasks in a readable format (numbered list)
6. **Given** a user, **When** user says "How many tasks do I have?", **Then** AI responds with count (e.g., "You have 5 tasks: 3 pending, 2 completed")

---

### User Story 4 - Mark Task Complete via Natural Language (Priority: P2)

As a user, I want to mark tasks as complete by saying "Mark task 3 as done" so that I can track my progress conversationally.

**Why this priority**: Completing tasks is the core value proposition of a todo app. This enables users to feel accomplishment and track progress.

**Independent Test**: Can be fully tested by having a pending task, saying "complete task [ID]", and verifying the task status changes to completed.

**Acceptance Scenarios**:

1. **Given** a user with task ID 5 pending, **When** user says "Mark task 5 as complete", **Then** task status changes to completed and AI confirms "Done! 'Buy groceries' is now complete"
2. **Given** a user with a completed task, **When** user says "Uncomplete task 5", **Then** task reverts to pending status
3. **Given** a user, **When** user says "I finished the grocery task", **Then** AI identifies the task by keyword and marks it complete (fuzzy matching)
4. **Given** a user with no matching task, **When** user says "Complete task 999", **Then** AI responds "I couldn't find task 999. Would you like to see your tasks?"
5. **Given** a user, **When** user says "Done with everything", **Then** AI asks for clarification "Which task would you like to mark as complete?"
6. **Given** a user, **When** user says "Mark all tasks complete", **Then** AI confirms before bulk action "Are you sure you want to complete all 5 tasks?"

---

### User Story 5 - Update Task via Natural Language (Priority: P2)

As a user, I want to modify task details by saying "Change task 3 title to 'Call mom tonight'" so that I can fix mistakes or add details conversationally.

**Why this priority**: Users often need to correct typos or add context to tasks. This keeps the todo list accurate and useful.

**Independent Test**: Can be fully tested by having an existing task, saying "change task [ID] to [new title]", and verifying the task title updates.

**Acceptance Scenarios**:

1. **Given** a task with ID 2 titled "Buy groceries", **When** user says "Change task 2 to 'Buy groceries and fruits'", **Then** title updates and AI confirms the change
2. **Given** a task, **When** user says "Add description to task 2: organic items only", **Then** description is added/updated
3. **Given** a task, **When** user says "Rename the grocery task to 'Shopping trip'", **Then** AI identifies by keyword and updates (fuzzy matching)
4. **Given** no matching task, **When** user says "Update task 999", **Then** AI responds with helpful error
5. **Given** a user, **When** user says "Update task 2" without new content, **Then** AI asks "What would you like to change about this task?"
6. **Given** a new title exceeding 100 characters, **When** user tries to update, **Then** AI explains the character limit

---

### User Story 6 - Delete Task via Natural Language (Priority: P2)

As a user, I want to remove tasks by saying "Delete task 4" so that I can clean up my list conversationally.

**Why this priority**: Users need to remove outdated or mistaken tasks. This keeps the todo list clean and manageable.

**Independent Test**: Can be fully tested by having an existing task, saying "delete task [ID]", and verifying the task is removed from the list.

**Acceptance Scenarios**:

1. **Given** a task with ID 4, **When** user says "Delete task 4", **Then** task is removed and AI confirms "I've deleted 'Old task' from your list"
2. **Given** a user, **When** user says "Remove the meeting task", **Then** AI identifies by keyword and deletes (fuzzy matching)
3. **Given** no matching task, **When** user says "Delete task 999", **Then** AI responds "I couldn't find task 999"
4. **Given** multiple tasks matching keyword, **When** user says "Delete the call task", **Then** AI asks for clarification with task IDs
5. **Given** a user, **When** user says "Delete all completed tasks", **Then** AI confirms before bulk action "This will delete 3 completed tasks. Are you sure?"
6. **Given** a user, **When** user says "Clear my list", **Then** AI asks for confirmation before deleting everything

---

### User Story 7 - Conversation Context and History (Priority: P3)

As a user, I want the chatbot to remember our conversation history so that I can reference previous messages and the AI understands context.

**Why this priority**: Context makes conversations feel natural. Users shouldn't need to repeat information the AI already knows.

**Independent Test**: Can be fully tested by having a multi-turn conversation, closing the browser, returning later, and verifying previous messages are visible.

**Acceptance Scenarios**:

1. **Given** a user who added "Buy milk" in a previous message, **When** user says "Actually, make that 'Buy 2% milk'", **Then** AI understands the reference and updates the most recent task
2. **Given** a conversation with 10 messages, **When** user returns after closing browser, **Then** all 10 messages are displayed
3. **Given** a server restart, **When** user sends a new message, **Then** conversation continues seamlessly (stateless architecture)
4. **Given** a user, **When** user says "What did I just add?", **Then** AI recalls the last created task from context
5. **Given** a user, **When** user starts a new conversation, **Then** previous conversation is preserved but a fresh context begins
6. **Given** a user with multiple conversations, **When** user views conversation list, **Then** they can select and resume any conversation

---

### User Story 8 - Error Handling and Recovery (Priority: P3)

As a user, I want the chatbot to handle errors gracefully and guide me to success so that I never feel stuck or confused.

**Why this priority**: Errors are inevitable. Good error handling prevents user frustration and builds trust in the system.

**Independent Test**: Can be fully tested by intentionally triggering errors (invalid input, network issues) and verifying helpful recovery guidance.

**Acceptance Scenarios**:

1. **Given** an ambiguous command, **When** user says "Do the thing", **Then** AI asks clarifying questions with examples
2. **Given** a network timeout, **When** the request fails, **Then** user sees "Something went wrong. Please try again" with a retry option
3. **Given** an invalid task ID format, **When** user says "Complete task abc", **Then** AI explains "Task IDs are numbers. Try 'complete task 5'"
4. **Given** the AI doesn't understand intent, **When** user sends gibberish, **Then** AI responds "I'm not sure what you mean. Here's what I can help with: [list capabilities]"
5. **Given** a system error, **When** MCP tool fails, **Then** AI provides user-friendly error (not technical stack trace)
6. **Given** rate limiting, **When** user sends too many messages, **Then** AI explains the limit and when they can continue

---

### Edge Cases

1. **Empty message**: User sends blank message or whitespace only
   - **Expected**: AI prompts "Please type a message. How can I help you with your tasks?"

2. **Very long message**: User sends message exceeding 2000 characters
   - **Expected**: AI processes normally but may ask for clarification if intent unclear

3. **Special characters**: User includes emojis, unicode, or code snippets
   - **Expected**: AI handles gracefully, extracts intent if possible

4. **Concurrent operations**: User sends multiple messages rapidly
   - **Expected**: Messages processed in order, no race conditions

5. **Session timeout**: User's authentication expires mid-conversation
   - **Expected**: Redirect to login, conversation preserved

6. **Database unavailable**: Neon DB connection fails
   - **Expected**: Graceful degradation, user notified to try later

7. **Ambiguous task reference**: Multiple tasks match keyword search
   - **Expected**: AI lists matches and asks user to specify by ID

8. **Non-English input**: User types in another language
   - **Expected**: AI responds in English, attempts to understand basic intent

---

## Requirements *(mandatory)*

### Functional Requirements

**Chat Interface**:
- **FR-001**: System MUST provide a chat interface where users can type natural language messages
- **FR-002**: System MUST display conversation history with clear distinction between user and assistant messages
- **FR-003**: System MUST persist all messages to database for conversation continuity
- **FR-004**: System MUST support creating new conversations and resuming existing ones
- **FR-005**: System MUST display timestamps for each message

**AI Agent Capabilities**:
- **FR-006**: AI agent MUST understand natural language commands for adding tasks
- **FR-007**: AI agent MUST understand natural language commands for listing tasks (all, pending, completed)
- **FR-008**: AI agent MUST understand natural language commands for completing/uncompleting tasks
- **FR-009**: AI agent MUST understand natural language commands for updating task title/description
- **FR-010**: AI agent MUST understand natural language commands for deleting tasks
- **FR-011**: AI agent MUST provide confirmation messages after successful operations
- **FR-012**: AI agent MUST provide helpful error messages when operations fail
- **FR-013**: AI agent MUST ask clarifying questions when user intent is ambiguous
- **FR-014**: AI agent MUST support task identification by ID (e.g., "task 5") and keyword (e.g., "the grocery task")

**MCP Server**:
- **FR-015**: MCP server MUST expose `add_task` tool accepting user_id, title (required), description (optional)
- **FR-016**: MCP server MUST expose `list_tasks` tool accepting user_id, status filter (all/pending/completed)
- **FR-017**: MCP server MUST expose `complete_task` tool accepting user_id, task_id, completed (boolean)
- **FR-018**: MCP server MUST expose `update_task` tool accepting user_id, task_id, title (optional), description (optional)
- **FR-019**: MCP server MUST expose `delete_task` tool accepting user_id, task_id
- **FR-020**: All MCP tools MUST be stateless - no server-side state, all data in database
- **FR-021**: All MCP tools MUST validate user owns the task before operating

**Stateless Architecture**:
- **FR-022**: Server MUST NOT hold any conversation state in memory
- **FR-023**: Every request MUST fetch conversation history from database
- **FR-024**: Server MUST be horizontally scalable (any instance can handle any request)
- **FR-025**: Server restart MUST NOT lose any conversation data

**Authentication & Authorization**:
- **FR-026**: Chat endpoint MUST require valid authentication (reuse Phase II Better Auth)
- **FR-027**: Users MUST only see their own conversations and tasks
- **FR-028**: All MCP tools MUST receive user_id from authenticated session, not client input

**Validation Rules** (preserved from Phase I/II):
- **FR-029**: Task title MUST be 1-100 characters
- **FR-030**: Task description MUST be 0-500 characters (optional)
- **FR-031**: Task status MUST be "pending" or "completed"

---

### Key Entities

**Existing Entities** (from Phase II):
- **Task**: User's todo item with id, user_id, title, description, status, created_at, updated_at, completed_at
- **User**: Authenticated user with id, email, password_hash, name, created_at

**New Entities for Phase III**:
- **Conversation**: A chat session containing multiple messages
  - Attributes: id, user_id, created_at, updated_at
  - Relationships: belongs to User, has many Messages

- **Message**: A single message in a conversation (user or assistant)
  - Attributes: id, conversation_id, user_id, role (user/assistant), content, tool_calls (JSON), created_at
  - Relationships: belongs to Conversation, belongs to User

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

**User Experience**:
- **SC-001**: Users can add a task via natural language within 5 seconds of sending the message
- **SC-002**: Users can complete a full task management cycle (add -> view -> complete -> delete) in under 60 seconds using only chat
- **SC-003**: 90% of common natural language phrases are correctly interpreted (tested against phrase corpus)
- **SC-004**: Users can resume a conversation after browser close/reopen without losing history

**System Performance**:
- **SC-005**: Chat responses return within 5 seconds for 95% of requests
- **SC-006**: System supports 100 concurrent chat sessions without degradation
- **SC-007**: Conversation history loads within 2 seconds for conversations up to 100 messages

**Reliability**:
- **SC-008**: Server restart does not lose any conversation data or task state
- **SC-009**: Any server instance can handle any user's request (stateless verification)
- **SC-010**: All 5 MCP tools execute successfully in isolation and combination

**Functional Completeness**:
- **SC-011**: All Phase I CRUD operations (add, list, update, complete, delete) work identically via chat as via web UI
- **SC-012**: Error scenarios produce helpful, user-friendly messages (no technical errors exposed)
- **SC-013**: Authentication works seamlessly between web UI and chat interface (single sign-on)

---

## Assumptions

1. **OpenAI API Access**: Development team has access to OpenAI API with sufficient quota for Agents SDK
2. **Neon DB Schema**: Existing tasks and users tables from Phase II will be reused
3. **Better Auth Compatibility**: Phase II authentication system will work with the new chat endpoint
4. **English Language**: Initial implementation supports English only; other languages as bonus feature
5. **Single Conversation Active**: Users work with one conversation at a time (conversation switching as stretch goal)
6. **No Offline Support**: Chat requires active internet connection
7. **Desktop/Mobile Browser**: Primary target is web browsers; native apps not in scope

---

## Out of Scope

- Voice input/output (bonus feature)
- Multi-language support beyond English (bonus feature)
- Due dates, priorities, tags (Phase V features)
- Recurring tasks and reminders (Phase V features)
- Bulk import/export of tasks
- Team/shared task lists
- Rich media in messages (images, files)
- Real-time notifications/push

---

## Dependencies

1. **Phase II Completion**: Backend API (FastAPI), database (Neon PostgreSQL), authentication (Better Auth) must be operational
2. **OpenAI Platform**: ChatKit and Agents SDK availability
3. **MCP SDK**: Official MCP Python SDK for building MCP server
4. **Domain Allowlist**: OpenAI domain allowlist configuration for hosted ChatKit deployment

---

## Revision History

| Version | Date       | Author      | Changes               |
|---------|------------|-------------|-----------------------|
| 1.0     | 2026-01-12 | Claude Code | Initial specification |
