# Skill: Create MCP Tool

**Owner**: Phase III AI Chatbot Agent
**Phase**: III (AI Chatbot with MCP)
**Purpose**: Create a Model Context Protocol (MCP) tool using the official MCP SDK for todo operations accessible to AI agents

---

## Context

Phase III adds an AI chatbot interface using OpenAI Agents SDK that communicates with the todo backend via MCP tools. This skill creates a single MCP tool that exposes todo operations to the AI agent in a structured, type-safe way.

## Prerequisites

- [ ] Phase III spec exists at `specs/phase3-ai-chatbot/spec.md`
- [ ] FastAPI backend running (Phase II complete)
- [ ] Official MCP SDK installed (`npm install @modelcontextprotocol/sdk`)
- [ ] MCP server directory created (`backend/mcp_server/`)

## Input Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `tool_name` | string | Yes | MCP tool identifier | "list_todos", "create_todo" |
| `tool_description` | string | Yes | Natural language description for AI | "List all todos for the user" |
| `task_id` | string | Yes | Task ID from tasks.md | "TASK-021" |
| `requires_user_context` | bool | No | Tool needs user authentication | `true` (default) |

## Execution Steps

### Step 1: Install MCP SDK

```bash
# MCP server dependencies
cd backend
mkdir -p mcp_server
cd mcp_server
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install --save-dev @types/node typescript ts-node

# Initialize TypeScript
npx tsc --init
```

**File**: `backend/mcp_server/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 2: Create MCP Tool Schema

**File**: `backend/mcp_server/src/schemas.ts`

```typescript
import { z } from "zod"

// Todo status enum
export const TodoStatus = z.enum(["pending", "completed"])
export type TodoStatus = z.infer<typeof TodoStatus>

// Todo priority enum
export const TodoPriority = z.enum(["low", "medium", "high"])
export type TodoPriority = z.infer<typeof TodoPriority>

// Todo object schema
export const TodoSchema = z.object({
  id: z.number().int().positive(),
  text: z.string().min(1).max(200),
  status: TodoStatus,
  priority: TodoPriority,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
})
export type Todo = z.infer<typeof TodoSchema>

// List Todos Tool
export const ListTodosArgsSchema = z.object({
  status_filter: TodoStatus.optional().describe("Filter by status (pending or completed)"),
})
export type ListTodosArgs = z.infer<typeof ListTodosArgsSchema>

// Create Todo Tool
export const CreateTodoArgsSchema = z.object({
  text: z.string().min(1).max(200).describe("Todo text (1-200 characters)"),
  priority: TodoPriority.optional().describe("Priority level (defaults to medium)"),
})
export type CreateTodoArgs = z.infer<typeof CreateTodoArgsSchema>

// Update Todo Tool
export const UpdateTodoArgsSchema = z.object({
  todo_id: z.number().int().positive().describe("ID of the todo to update"),
  text: z.string().min(1).max(200).optional().describe("New todo text"),
  status: TodoStatus.optional().describe("New status"),
  priority: TodoPriority.optional().describe("New priority"),
})
export type UpdateTodoArgs = z.infer<typeof UpdateTodoArgsSchema>

// Delete Todo Tool
export const DeleteTodoArgsSchema = z.object({
  todo_id: z.number().int().positive().describe("ID of the todo to delete"),
})
export type DeleteTodoArgs = z.infer<typeof DeleteTodoArgsSchema>

// Complete Todo Tool (convenience wrapper)
export const CompleteTodoArgsSchema = z.object({
  todo_id: z.number().int().positive().describe("ID of the todo to mark as complete"),
})
export type CompleteTodoArgs = z.infer<typeof CompleteTodoArgsSchema>
```

### Step 3: Create API Client

**File**: `backend/mcp_server/src/api-client.ts`

```typescript
import axios, { AxiosInstance } from "axios"
import { Todo, ListTodosArgs, CreateTodoArgs, UpdateTodoArgs } from "./schemas"

/**
 * Client for interacting with the Todo API backend.
 */
export class TodoAPIClient {
  private client: AxiosInstance
  private accessToken: string | null = null

