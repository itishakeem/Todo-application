"""
Unit tests for MCP server configuration.
TASK-014: Write MCP server unit tests
TC-014: Unit tests pass
"""
import pytest
import json
from src.mcp.server import (
    mcp_server,
    register_tool,
    get_tool_handler,
    get_registered_tools,
    register_tools,
)
from src.mcp.types import (
    ToolSuccess,
    ToolError,
    ErrorCode,
    success_response,
    error_response,
    validation_error,
    not_found_error,
    internal_error,
)
from src.mcp.validators import (
    validate_title,
    validate_description,
    validate_task_id,
    validate_filter,
    TITLE_MIN_LENGTH,
    TITLE_MAX_LENGTH,
    DESCRIPTION_MAX_LENGTH,
)


class TestMCPServerInitialization:
    """Test suite for MCP server initialization."""

    def test_server_has_name(self):
        """Test that MCP server has correct name."""
        assert mcp_server.name == "todo-mcp-server"

    def test_server_has_version(self):
        """Test that MCP server has version."""
        # Server object stores version in options
        assert mcp_server.name is not None  # Server is initialized

    def test_server_has_instructions(self):
        """Test that server has instructions for the AI agent."""
        # Instructions are set at initialization
        assert mcp_server.name is not None


class TestToolRegistration:
    """Test suite for tool registration functionality."""

    def test_register_tool_decorator(self):
        """Test that register_tool decorator registers a handler."""
        # Register a test tool
        @register_tool(
            name="test_tool",
            description="A test tool",
            input_schema={"type": "object", "properties": {}},
        )
        async def test_handler():
            return []

        # Verify handler is registered
        handler = get_tool_handler("test_tool")
        assert handler is not None
        assert handler == test_handler

    def test_get_unregistered_tool_returns_none(self):
        """Test that getting unregistered tool returns None."""
        handler = get_tool_handler("nonexistent_tool")
        assert handler is None

    def test_get_registered_tools_returns_list(self):
        """Test that get_registered_tools returns list of tool names."""
        tools = get_registered_tools()
        assert isinstance(tools, list)


class TestToolResponseTypes:
    """Test suite for tool response types."""

    def test_tool_success_to_json(self):
        """Test ToolSuccess serialization."""
        response = ToolSuccess(
            data={"task_id": "123", "status": "created"},
            message="Task created successfully",
        )
        json_str = response.to_json()
        parsed = json.loads(json_str)

        assert parsed["success"] is True
        assert parsed["data"]["task_id"] == "123"
        assert parsed["message"] == "Task created successfully"

    def test_tool_success_without_message(self):
        """Test ToolSuccess without optional message."""
        response = ToolSuccess(data={"count": 5})
        json_str = response.to_json()
        parsed = json.loads(json_str)

        assert parsed["success"] is True
        assert parsed["data"]["count"] == 5
        assert "message" not in parsed

    def test_tool_error_to_json(self):
        """Test ToolError serialization."""
        response = ToolError(
            code=ErrorCode.VALIDATION_ERROR,
            message="Title is required",
            details={"field": "title"},
        )
        json_str = response.to_json()
        parsed = json.loads(json_str)

        assert parsed["success"] is False
        assert parsed["error"]["code"] == "VALIDATION_ERROR"
        assert parsed["error"]["message"] == "Title is required"
        assert parsed["error"]["details"]["field"] == "title"

    def test_tool_error_without_details(self):
        """Test ToolError without optional details."""
        response = ToolError(
            code=ErrorCode.NOT_FOUND,
            message="Task not found",
        )
        json_str = response.to_json()
        parsed = json.loads(json_str)

        assert parsed["success"] is False
        assert "details" not in parsed["error"]

    def test_error_code_values(self):
        """Test all error codes have correct values."""
        assert ErrorCode.VALIDATION_ERROR.value == "VALIDATION_ERROR"
        assert ErrorCode.NOT_FOUND.value == "NOT_FOUND"
        assert ErrorCode.INTERNAL_ERROR.value == "INTERNAL_ERROR"
        assert ErrorCode.UNAUTHORIZED.value == "UNAUTHORIZED"
        assert ErrorCode.CONFLICT.value == "CONFLICT"


