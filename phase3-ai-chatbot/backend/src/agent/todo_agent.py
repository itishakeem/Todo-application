"""
TodoAssistant Agent configuration and tools.
Provides the AI agent for natural language task management.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID
import json

from agents import Agent, function_tool, RunContextWrapper, ModelSettings
from sqlmodel import Session

from .config import AgentConfig, get_agent_config
from ..mcp.tools import add_task, list_tasks, complete_task, update_task, delete_task


def get_system_prompt(user_name: Optional[str] = None) -> str:
    """Generate system prompt with current date/time and user information."""
    now = datetime.now()
    date_str = now.strftime("%A, %B %d, %Y")  # e.g., "Sunday, January 19, 2026"
    time_str = now.strftime("%I:%M %p")  # e.g., "07:30 PM"

    # User context for name queries
    user_context = ""
    if user_name:
        user_context = f"\nUSER INFORMATION:\n- The authenticated user's name is: {user_name}\n- If user asks 'what is my name?', 'mera naam kya hai?', or similar, respond: 'Your name is {user_name}, Sir.'\n"
    else:
        user_context = "\nUSER INFORMATION:\n- User is not authenticated or name not available\n- If user asks their name, say: 'I don't have your name on record, Sir.'\n"

    return f"""You are TaskFlow Assistant - a professional todo list assistant. You ONLY help with task management.
{user_context}

CRITICAL RULES - MUST FOLLOW:
1. ALWAYS address the user as "Sir" in EVERY response (e.g., "Hello Sir!", "Sure Sir!", "Done Sir!")
2. You are STRICTLY a task management assistant. REFUSE any questions not related to tasks.
3. For greetings ("hi", "hello", "hey", "salam", "assalam o alaikum"):
   - Respond warmly but briefly: "Hello Sir! How can I help you with your tasks today?"
4. If user asks ANYTHING not about tasks (weather, math, coding, news, general knowledge, etc.):
   - ALWAYS refuse politely: "I apologize Sir, but I can only help with task management. How can I assist with your tasks?"

WHAT YOU CAN DO:
- Add, list, complete, update, delete tasks
- Answer questions about the user's OWN tasks
- Respond to casual greetings politely
- Tell the user their name if they ask (use the name from USER INFORMATION above)

WHAT YOU MUST REFUSE:
- General knowledge questions
- Coding, math, science help
- News, weather, sports discussions
- ANY topic not related to task management
- Just say: "I apologize Sir, I can only help with your tasks. Would you like to add, view, or manage your tasks?"

LANGUAGE: Respond in the SAME LANGUAGE as the user. If Urdu, respond in Urdu. If English, respond in English. Always use "Sir".

IMPORTANT - Current Date/Time:
- Today: {date_str}
- Time: {time_str}
- Use for relative dates like "tomorrow", "next week", "kal", "aglay haftay"

Your task capabilities:
- Add new tasks (add, create, remember, "yaad karwao")
- List tasks (show, see, list, "dikhaao")
- Complete tasks (done, finished, "ho gaya", "mukammal")
- Update tasks (change, rename, modify, "badlo")
- Delete tasks (delete, remove, "hatao", "delete karo")

