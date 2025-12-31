# Skill: Implement Agent Behavior

**Owner**: Phase III AI Chatbot Agent
**Phase**: III (AI Chatbot with MCP)
**Purpose**: Implement conversational AI agent behavior using OpenAI Agents SDK with MCP tools for natural language todo management

---

## Context

Phase III provides a conversational chatbot interface where users can manage todos via natural language. This skill implements the AI agent using OpenAI's Agents SDK, integrating MCP tools, and creating a stateless conversational experience.

## Prerequisites

- [ ] Phase III spec exists at `specs/phase3-ai-chatbot/spec.md`
- [ ] MCP server implemented with todo tools
- [ ] OpenAI API key available
- [ ] Frontend ready for chatbot UI integration

## Input Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `agent_name` | string | Yes | Agent identifier | "todo-assistant" |
| `system_prompt` | string | Yes | Agent's system instructions | "You are a helpful todo assistant..." |
| `task_id` | string | Yes | Task ID from tasks.md | "TASK-025" |
| `enable_urdu` | bool | No | Enable Urdu language support | `true` (bonus points!) |

## Execution Steps

### Step 1: Install OpenAI Agents SDK

```bash
# Install dependencies
npm install openai
npm install @modelcontextprotocol/sdk
npm install dotenv
```

### Step 2: Configure OpenAI Client

**File**: `frontend/lib/openai-client.ts`

```typescript
import OpenAI from "openai"

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  dangerouslyAllowBrowser: false, // Keep API key server-side
})

// Agent configuration
export const AGENT_CONFIG = {
  model: "gpt-4o-2024-11-20", // Latest model with tool support
  temperature: 0.7,
  max_tokens: 1000,
} as const
```

### Step 3: Create Agent System Prompt

**File**: `frontend/lib/agent-prompts.ts`

```typescript
/**
 * System prompt for the todo assistant agent.
 */
export const TODO_ASSISTANT_SYSTEM_PROMPT = `You are a helpful and friendly todo assistant. Your job is to help users manage their todo list through natural conversation.

**Your Capabilities:**
- Create new todos with user-specified text and priority
- List all todos or filter by status (pending/completed)
- Mark todos as complete
- Update todo text, status, or priority
- Delete todos
- Respond in English or Urdu based on user preference

**Guidelines:**
1. **Be conversational**: Use friendly, natural language
2. **Confirm actions**: Always confirm when you create, update, or delete a todo
3. **Be helpful**: Suggest actions when the user is unclear
4. **Handle errors gracefully**: If a todo ID doesn't exist, explain clearly
5. **Summarize results**: When listing todos, present them in a readable format
6. **Be concise**: Keep responses brief but informative
7. **Respect language**: If the user writes in Urdu, respond in Urdu

**Example Interactions:**

User: "Add a todo to buy groceries"
Assistant: "✅ I've added 'Buy groceries' to your todo list with medium priority. Would you like to set it as high priority?"

User: "Show my pending tasks"
Assistant: "Here are your pending todos:
1. Buy groceries (Priority: medium)
2. Finish project report (Priority: high)

You have 2 pending tasks. Need help with any of these?"

User: "مجھے اپنے ٹاسکس دکھائیں" (Show me my tasks)
Assistant: "یہاں آپ کے ٹاسکس ہیں:
1. Buy groceries (پینڈنگ)
2. Finish project report (پینڈنگ)

کیا آپ کوئی مکمل کرنا چاہتے ہیں؟"

**Important:**
- Always use the provided MCP tools to interact with the todo backend
- Never make up todo IDs or data
- If you're unsure about a command, ask the user for clarification
- Keep the conversation stateless - each message is independent

Remember: You are helpful, accurate, and user-focused!`

/**
 * Urdu language support prompt (bonus feature).
 */
export const URDU_SUPPORT_PROMPT = `
**Urdu Language Support:**
When the user communicates in Urdu (اردو), respond in Urdu while keeping:
- Technical terms in English (e.g., "todo", "priority")
- Action confirmations clear and friendly
- Grammar and spelling correct

Common Urdu phrases:
- "آپ کے ٹاسکس" = "your tasks"
- "نیا ٹاسک بنائیں" = "create new task"
- "مکمل کریں" = "mark complete"
- "ڈیلیٹ کریں" = "delete"
- "پینڈنگ" = "pending"
- "مکمل" = "completed"
`
```