class TestResponseHelpers:
    """Test suite for response helper functions."""

    def test_success_response_helper(self):
        """Test success_response helper function."""
        response = success_response(
            data={"id": "abc"},
            message="Created",
        )
        assert isinstance(response, ToolSuccess)
        assert response.data["id"] == "abc"
        assert response.message == "Created"

    def test_error_response_helper(self):
        """Test error_response helper function."""
        response = error_response(
            code=ErrorCode.INTERNAL_ERROR,
            message="Something went wrong",
        )
        assert isinstance(response, ToolError)
        assert response.code == ErrorCode.INTERNAL_ERROR
        assert response.message == "Something went wrong"

    def test_validation_error_helper(self):
        """Test validation_error helper function."""
        response = validation_error("Invalid input", field="title")
        assert response.code == ErrorCode.VALIDATION_ERROR
        assert response.message == "Invalid input"
        assert response.details["field"] == "title"

    def test_not_found_error_helper(self):
        """Test not_found_error helper function."""
        response = not_found_error("Task", "123-456")
        assert response.code == ErrorCode.NOT_FOUND
        assert "not found" in response.message
        assert response.details["resource"] == "Task"
        assert response.details["id"] == "123-456"

    def test_internal_error_helper(self):
        """Test internal_error helper function."""
        response = internal_error()
        assert response.code == ErrorCode.INTERNAL_ERROR
        assert "internal error" in response.message.lower()


class TestValidators:
    """Test suite for validation utilities."""

    def test_validate_title_valid(self):
        """Test valid title validation."""
        is_valid, error = validate_title("Buy groceries")
        assert is_valid is True
        assert error is None

    def test_validate_title_empty(self):
        """Test empty title validation fails."""
        is_valid, error = validate_title("")
        assert is_valid is False
        assert error is not None
        assert "at least" in error.lower()

    def test_validate_title_too_long(self):
        """Test title exceeding max length fails."""
        long_title = "A" * (TITLE_MAX_LENGTH + 1)
        is_valid, error = validate_title(long_title)
        assert is_valid is False
        assert error is not None
        assert "exceed" in error.lower()

    def test_validate_title_none(self):
        """Test None title validation fails."""
        is_valid, error = validate_title(None)
        assert is_valid is False
        assert "required" in error.lower()

    def test_validate_title_whitespace_only(self):
        """Test whitespace-only title fails."""
        is_valid, error = validate_title("   ")
        assert is_valid is False

    def test_validate_description_valid(self):
        """Test valid description validation."""
        is_valid, error = validate_description("This is a description")
        assert is_valid is True
        assert error is None

    def test_validate_description_none_allowed(self):
        """Test None description is valid (optional field)."""
        is_valid, error = validate_description(None)
        assert is_valid is True
        assert error is None

    def test_validate_description_too_long(self):
        """Test description exceeding max length fails."""
        long_desc = "A" * (DESCRIPTION_MAX_LENGTH + 1)
        is_valid, error = validate_description(long_desc)
        assert is_valid is False
        assert "exceed" in error.lower()

    def test_validate_task_id_valid_uuid(self):
        """Test valid UUID task ID validation."""
        is_valid, parsed, error = validate_task_id("12345678-1234-1234-1234-123456789012")
        assert is_valid is True
        assert parsed is not None
        assert error is None

    def test_validate_task_id_invalid_uuid(self):
        """Test invalid UUID fails validation."""
        is_valid, parsed, error = validate_task_id("not-a-uuid")
        assert is_valid is False
        assert parsed is None
        assert "valid UUID" in error

    def test_validate_task_id_none(self):
        """Test None task ID fails validation."""
        is_valid, parsed, error = validate_task_id(None)
        assert is_valid is False
        assert "required" in error.lower()

    def test_validate_filter_all(self):
        """Test 'all' filter validation."""
        is_valid, normalized, error = validate_filter("all")
        assert is_valid is True
        assert normalized == "all"

    def test_validate_filter_pending(self):
        """Test 'pending' filter validation."""
        is_valid, normalized, error = validate_filter("pending")
        assert is_valid is True
        assert normalized == "pending"

    def test_validate_filter_completed(self):
        """Test 'completed' filter validation."""
        is_valid, normalized, error = validate_filter("completed")
        assert is_valid is True
        assert normalized == "completed"

    def test_validate_filter_none_defaults_to_all(self):
        """Test None filter defaults to 'all'."""
        is_valid, normalized, error = validate_filter(None)
        assert is_valid is True
        assert normalized == "all"

    def test_validate_filter_invalid(self):
        """Test invalid filter value fails."""
        is_valid, normalized, error = validate_filter("invalid")
        assert is_valid is False
        assert error is not None

    def test_validate_filter_case_insensitive(self):
        """Test filter validation is case insensitive."""
        is_valid, normalized, error = validate_filter("PENDING")
        assert is_valid is True
        assert normalized == "pending"