CRITICAL WORKFLOW for Delete/Update/Complete operations:
1. FIRST: Call list_tasks to get tasks. The response contains "full_id" field - this is the UUID you MUST use.
2. THEN: Match the user's request to the task(s) by title/description
3. ASK FOR CONFIRMATION ONCE (only if you haven't already in this conversation)
4. WHEN USER CONFIRMS (says "yes", "haan", "g", "ji", "delete karo", "karo", "do it", "go ahead", etc.):
   - IMMEDIATELY call the tool (delete_task, complete_task, update_task) with the "full_id" value
   - DO NOT ask for confirmation again
   - DO NOT call list_tasks again after confirmation
   - For BULK operations (e.g., "delete all completed tasks"), call delete_task ONCE for EACH task
5. If user says "no", "nahi", "cancel", "mat karo" - cancel the operation

BULK DELETE HANDLING:
- If user says "delete all completed tasks" or similar, first call list_tasks with filter="completed"
- Then call delete_task separately for EACH task using its "full_id"
- Report success: "Deleted X completed tasks" or list them by name

VERY IMPORTANT - Using Task IDs:
- The list_tasks response has "id" (short) and "full_id" (complete UUID)
- You MUST use the "full_id" value when calling delete_task, complete_task, or update_task
- Example: If list_tasks returns {{"id": "abc12345", "full_id": "abc12345-6789-...", "title": "Buy milk"}}
  Then call delete_task with task_id="abc12345-6789-..." (the full_id value)

CONFIRMATION RECOGNITION - These ALL mean YES:
- English: "yes", "yeah", "yep", "sure", "ok", "okay", "do it", "go ahead", "confirm", "delete it"
- Urdu: "haan", "han", "ji", "g", "ji haan", "kar do", "karo", "delete karo", "hata do", "theek hai"

Guidelines:
- ONLY ask for confirmation ONCE, then act on the user's response
- When listing tasks, format them clearly and numbered (1, 2, 3...) - don't show UUIDs to users
- Never expose technical error details or UUIDs to users
- Be helpful and engaging in your responses
- Acknowledge user accomplishments and provide encouragement

Example flow:
1. User: "delete my task"
2. You: Call list_tasks → find task with full_id="abc-123-..."
3. You: "I found 'Buy groceries'. Delete it?"
4. User: "yes" or "haan" or "g"
5. You: IMMEDIATELY call delete_task(task_id="abc-123-...") - NO more questions!
6. You: "Done! Task deleted." """


@dataclass
class AgentContext:
    """
    Context passed to agent tools during execution.

    Attributes:
        session: Database session for task operations
        user_id: UUID of the authenticated user
    """
    session: Session
    user_id: UUID


def _parse_tool_response(response_text: str) -> dict:
    """Parse JSON response from MCP tools."""
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        return {"success": False, "error": {"message": response_text}}


@function_tool
async def tool_add_task(
    ctx: RunContextWrapper[AgentContext],
    title: str,
    description: str = "",
) -> str:
    """
    Add a new task to the user's todo list.

    Args:
        title: Task title (1-100 characters, required)
        description: Task description (0-500 characters, optional)

    Returns:
        Confirmation message with the created task details.
    """
    result = await add_task(
        session=ctx.context.session,
        user_id=ctx.context.user_id,
        title=title,
        description=description,
    )
    # Return the text content from the MCP tool
    return result[0].text if result else "Failed to add task"


@function_tool
async def tool_list_tasks(
    ctx: RunContextWrapper[AgentContext],
    filter: str = "all",
) -> str:
    """
    List the user's tasks with optional filtering.

    Args:
        filter: Filter by status - 'all', 'pending', or 'completed' (default: 'all')

    Returns:
        JSON with tasks array. Each task has "full_id" (use this for delete/update/complete operations).
    """
    result = await list_tasks(
        session=ctx.context.session,
        user_id=ctx.context.user_id,
        filter=filter,
    )
    response = result[0].text if result else "Failed to list tasks"
    print(f"[DEBUG] tool_list_tasks response: {response}")
    return response


@function_tool
async def tool_complete_task(
    ctx: RunContextWrapper[AgentContext],
    task_id: str,
) -> str:
    """
    Toggle a task's completion status. Marks pending tasks as completed and vice versa.

    Args:
        task_id: The UUID of the task to toggle (use full ID from list_tasks)

    Returns:
        Confirmation of the status change.
    """
    result = await complete_task(
        session=ctx.context.session,
        user_id=ctx.context.user_id,
        task_id=task_id,
    )
    return result[0].text if result else "Failed to complete task"


@function_tool
async def tool_update_task(
    ctx: RunContextWrapper[AgentContext],
    task_id: str,
    title: str,
    description: Optional[str] = None,
) -> str:
    """
    Update a task's title and optionally its description.

    Args:
        task_id: The UUID of the task to update
        title: New task title (1-100 characters, required)
        description: New task description (0-500 characters, optional)

    Returns:
        Confirmation of the update.
    """
    result = await update_task(
        session=ctx.context.session,
        user_id=ctx.context.user_id,
        task_id=task_id,
        title=title,
        description=description,
    )
    return result[0].text if result else "Failed to update task"


@function_tool
async def tool_delete_task(
    ctx: RunContextWrapper[AgentContext],
    task_id: str,
) -> str:
    """
    Permanently delete a task from the user's todo list.

    Args:
        task_id: The full UUID of the task to delete (use "full_id" from list_tasks)

    Returns:
        Confirmation of deletion.
    """
    print(f"[DEBUG] tool_delete_task called with task_id: {task_id}")
    result = await delete_task(
        session=ctx.context.session,
        user_id=ctx.context.user_id,
        task_id=task_id,
    )
    response = result[0].text if result else "Failed to delete task"
    print(f"[DEBUG] tool_delete_task response: {response}")
    return response


# All tools available to the agent
TODO_TOOLS = [
    tool_add_task,
    tool_list_tasks,
    tool_complete_task,
    tool_update_task,
    tool_delete_task,
]


def create_todo_agent(config: Optional[AgentConfig] = None, user_name: Optional[str] = None) -> Agent[AgentContext]:
    """
    Create a TodoAssistant agent instance.

    Args:
        config: Optional AgentConfig for customization. Uses defaults if not provided.
        user_name: Optional user name for personalized responses.

    Returns:
        Configured Agent instance ready for use with Runner.
    """
    if config is None:
        config = get_agent_config()

    return Agent[AgentContext](
        name="TodoAssistant",
        instructions=get_system_prompt(user_name),
        model=config.model,
        tools=TODO_TOOLS,
        model_settings=ModelSettings(
            temperature=config.temperature,
            max_tokens=config.max_tokens,
        ),
    )


# Type alias for the agent
TodoAgent = Agent[AgentContext]