### Step 4: Implement Agent with MCP Integration

**File**: `frontend/lib/agent.ts`

```typescript
import { openai, AGENT_CONFIG } from "./openai-client"
import { TODO_ASSISTANT_SYSTEM_PROMPT, URDU_SUPPORT_PROMPT } from "./agent-prompts"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"

/**
 * Todo Assistant Agent with MCP tool integration.
 */
export class TodoAssistantAgent {
  private mcpClient: Client | null = null
  private conversationHistory: ChatCompletionMessageParam[] = []

  constructor(
    private accessToken: string,
    private enableUrdu: boolean = true
  ) {
    this.initializeMCP()
  }

  /**
   * Initialize MCP client connection to todo server.
   */
  private async initializeMCP(): Promise<void> {
    const transport = new StdioClientTransport({
      command: "node",
      args: ["./backend/mcp_server/dist/server.js"],
      env: {
        ...process.env,
        ACCESS_TOKEN: this.accessToken,
      },
    })

    this.mcpClient = new Client(
      {
        name: "todo-assistant-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    )

    await this.mcpClient.connect(transport)
    console.log("MCP client connected to todo server")
  }

  /**
   * Get available MCP tools.
   */
  private async getMCPTools() {
    if (!this.mcpClient) {
      throw new Error("MCP client not initialized")
    }

    const { tools } = await this.mcpClient.request(
      { method: "tools/list" },
      { type: "ListToolsRequest" }
    )

    // Convert MCP tools to OpenAI tool format
    return tools.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }))
  }

  /**
   * Call an MCP tool.
   */
  private async callMCPTool(toolName: string, args: any): Promise<string> {
    if (!this.mcpClient) {
      throw new Error("MCP client not initialized")
    }

    const result = await this.mcpClient.request(
      {
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args,
        },
      },
      { type: "CallToolRequest" }
    )

    // Extract text content from MCP response
    const textContent = result.content.find((c) => c.type === "text")
    return textContent?.text || "No response from tool"
  }

  /**
   * Process a user message and generate a response.
   */
  async chat(userMessage: string): Promise<string> {
    // Add user message to history
    this.conversationHistory.push({
      role: "user",
      content: userMessage,
    })

    // Build system prompt
    const systemPrompt =
      TODO_ASSISTANT_SYSTEM_PROMPT +
      (this.enableUrdu ? `\n\n${URDU_SUPPORT_PROMPT}` : "")

    // Get available tools
    const tools = await this.getMCPTools()

    // Call OpenAI with tools
    let response = await openai.chat.completions.create({
      ...AGENT_CONFIG,
      messages: [
        { role: "system", content: systemPrompt },
        ...this.conversationHistory,
      ],
      tools,
      tool_choice: "auto",
    })

    let assistantMessage = response.choices[0].message

    // Handle tool calls
    while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      // Add assistant's tool call message to history
      this.conversationHistory.push(assistantMessage)

      // Execute each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name
        const toolArgs = JSON.parse(toolCall.function.arguments)

        console.log(`Calling MCP tool: ${toolName}`, toolArgs)

        // Call the MCP tool
        const toolResult = await this.callMCPTool(toolName, toolArgs)

        // Add tool result to history
        this.conversationHistory.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolResult,
        })
      }

      // Get next response from OpenAI (with tool results)
      response = await openai.chat.completions.create({
        ...AGENT_CONFIG,
        messages: [
          { role: "system", content: systemPrompt },
          ...this.conversationHistory,
        ],
        tools,
        tool_choice: "auto",
      })

      assistantMessage = response.choices[0].message
    }

    // Extract final text response
    const finalResponse = assistantMessage.content || "I apologize, I couldn't process that request."

    // Add to history
    this.conversationHistory.push({
      role: "assistant",
      content: finalResponse,
    })

    return finalResponse
  }

  /**
   * Reset conversation history (start new session).
   */
  reset(): void {
    this.conversationHistory = []
  }

  /**
   * Get conversation history.
   */
  getHistory(): ChatCompletionMessageParam[] {
    return [...this.conversationHistory]
  }
}
```

### Step 5: Create Chatbot API Route