  constructor(baseURL: string = "http://localhost:8000") {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  /**
   * Set the user's access token for authenticated requests.
   */
  setAccessToken(token: string): void {
    this.accessToken = token
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`
  }

  /**
   * List all todos for the authenticated user.
   */
  async listTodos(args?: ListTodosArgs): Promise<Todo[]> {
    const response = await this.client.get<Todo[]>("/api/todos", {
      params: args,
    })
    return response.data
  }

  /**
   * Create a new todo.
   */
  async createTodo(args: CreateTodoArgs): Promise<Todo> {
    const response = await this.client.post<Todo>("/api/todos", args)
    return response.data
  }

  /**
   * Update an existing todo.
   */
  async updateTodo(args: UpdateTodoArgs): Promise<Todo> {
    const { todo_id, ...updateData } = args
    const response = await this.client.patch<Todo>(
      `/api/todos/${todo_id}`,
      updateData
    )
    return response.data
  }

  /**
   * Delete a todo.
   */
  async deleteTodo(todoId: number): Promise<void> {
    await this.client.delete(`/api/todos/${todoId}`)
  }

  /**
   * Mark a todo as complete (convenience method).
   */
  async completeTodo(todoId: number): Promise<Todo> {
    return this.updateTodo({
      todo_id: todoId,
      status: "completed",
    })
  }
}
```

### Step 4: Implement MCP Tools

**File**: `backend/mcp_server/src/tools.ts`

```typescript
import { z } from "zod"
import {
  ListTodosArgsSchema,
  CreateTodoArgsSchema,
  UpdateTodoArgsSchema,
  DeleteTodoArgsSchema,
  CompleteTodoArgsSchema,
} from "./schemas"
import { TodoAPIClient } from "./api-client"

/**
 * MCP Tool: List Todos
 *
 * Lists all todos for the authenticated user with optional filtering.
 */
export async function listTodosTool(
  args: z.infer<typeof ListTodosArgsSchema>,
  apiClient: TodoAPIClient
): Promise<string> {
  try {
    const todos = await apiClient.listTodos(args)

    if (todos.length === 0) {
      return "No todos found. The user has no todos yet."
    }

    // Format todos as readable text
    const todoList = todos
      .map(
        (todo, index) =>
          `${index + 1}. [${todo.status.toUpperCase()}] ${todo.text} ` +
          `(ID: ${todo.id}, Priority: ${todo.priority}, ` +
          `Created: ${new Date(todo.created_at).toLocaleDateString()})`
      )
      .join("\n")

    const summary = `Found ${todos.length} todo(s):\n\n${todoList}`
    return summary
  } catch (error: any) {
    return `Error listing todos: ${error.message}`
  }
}

/**
 * MCP Tool: Create Todo
 *
 * Creates a new todo for the authenticated user.
 */
export async function createTodoTool(
  args: z.infer<typeof CreateTodoArgsSchema>,
  apiClient: TodoAPIClient
): Promise<string> {
  try {
    const todo = await apiClient.createTodo(args)

    return (
      `✅ Todo created successfully!\n\n` +
      `ID: ${todo.id}\n` +
      `Text: ${todo.text}\n` +
      `Priority: ${todo.priority}\n` +
      `Status: ${todo.status}`
    )
  } catch (error: any) {
    if (error.response?.status === 422) {
      return `❌ Validation error: ${error.response.data.detail}`
    }
    return `Error creating todo: ${error.message}`
  }
}

/**
 * MCP Tool: Update Todo
 *
 * Updates an existing todo by ID.
 */
export async function updateTodoTool(
  args: z.infer<typeof UpdateTodoArgsSchema>,
  apiClient: TodoAPIClient
): Promise<string> {
  try {
    const todo = await apiClient.updateTodo(args)

    return (
      `✅ Todo updated successfully!\n\n` +
      `ID: ${todo.id}\n` +
      `Text: ${todo.text}\n` +
      `Status: ${todo.status}\n` +
      `Priority: ${todo.priority}`
    )
  } catch (error: any) {
    if (error.response?.status === 404) {
      return `❌ Todo not found with ID: ${args.todo_id}`
    }
    return `Error updating todo: ${error.message}`
  }
}

/**
 * MCP Tool: Delete Todo
 *
 * Deletes a todo by ID.
 */
export async function deleteTodoTool(
  args: z.infer<typeof DeleteTodoArgsSchema>,
  apiClient: TodoAPIClient
): Promise<string> {
  try {
    await apiClient.deleteTodo(args.todo_id)
    return `✅ Todo deleted successfully (ID: ${args.todo_id})`
  } catch (error: any) {
    if (error.response?.status === 404) {
      return `❌ Todo not found with ID: ${args.todo_id}`
    }
    return `Error deleting todo: ${error.message}`
  }
}

/**
 * MCP Tool: Complete Todo
 *
 * Marks a todo as complete (convenience wrapper for update).
 */
export async function completeTodoTool(
  args: z.infer<typeof CompleteTodoArgsSchema>,
  apiClient: TodoAPIClient
): Promise<string> {
  try {
    const todo = await apiClient.completeTodo(args.todo_id)
    return `✅ Todo marked as complete: "${todo.text}"`
  } catch (error: any) {
    if (error.response?.status === 404) {
      return `❌ Todo not found with ID: ${args.todo_id}`
    }
    return `Error completing todo: ${error.message}`
  }
}
```

### Step 5: Create MCP Server

**File**: `backend/mcp_server/src/server.ts`

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js"
import {
  ListTodosArgsSchema,
  CreateTodoArgsSchema,
  UpdateTodoArgsSchema,
  DeleteTodoArgsSchema,
  CompleteTodoArgsSchema,
} from "./schemas.js"
import { TodoAPIClient } from "./api-client.js"
import {
  listTodosTool,
  createTodoTool,
  updateTodoTool,
  deleteTodoTool,
  completeTodoTool,
} from "./tools.js"

/**
 * Todo MCP Server
 *
 * Provides MCP tools for todo operations via the FastAPI backend.
 */
class TodoMCPServer {
  private server: Server
  private apiClient: TodoAPIClient

  constructor() {
    this.server = new Server(
      {
        name: "todo-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    )

    this.apiClient = new TodoAPIClient(
      process.env.API_BASE_URL || "http://localhost:8000"
    )

    // Set access token from environment (for testing)
    // In production, this would come from the AI agent's context
    const accessToken = process.env.ACCESS_TOKEN
    if (accessToken) {
      this.apiClient.setAccessToken(accessToken)
    }

    this.setupHandlers()
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "list_todos",
          description:
            "List all todos for the authenticated user. " +
            "Optionally filter by status (pending or completed).",
          inputSchema: {
            type: "object",
            properties: {
              status_filter: {
                type: "string",
                enum: ["pending", "completed"],
                description: "Filter by status",
              },
            },
          },
        },
        {
          name: "create_todo",
          description:
            "Create a new todo with text and optional priority. " +
            "Text must be 1-200 characters.",
          inputSchema: {
            type: "object",
            properties: {
              text: {
                type: "string",
                minLength: 1,
                maxLength: 200,
                description: "Todo text",
              },
              priority: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "Priority level (defaults to medium)",
              },
            },
            required: ["text"],
          },
        },
        {
          name: "update_todo",
          description:
            "Update an existing todo by ID. Can update text, status, or priority.",
          inputSchema: {
            type: "object",
            properties: {
              todo_id: {
                type: "number",
                description: "Todo ID",
              },
              text: {
                type: "string",
                minLength: 1,
                maxLength: 200,
                description: "New text",
              },
              status: {
                type: "string",
                enum: ["pending", "completed"],
                description: "New status",
              },
              priority: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "New priority",
              },
            },
            required: ["todo_id"],
          },
        },
        {
          name: "delete_todo",
          description: "Delete a todo by ID.",
          inputSchema: {
            type: "object",
            properties: {
              todo_id: {
                type: "number",
                description: "Todo ID to delete",
              },
            },
            required: ["todo_id"],
          },
        },
        {
          name: "complete_todo",
          description:
            "Mark a todo as complete (convenience method for update_todo with status=completed).",
          inputSchema: {
            type: "object",
            properties: {
              todo_id: {
                type: "number",
                description: "Todo ID to mark complete",
              },
            },
            required: ["todo_id"],
          },
        },
      ],
    }))

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params

        switch (name) {
          case "list_todos": {
            const validatedArgs = ListTodosArgsSchema.parse(args)
            const result = await listTodosTool(validatedArgs, this.apiClient)
            return { content: [{ type: "text", text: result }] }
          }

          case "create_todo": {
            const validatedArgs = CreateTodoArgsSchema.parse(args)
            const result = await createTodoTool(validatedArgs, this.apiClient)
            return { content: [{ type: "text", text: result }] }
          }

          case "update_todo": {
            const validatedArgs = UpdateTodoArgsSchema.parse(args)
            const result = await updateTodoTool(validatedArgs, this.apiClient)
            return { content: [{ type: "text", text: result }] }
          }

          case "delete_todo": {
            const validatedArgs = DeleteTodoArgsSchema.parse(args)
            const result = await deleteTodoTool(validatedArgs, this.apiClient)
            return { content: [{ type: "text", text: result }] }
          }

          case "complete_todo": {
            const validatedArgs = CompleteTodoArgsSchema.parse(args)
            const result = await completeTodoTool(validatedArgs, this.apiClient)
            return { content: [{ type: "text", text: result }] }
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            )
        }
      } catch (error: any) {
        if (error.name === "ZodError") {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid arguments: ${error.message}`
          )
        }
        throw error
      }
    })
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error("Todo MCP Server running on stdio")
  }
}

// Start the server
const server = new TodoMCPServer()
server.start().catch(console.error)
```

### Step 6: Build and Test

```bash
# Build TypeScript
cd backend/mcp_server
npm run build

# Test MCP server
# Set access token for testing
export ACCESS_TOKEN="your-jwt-token-here"
node dist/server.js
```

### Step 7: Create MCP Client Configuration

**File**: `backend/mcp_server/mcp-config.json`

```json
{
  "mcpServers": {
    "todo": {
      "command": "node",
      "args": ["./dist/server.js"],
      "env": {
        "API_BASE_URL": "http://localhost:8000",
        "ACCESS_TOKEN": "${ACCESS_TOKEN}"
      }
    }
  }
}
```

### Step 8: Write MCP Tool Tests

**File**: `backend/mcp_server/src/__tests__/tools.test.ts`

```typescript
import { describe, it, expect, beforeEach } from "@jest/globals"
import { TodoAPIClient } from "../api-client"
import { createTodoTool, listTodosTool } from "../tools"

describe("MCP Tools", () => {
  let apiClient: TodoAPIClient

  beforeEach(() => {
    apiClient = new TodoAPIClient("http://localhost:8000")
    // Mock token for testing
    apiClient.setAccessToken("test-token")
  })

  it("should create a todo successfully", async () => {
    const result = await createTodoTool(
      { text: "Test todo", priority: "high" },
      apiClient
    )

    expect(result).toContain("Todo created successfully")
    expect(result).toContain("Test todo")
  })

  it("should list todos", async () => {
    const result = await listTodosTool({}, apiClient)

    expect(result).toBeDefined()
    expect(typeof result).toBe("string")
  })
})
```

## Output Artifacts

1. **Schemas**: `backend/mcp_server/src/schemas.ts`
2. **API Client**: `backend/mcp_server/src/api-client.ts`
3. **Tools**: `backend/mcp_server/src/tools.ts`
4. **Server**: `backend/mcp_server/src/server.ts`
5. **Config**: `backend/mcp_server/mcp-config.json`
6. **Tests**: `backend/mcp_server/src/__tests__/`

## Validation Rules

### MUST Pass:
- Zod schemas validate correctly
- MCP server starts without errors
- Tools callable via MCP protocol
- API client handles errors gracefully
- Type safety enforced throughout
- All tools documented with descriptions

## Success Indicators

- ✅ MCP server starts successfully
- ✅ Tools appear in MCP tool list
- ✅ Tool calls succeed with valid input
- ✅ Validation errors caught and reported
- ✅ API errors handled gracefully
- ✅ Type safety with Zod and TypeScript

---

**Last Updated**: 2025-12-30
**Version**: 1.0
**Hackathon**: Todo Spec-Driven Development
