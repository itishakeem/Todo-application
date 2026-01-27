---
id: PHR-0009
title: Chatbot Bug Fixes and UX Improvements
stage: green
date: 2026-01-23
surface: agent
model: claude-opus-4-5-20251101
feature: 003-phase3-ai-chatbot
branch: 004-phase4-kubernetes
user: Hackathon Team
command: user-request
labels: ["chatbot", "bugfix", "ux", "timestamp", "delete-task", "user-name", "performance", "phase3"]
links:
  spec: specs/003-phase3-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/lib/context/TaskContext.tsx (modified - added refreshTasks)
  - frontend/components/chat/ChatDrawer.tsx (modified - connected task refresh)
  - backend/src/agent/todo_agent.py (modified - user name personalization, bulk delete)
  - backend/src/agent/runner.py (modified - pass user name)
  - backend/src/agent/config.py (modified - configurable model)
  - backend/src/services/chat_service.py (modified - fetch user name)
tests:
  - Manual verification pending
---

## Prompt

chatbot is working perfect but here is some issues: 1 response is very delay. 2 when chatbot opened it there is splited screen chatbot and tasks but when i create or update any task it always showing same time on all tasks 5 hours ago the time should be original when that task was created or updated. 3 when i ask to delete my completed task it returned 'It seems there was an issue deleting the tasks. They might have already been deleted or there was an error with the IDs. Could you please try again or let me know if there's anything else I can assist you with?.' if necessary then remove id for deleting task chatbot should only confirm and also if user authorized chatbot should know user's name.

## Response snapshot

**Bug Fixes Implemented:**

### 1. Timestamp Display Fix
- **Issue**: Tasks in chat drawer showed same time ("5 hours ago") on all tasks
- **Root Cause**: TaskContext wasn't refreshing after chatbot operations
- **Fix**:
  - Added `refreshTasks()` function to TaskContext
  - Connected ChatDrawer to call `refreshTasks()` when chatbot modifies tasks
  - ChatContext's `onTasksChanged` callback now triggers task list refresh

### 2. Delete Task Error Fix
- **Issue**: Bulk delete of completed tasks was failing
- **Root Cause**: Agent instructions needed clearer guidance on bulk operations
- **Fix**: Added explicit "BULK DELETE HANDLING" section to agent instructions
  - Agent now calls `delete_task` separately for each task
  - Reports success with count of deleted tasks

### 3. User Name Personalization
- **Issue**: Chatbot didn't know user's name
- **Fix**:
  - Modified `chat_service.py` to fetch user name from database
  - Updated `AgentRunner.run()` to accept `user_name` parameter
  - Enhanced `get_system_prompt()` to include user name for personalized responses
  - Agent now greets users by name (e.g., "Hi John!")

### 4. Performance Configuration
- **Issue**: Response delay from OpenAI API
- **Note**: API latency is inherent to LLM calls
- **Fix**: Added `OPENAI_MODEL` environment variable support
  - Can switch to `gpt-4o-mini` for faster responses if needed
  - Default remains `gpt-4o` for best tool calling reliability

## Outcome

- ✅ Impact: Chatbot now refreshes tasks in real-time, knows user's name, handles bulk deletes
- 🧪 Tests: Manual testing pending
- 📁 Files: 6 files modified
- 🔁 Next prompts: Test all fixes manually, consider adding loading indicator for chatbot
- 🧠 Reflection: The timestamp issue was a state synchronization problem - ChatContext could trigger task operations but wasn't connected to TaskContext's refresh. The user name feature required threading the user name through multiple layers (DB → Service → Runner → Agent).

## Evaluation notes (flywheel)

- Failure modes observed: None during implementation
- Graders run and results (PASS/FAIL): Implementation complete, testing pending
- Prompt variant (if applicable): User bug report with multiple issues
- Next experiment (smallest change to try): Add visual loading state while waiting for chatbot response