**File**: `frontend/app/api/chat/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { TodoAssistantAgent } from "@/lib/agent"
import { authClient } from "@/lib/auth-client"

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await authClient.getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get message from request
    const { message } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Create agent (stateless - new instance per request)
    const agent = new TodoAssistantAgent(
      session.accessToken,
      true // Enable Urdu support
    )

    // Process message
    const response = await agent.chat(message)

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
```

### Step 6: Create Chatbot UI Component

**File**: `frontend/components/chatbot/chat-interface.tsx`

```typescript
"use client"

import { useState, useRef, useEffect } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: data.timestamp,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error("Error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: `❌ Error: ${error.message}`,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[600px] flex-col rounded-lg border bg-white shadow-lg">
      {/* Header */}
      <div className="border-b bg-blue-600 p-4 text-white">
        <h2 className="text-xl font-semibold">Todo Assistant</h2>
        <p className="text-sm opacity-90">
          Ask me to manage your todos in English or Urdu!
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">👋 Hello! How can I help you today?</p>
            <p className="text-sm">
              Try: "Add a todo to buy groceries" or "Show my pending tasks"
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.role === "user" ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message... (English or Urdu)"
            className="flex-1 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  )
}
```

### Step 7: Write Agent Tests

**File**: `frontend/__tests__/agent.test.ts`

```typescript
import { describe, it, expect, beforeEach, jest } from "@jest/globals"
import { TodoAssistantAgent } from "../lib/agent"

describe("TodoAssistantAgent", () => {
  let agent: TodoAssistantAgent

  beforeEach(() => {
    agent = new TodoAssistantAgent("test-token", true)
  })

  it("should initialize successfully", () => {
    expect(agent).toBeDefined()
  })

  it("should handle basic chat message", async () => {
    const response = await agent.chat("Hello")
    expect(response).toBeDefined()
    expect(typeof response).toBe("string")
  })

  it("should maintain conversation history", async () => {
    await agent.chat("Add a todo to buy milk")
    await agent.chat("Show my todos")

    const history = agent.getHistory()
    expect(history.length).toBeGreaterThan(0)
  })

  it("should reset conversation", async () => {
    await agent.chat("Hello")
    agent.reset()

    const history = agent.getHistory()
    expect(history.length).toBe(0)
  })
})
```

## Output Artifacts

1. **OpenAI Client**: `frontend/lib/openai-client.ts`
2. **Agent Prompts**: `frontend/lib/agent-prompts.ts`
3. **Agent**: `frontend/lib/agent.ts`
4. **API Route**: `frontend/app/api/chat/route.ts`
5. **UI Component**: `frontend/components/chatbot/chat-interface.tsx`
6. **Tests**: `frontend/__tests__/agent.test.ts`

## Validation Rules

### MUST Pass:
- Agent responds to natural language queries
- MCP tools called correctly
- Conversation maintains context
- Urdu language support works (bonus)
- Error handling graceful
- Stateless operation (each request independent)

### Conversational Quality Checks:
- [ ] Friendly and helpful tone
- [ ] Confirms actions clearly
- [ ] Handles ambiguity well
- [ ] Provides helpful suggestions
- [ ] Error messages user-friendly

## Example Interactions

```
User: "Add a todo to buy groceries"
Agent: "✅ I've added 'Buy groceries' to your todo list with medium priority."

User: "Show my pending tasks"
Agent: "Here are your pending todos:
1. Buy groceries (Priority: medium, ID: 123)
You have 1 pending task."

User: "Mark 123 as complete"
Agent: "✅ Todo marked as complete: 'Buy groceries'"

User: "مجھے اپنے ٹاسکس دکھائیں"
Agent: "یہاں آپ کے ٹاسکس ہیں:
1. Buy groceries (مکمل)
آپ کے پاس 1 ٹاسک ہے۔"
```

## Success Indicators

- ✅ Agent responds naturally
- ✅ MCP tools integrated
- ✅ Todos created/updated/deleted via chat
- ✅ Urdu language support works
- ✅ Stateless operation
- ✅ Error handling robust
- ✅ UI responsive and user-friendly

## Bonus Points Earned

- **+100 points**: Multi-language support (Urdu)
- **+200 points**: Voice commands (if implemented)

---

**Last Updated**: 2025-12-30
**Version**: 1.0
**Hackathon**: Todo Spec-Driven Development
