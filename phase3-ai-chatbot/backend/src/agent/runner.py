"""
Agent Runner for executing the TodoAssistant agent.
Provides the execution layer for processing chat messages.
"""
from dataclasses import dataclass
from typing import Any, Optional
from uuid import UUID

from agents import Runner, ToolCallItem, ToolCallOutputItem
from sqlmodel import Session

from .todo_agent import AgentContext, create_todo_agent, TodoAgent
from .config import AgentConfig, get_agent_config


@dataclass
class ToolCallInfo:
    """
    Information about a tool call made by the agent.

    Attributes:
        tool: Name of the tool called
        input: Input parameters passed to the tool
        output: Output returned by the tool
    """
    tool: str
    input: dict[str, Any]
    output: Any


@dataclass
class AgentResponse:
    """
    Response from the agent runner.

    Attributes:
        response: The agent's text response to the user
        tool_calls: List of tool calls made during processing
    """
    response: str
    tool_calls: list[ToolCallInfo]


class AgentRunner:
    """
    Runner for executing the TodoAssistant agent.

    This class provides a stateless execution model - each run is independent
    and all context (history, user_id) must be provided per request.
    """

    def __init__(self, config: Optional[AgentConfig] = None):
        """
        Initialize the AgentRunner.

        Args:
            config: Optional AgentConfig for customization.
        """
        self.config = config or get_agent_config()
        self._agent: Optional[TodoAgent] = None

    def get_agent(self, user_name: Optional[str] = None) -> TodoAgent:
        """Get or create the agent instance.

        Note: Agent is created fresh each time to ensure current date/time
        in the system prompt is accurate.

        Args:
            user_name: Optional user name for personalized responses.
        """
        # Always create fresh agent to get current date/time in prompt
        return create_todo_agent(self.config, user_name=user_name)

    def _build_input(
        self,
        message: str,
        history: Optional[list[dict[str, str]]] = None,
    ) -> list[dict[str, Any]]:
        """
        Build the input list for the agent from message and history.

        Args:
            message: The current user message
            history: Optional list of previous messages
                    [{"role": "user"|"assistant", "content": "..."}]

        Returns:
            List of input items for the agent
        """
        input_items: list[dict[str, Any]] = []

        # Add history if provided
        if history:
            for msg in history:
                input_items.append({
                    "role": msg["role"],
                    "content": msg["content"],
                })

        # Add current message
        input_items.append({
            "role": "user",
            "content": message,
        })

        return input_items

    def _extract_tool_calls(self, new_items: list) -> list[ToolCallInfo]:
        """
        Extract tool call information from agent run items.

        Args:
            new_items: List of items from the agent run

        Returns:
            List of ToolCallInfo objects
        """
        tool_calls: list[ToolCallInfo] = []
        tool_inputs: dict[str, dict[str, Any]] = {}

        def get_attr(obj: Any, key: str, default: Any = None) -> Any:
            """Get attribute from object or dict."""
            if isinstance(obj, dict):
                return obj.get(key, default)
            return getattr(obj, key, default)

        for item in new_items:
            if isinstance(item, ToolCallItem):
                # Store the tool call input by ID for later matching
                raw = item.raw_item
                item_id = get_attr(raw, 'id') or get_attr(raw, 'call_id')
                item_name = get_attr(raw, 'name') or get_attr(raw, 'function', {})
                if isinstance(item_name, dict):
                    item_name = item_name.get('name', 'unknown')
                item_args = get_attr(raw, 'arguments', {})
                if isinstance(item_args, str):
                    try:
                        import json
                        item_args = json.loads(item_args)
                    except (json.JSONDecodeError, TypeError):
                        item_args = {}
                if item_id:
                    tool_inputs[item_id] = {
                        "tool": item_name,
                        "input": item_args,
                    }
            elif isinstance(item, ToolCallOutputItem):
                # Match with the tool call input
                raw = item.raw_item
                call_id = get_attr(raw, 'call_id') or get_attr(raw, 'tool_call_id')
                if call_id and call_id in tool_inputs:
                    info = tool_inputs[call_id]
                    tool_calls.append(ToolCallInfo(
                        tool=info["tool"],
                        input=info["input"],
                        output=item.output,
                    ))

        return tool_calls

    async def run(
        self,
        session: Session,
        user_id: UUID,
        message: str,
        history: Optional[list[dict[str, str]]] = None,
        user_name: Optional[str] = None,
    ) -> AgentResponse:
        """
        Run the agent with a user message.

        Args:
            session: Database session for task operations
            user_id: UUID of the authenticated user
            message: The user's natural language message
            history: Optional conversation history
            user_name: Optional user name for personalized responses

        Returns:
            AgentResponse with the agent's response and tool calls
        """
        # Create context for tools
        context = AgentContext(session=session, user_id=user_id)

        # Build input from message and history
        input_items = self._build_input(message, history)

        # Debug: Log the input being sent to agent
        print(f"[DEBUG] Agent input message: {message}")
        print(f"[DEBUG] History length: {len(history) if history else 0}")
        print(f"[DEBUG] User name: {user_name}")
        if history:
            for i, h in enumerate(history[-4:]):  # Last 4 messages
                print(f"[DEBUG] History[-{len(history)-i}]: {h['role']}: {h['content'][:100]}...")

        # Run the agent with user name for personalization
        result = await Runner.run(
            starting_agent=self.get_agent(user_name),
            input=input_items,
            context=context,
        )

        # Debug: Log what the agent returned
        print(f"[DEBUG] Agent new_items count: {len(result.new_items)}")
        for item in result.new_items:
            print(f"[DEBUG] Agent item type: {type(item).__name__}")

        # Extract tool calls from the run
        tool_calls = self._extract_tool_calls(result.new_items)

        # Get the final response
        response = result.final_output or ""
        if not isinstance(response, str):
            response = str(response)

        return AgentResponse(
            response=response,
            tool_calls=tool_calls,
        )


async def run_agent(
    session: Session,
    user_id: UUID,
    message: str,
    history: Optional[list[dict[str, str]]] = None,
    config: Optional[AgentConfig] = None,
    user_name: Optional[str] = None,
) -> AgentResponse:
    """
    Convenience function to run the agent with a single message.

    Args:
        session: Database session for task operations
        user_id: UUID of the authenticated user
        message: The user's natural language message
        history: Optional conversation history
        config: Optional AgentConfig for customization
        user_name: Optional user name for personalized responses

    Returns:
        AgentResponse with the agent's response and tool calls
    """
    runner = AgentRunner(config=config)
    return await runner.run(
        session=session,
        user_id=user_id,
        message=message,
        history=history,
        user_name=user_name,
    )
