# Phase 3: AI-Powered Todo Chatbot

## Overview

Phase 3 implements an AI-powered conversational interface for task management using the OpenAI Agents SDK and MCP (Model Context Protocol).

## Directory Structure

```
phase3-ai-chatbot/
├── backend/
│   ├── src/
│   │   ├── agent/                    # OpenAI Agents SDK integration
│   │   │   ├── config.py             # Agent configuration
│   │   │   ├── runner.py             # Agent executor
│   │   │   └── todo_agent.py         # Main agent implementation
│   │   ├── mcp/                      # Model Context Protocol server
│   │   │   ├── server.py             # MCP server implementation
│   │   │   ├── types.py              # Type definitions
│   │   │   ├── validators.py         # Input validation
│   │   │   └── tools/                # MCP tools
│   │   │       ├── add_task.py
│   │   │       ├── update_task.py
│   │   │       ├── complete_task.py
│   │   │       ├── delete_task.py
│   │   │       └── list_tasks.py
│   │   ├── api/
│   │   │   └── chat.py               # Chat REST endpoints
│   │   ├── services/
│   │   │   └── chat_service.py       # Chat business logic
│   │   └── models/
│   │       ├── conversation.py       # Conversation model
│   │       └── message.py            # Message model
│   └── tests/
│       ├── unit/
│       │   ├── test_agent.py
│       │   ├── test_chat_service.py
│       │   ├── test_mcp_server.py
│       │   ├── test_conversation_model.py
│       │   └── test_message_model.py
│       └── integration/
│           ├── test_chat.py
│           └── test_mcp_tools.py
│
└── frontend/
    ├── app/
    │   └── chat/
    │       └── page.tsx              # Standalone chat page
    ├── components/
    │   └── chat/                     # Chat UI components
    │       ├── ChatContainer.tsx
    │       ├── ChatDrawer.tsx
    │       ├── ConversationList.tsx
    │       ├── MessageBubble.tsx
    │       ├── MessageList.tsx
    │       ├── MessageInput.tsx
    │       ├── TaskPreview.tsx
    │       ├── ErrorMessage.tsx
    │       ├── LoadingIndicator.tsx
    │       └── index.ts
    └── lib/
        ├── chat-api.ts               # Chat API client
        ├── context/
        │   └── ChatContext.tsx       # Chat state management
        └── hooks/
            ├── useChatMessages.ts
            └── useConversations.ts
```

## Features

- Natural language task management ("Add a task to buy groceries")
- Conversational context awareness
- Multi-turn conversations with history
- Real-time task preview updates
- User-specific task isolation
- Friendly chatbot personality (calls users "Sir")
- Task-focused responses only

## Architecture

```
User Input → Chat API → OpenAI Agent → MCP Tools → Database
                ↓
         Response → Chat UI → Task Preview Update
```

## Technology Stack

### Backend
- **OpenAI Agents SDK**: Conversational AI agent
- **MCP Server**: Model Context Protocol for tool execution
- **FastAPI**: REST API endpoints
- **SQLModel**: Database models for conversations/messages

### Frontend
- **React**: Chat UI components
- **TypeScript**: Type-safe implementation
- **Context API**: Chat state management
- **Custom Hooks**: Message and conversation management

## Integration with Phase 2

Phase 3 extends the Phase 2 full-stack application. The chat functionality requires:
- Phase 2 backend running (FastAPI server)
- Phase 2 frontend running (Next.js)
- Database connection (for task storage)
- OpenAI API key configured

## Running the Chatbot

1. Ensure Phase 2 backend is running:
   ```bash
   cd ../phase2-fullstack-web/backend
   uv run uvicorn src.main:app --reload
   ```

2. Ensure Phase 2 frontend is running:
   ```bash
   cd ../phase2-fullstack-web/frontend
   npm run dev
   ```

3. Access the chatbot at `http://localhost:3000/chat` or via the chat drawer on the dashboard.

## Environment Variables

Required in Phase 2 backend `.env`:
```
OPENAI_API_KEY=sk-...
```

## Specifications

For detailed specifications, see:
- `../specs/003-phase3-ai-chatbot/spec.md`
- `../specs/003-phase3-ai-chatbot/plan.md`
- `../specs/003-phase3-ai-chatbot/tasks.md`

## Chatbot Behavior

- Calls users "Sir"
- Only responds to task-related queries
- Tells user their name if authenticated and asked
- Refuses non-task questions politely
- Can handle casual greetings ("hi", "hello")
