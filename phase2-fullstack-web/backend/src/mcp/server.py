"""
MCP Server configuration for Phase III AI Chatbot.
Provides the MCP server instance and tool registration.
"""
from mcp.server import Server
from mcp.types import Tool, TextContent
from typing import Any, Callable, Awaitable
from uuid import UUID


# MCP Server instance for in-process usage
mcp_server = Server(
    name="todo-mcp-server",
    version="1.0.0",
    instructions="MCP server for todo task management. Provides tools to add, list, complete, update, and delete tasks.",
)

# Registry for tool handlers
_tool_handlers: dict[str, Callable[..., Awaitable[list[TextContent]]]] = {}


def register_tool(
    name: str,
    description: str,
    input_schema: dict[str, Any],
) -> Callable[[Callable[..., Awaitable[list[TextContent]]]], Callable[..., Awaitable[list[TextContent]]]]:
    """
    Decorator to register an MCP tool handler.

    Args:
        name: Tool name (e.g., 'add_task')
        description: Tool description for the AI agent
        input_schema: JSON Schema for tool inputs

    Returns:
        Decorator function that registers the tool handler
    """
    def decorator(func: Callable[..., Awaitable[list[TextContent]]]) -> Callable[..., Awaitable[list[TextContent]]]:
        _tool_handlers[name] = func
        return func
    return decorator


def get_tool_handler(name: str) -> Callable[..., Awaitable[list[TextContent]]] | None:
    """Get a registered tool handler by name."""
    return _tool_handlers.get(name)


def get_registered_tools() -> list[str]:
    """Get list of registered tool names."""
    return list(_tool_handlers.keys())


def register_tool_handlers() -> None:
    """
    Register tool handler functions in the handler registry.
    This must be called BEFORE register_tools() to populate handlers.
    """
    from .tools.add_task import add_task
    from .tools.list_tasks import list_tasks
    from .tools.complete_task import complete_task
    from .tools.update_task import update_task
    from .tools.delete_task import delete_task

    _tool_handlers['add_task'] = add_task
    _tool_handlers['list_tasks'] = list_tasks
    _tool_handlers['complete_task'] = complete_task
    _tool_handlers['update_task'] = update_task
    _tool_handlers['delete_task'] = delete_task


def register_tools() -> None:
    """
    Register all MCP tool handlers with the server.
    This should be called at application startup.
    """
    # First, populate the handler registry
    register_tool_handlers()

    @mcp_server.list_tools()
    async def list_tools() -> list[Tool]:
        """Return the list of available tools."""
        tools = [
            Tool(
                name="add_task",
                description="Add a new task to the user's todo list. Returns the created task ID.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "Task title (1-100 characters)",
                            "minLength": 1,
                            "maxLength": 100,
                        },
                        "description": {
                            "type": "string",
                            "description": "Task description (0-500 characters, optional)",
                            "maxLength": 500,
                            "default": "",
                        },
                    },
                    "required": ["title"],
                },
            ),
            Tool(
                name="list_tasks",
                description="List the user's tasks. Can filter by status (all, pending, completed).",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "filter": {
                            "type": "string",
                            "enum": ["all", "pending", "completed"],
                            "description": "Filter tasks by status",
                            "default": "all",
                        },
                    },
                    "required": [],
                },
            ),
            Tool(
                name="complete_task",
                description="Toggle a task's completion status. Marks pending tasks as completed and vice versa.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "task_id": {
                            "type": "string",
                            "description": "UUID of the task to toggle",
                        },
                    },
                    "required": ["task_id"],
                },
            ),
            Tool(
                name="update_task",
                description="Update a task's title and/or description.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "task_id": {
                            "type": "string",
                            "description": "UUID of the task to update",
                        },
                        "title": {
                            "type": "string",
                            "description": "New task title (1-100 characters)",
                            "minLength": 1,
                            "maxLength": 100,
                        },
                        "description": {
                            "type": "string",
                            "description": "New task description (0-500 characters)",
                            "maxLength": 500,
                        },
                    },
                    "required": ["task_id", "title"],
                },
            ),
            Tool(
                name="delete_task",
                description="Permanently delete a task from the user's todo list.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "task_id": {
                            "type": "string",
                            "description": "UUID of the task to delete",
                        },
                    },
                    "required": ["task_id"],
                },
            ),
        ]
        return tools

    @mcp_server.call_tool()
    async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
        """
        Execute a tool by name with the given arguments.

        Args:
            name: Tool name to execute
            arguments: Tool arguments from the AI agent

        Returns:
            List of TextContent with the tool result
        """
        handler = get_tool_handler(name)
        if handler is None:
            return [TextContent(
                type="text",
                text=f"Error: Unknown tool '{name}'",
            )]

        try:
            return await handler(**arguments)
        except Exception as e:
            return [TextContent(
                type="text",
                text=f"Error executing tool '{name}': {str(e)}",
            )]
