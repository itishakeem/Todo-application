"""
MCP (Model Context Protocol) Server for Phase III AI Chatbot.
Provides todo management tools for the OpenAI Agent.
"""
from .server import mcp_server, register_tools, register_tool_handlers, get_tool_handler, get_registered_tools
from .types import ToolSuccess, ToolError, ErrorCode
from .tools import add_task, list_tasks, complete_task, update_task, delete_task

__all__ = [
    # Server
    "mcp_server",
    "register_tools",
    "register_tool_handlers",
    "get_tool_handler",
    "get_registered_tools",
    # Types
    "ToolSuccess",
    "ToolError",
    "ErrorCode",
    # Tools
    "add_task",
    "list_tasks",
    "complete_task",
    "update_task",
    "delete_task",
]
