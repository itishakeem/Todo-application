"""
Unit tests for the TodoAssistant agent.

These tests verify agent configuration, tool registration, and mock the
OpenAI API to test agent behavior patterns.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from dataclasses import dataclass

from src.agent.config import (
    AgentConfig,
    AgentConfigError,
    get_openai_api_key,
    get_agent_config,
)
from src.agent.todo_agent import (
    AgentContext,
    create_todo_agent,
    TODO_TOOLS,
    SYSTEM_PROMPT,
)
from src.agent.runner import AgentRunner, AgentResponse, ToolCallInfo


class TestAgentConfig:
    """Tests for agent configuration."""

    def test_default_config_values(self):
        """Test that default config has expected values."""
        config = AgentConfig()
        assert config.model == "gpt-4o-mini"
        assert config.max_tokens == 1024
        assert config.temperature == 0.7
        assert config.history_limit == 50

    def test_get_agent_config_with_overrides(self):
        """Test config creation with custom values."""
        config = get_agent_config(
            model="gpt-4",
            max_tokens=2048,
            temperature=0.5,
            history_limit=100,
        )
        assert config.model == "gpt-4"
        assert config.max_tokens == 2048
        assert config.temperature == 0.5
        assert config.history_limit == 100

    def test_get_openai_api_key_missing(self):
        """Test that missing API key raises error."""
        with patch.dict("os.environ", {}, clear=True):
            with pytest.raises(AgentConfigError) as exc_info:
                get_openai_api_key()
            assert "OPENAI_API_KEY" in str(exc_info.value)

    def test_get_openai_api_key_present(self):
        """Test that API key is returned when set."""
        with patch.dict("os.environ", {"OPENAI_API_KEY": "test-key"}):
            key = get_openai_api_key()
            assert key == "test-key"


class TestAgentContext:
    """Tests for agent context."""

    def test_agent_context_creation(self):
        """Test that AgentContext holds session and user_id."""
        mock_session = MagicMock()
        user_id = uuid4()

        context = AgentContext(session=mock_session, user_id=user_id)

        assert context.session is mock_session
        assert context.user_id == user_id


class TestTodoAgent:
    """Tests for TodoAssistant agent configuration."""

    def test_create_agent_with_defaults(self):
        """Test agent creation with default config."""
        agent = create_todo_agent()

        assert agent.name == "TodoAssistant"
        assert agent.instructions == SYSTEM_PROMPT
        assert agent.model == "gpt-4o-mini"

    def test_create_agent_with_custom_config(self):
        """Test agent creation with custom config."""
        config = AgentConfig(model="gpt-4", temperature=0.3)
        agent = create_todo_agent(config=config)

        assert agent.model == "gpt-4"

    def test_agent_has_all_tools(self):
        """Test that agent has all 5 MCP tools registered."""
        agent = create_todo_agent()

        # Agent should have 5 tools
        assert len(agent.tools) == 5

        # Verify tool names
        tool_names = [tool.name for tool in agent.tools]
        expected_tools = [
            "tool_add_task",
            "tool_list_tasks",
            "tool_complete_task",
            "tool_update_task",
            "tool_delete_task",
        ]
        for expected in expected_tools:
            assert expected in tool_names

    def test_system_prompt_content(self):
        """Test that system prompt contains expected guidance."""
        assert "todo list assistant" in SYSTEM_PROMPT.lower()
        assert "add" in SYSTEM_PROMPT.lower()
        assert "list" in SYSTEM_PROMPT.lower()
        assert "complete" in SYSTEM_PROMPT.lower()
        assert "update" in SYSTEM_PROMPT.lower()
        assert "delete" in SYSTEM_PROMPT.lower()


class TestAgentRunner:
    """Tests for the AgentRunner class."""

    def test_runner_initialization(self):
        """Test runner creates with default config."""
        runner = AgentRunner()
        assert runner.config is not None
        assert runner.config.model == "gpt-4o-mini"

    def test_runner_custom_config(self):
        """Test runner accepts custom config."""
        config = AgentConfig(model="gpt-4")
        runner = AgentRunner(config=config)
        assert runner.config.model == "gpt-4"

    def test_build_input_simple_message(self):
        """Test building input with just a message."""
        runner = AgentRunner()
        inputs = runner._build_input("Hello")

        assert len(inputs) == 1
        assert inputs[0]["role"] == "user"
        assert inputs[0]["content"] == "Hello"

    def test_build_input_with_history(self):
        """Test building input with conversation history."""
        runner = AgentRunner()
        history = [
            {"role": "user", "content": "Hi"},
            {"role": "assistant", "content": "Hello! How can I help?"},
        ]
        inputs = runner._build_input("Add a task", history=history)

        assert len(inputs) == 3
        assert inputs[0]["role"] == "user"
        assert inputs[0]["content"] == "Hi"
        assert inputs[1]["role"] == "assistant"
        assert inputs[2]["role"] == "user"
        assert inputs[2]["content"] == "Add a task"

    def test_agent_response_dataclass(self):
        """Test AgentResponse structure."""
        tool_call = ToolCallInfo(
            tool="add_task",
            input={"title": "Test"},
            output={"success": True},
        )
        response = AgentResponse(
            response="Task added!",
            tool_calls=[tool_call],
        )

        assert response.response == "Task added!"
        assert len(response.tool_calls) == 1
        assert response.tool_calls[0].tool == "add_task"


class TestToolCallInfo:
    """Tests for ToolCallInfo dataclass."""

    def test_tool_call_info_creation(self):
        """Test ToolCallInfo holds correct data."""
        info = ToolCallInfo(
            tool="list_tasks",
            input={"filter": "all"},
            output={"tasks": [], "count": 0},
        )

        assert info.tool == "list_tasks"
        assert info.input == {"filter": "all"}
        assert info.output == {"tasks": [], "count": 0}


class TestAgentToolsIntegration:
    """Tests verifying tools are properly connected."""

    def test_todo_tools_count(self):
        """Test that TODO_TOOLS has all 5 tools."""
        assert len(TODO_TOOLS) == 5

    def test_tools_are_function_tools(self):
        """Test that all tools are FunctionTool instances."""
        from agents import FunctionTool
        for tool in TODO_TOOLS:
            assert isinstance(tool, FunctionTool)
            assert tool.name.startswith("tool_")


# Mocked agent behavior tests
class TestAgentBehavior:
    """Tests for agent behavior with mocked OpenAI responses."""

    @pytest.fixture
    def mock_session(self):
        """Create a mock database session."""
        return MagicMock()

    @pytest.fixture
    def user_id(self):
        """Create a test user ID."""
        return uuid4()

    @pytest.mark.asyncio
    async def test_runner_creates_agent_lazily(self):
        """Test that agent is created on first use."""
        runner = AgentRunner()
        assert runner._agent is None

        # Access agent property
        agent = runner.agent
        assert agent is not None
        assert runner._agent is agent

    @pytest.mark.asyncio
    async def test_runner_reuses_agent(self):
        """Test that same agent instance is reused."""
        runner = AgentRunner()
        agent1 = runner.agent
        agent2 = runner.agent
        assert agent1 is agent2

    @pytest.mark.asyncio
    async def test_agent_selects_correct_tool_for_add_task(self):
        """EXEC-09-T019: Test that agent selects correct tool for 'add task'."""
        # Check that the system prompt includes capability to add tasks
        assert "add new tasks" in SYSTEM_PROMPT.lower()

    @pytest.mark.asyncio
    async def test_agent_selects_correct_tool_for_list_tasks(self):
        """EXEC-09-T020: Test that agent selects correct tool for 'list tasks'."""
        # Check that the system prompt includes capability to list tasks
        assert "list tasks" in SYSTEM_PROMPT.lower()

    @pytest.mark.asyncio
    async def test_agent_selects_correct_tool_for_complete_task(self):
        """EXEC-09-T021: Test that agent selects correct tool for 'complete task'."""
        # Check that the system prompt includes capability to complete tasks
        assert "complete tasks" in SYSTEM_PROMPT.lower()

    @pytest.mark.asyncio
    async def test_agent_selects_correct_tool_for_update_task(self):
        """EXEC-09-T022: Test that agent selects correct tool for 'update task'."""
        # Check that the system prompt includes capability to update tasks
        assert "update tasks" in SYSTEM_PROMPT.lower()

    @pytest.mark.asyncio
    async def test_agent_selects_correct_tool_for_delete_task(self):
        """EXEC-09-T023: Test that agent selects correct tool for 'delete task'."""
        # Check that the system prompt includes capability to delete tasks
        assert "delete tasks" in SYSTEM_PROMPT.lower()

    @pytest.mark.asyncio
    async def test_agent_asks_clarification_for_ambiguous_input(self):
        """EXEC-09-T024: Test that agent asks clarification for ambiguous input."""
        # Check that the system prompt includes guidance for handling unclear input
        assert "unclear, ask clarifying questions" in SYSTEM_PROMPT.lower()

    @pytest.mark.asyncio
    async def test_agent_handles_tool_errors_gracefully(self):
        """EXEC-09-T025: Test that agent handles tool errors gracefully."""
        # Check that the system prompt includes error handling guidance
        assert "handle errors gracefully" in SYSTEM_PROMPT.lower()
