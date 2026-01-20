"""
Type definitions for MCP tool responses.
Provides standardized success and error response types.
"""
from enum import Enum
from dataclasses import dataclass
from typing import Any
import json


class ErrorCode(str, Enum):
    """Standard error codes for MCP tool failures."""
    VALIDATION_ERROR = "VALIDATION_ERROR"
    NOT_FOUND = "NOT_FOUND"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    UNAUTHORIZED = "UNAUTHORIZED"
    CONFLICT = "CONFLICT"


@dataclass
class ToolSuccess:
    """
    Successful tool response.

    Attributes:
        data: The response payload (will be JSON serialized)
        message: Optional human-readable success message
    """
    data: dict[str, Any]
    message: str | None = None

    def to_json(self) -> str:
        """Serialize to JSON string for MCP response."""
        response = {
            "success": True,
            "data": self.data,
        }
        if self.message:
            response["message"] = self.message
        return json.dumps(response)


@dataclass
class ToolError:
    """
    Error tool response.

    Attributes:
        code: Error code from ErrorCode enum
        message: Human-readable error message
        details: Optional additional error details
    """
    code: ErrorCode
    message: str
    details: dict[str, Any] | None = None

    def to_json(self) -> str:
        """Serialize to JSON string for MCP response."""
        response = {
            "success": False,
            "error": {
                "code": self.code.value,
                "message": self.message,
            },
        }
        if self.details:
            response["error"]["details"] = self.details
        return json.dumps(response)


def success_response(
    data: dict[str, Any],
    message: str | None = None,
) -> ToolSuccess:
    """
    Create a success response.

    Args:
        data: Response payload
        message: Optional success message

    Returns:
        ToolSuccess instance
    """
    return ToolSuccess(data=data, message=message)


def error_response(
    code: ErrorCode,
    message: str,
    details: dict[str, Any] | None = None,
) -> ToolError:
    """
    Create an error response.

    Args:
        code: Error code
        message: Error message
        details: Optional error details

    Returns:
        ToolError instance
    """
    return ToolError(code=code, message=message, details=details)


def validation_error(message: str, field: str | None = None) -> ToolError:
    """Create a validation error response."""
    details = {"field": field} if field else None
    return error_response(ErrorCode.VALIDATION_ERROR, message, details)


def not_found_error(resource: str, resource_id: str) -> ToolError:
    """Create a not found error response."""
    return error_response(
        ErrorCode.NOT_FOUND,
        f"{resource} not found",
        {"resource": resource, "id": resource_id},
    )


def internal_error(message: str = "An internal error occurred") -> ToolError:
    """Create an internal error response."""
    return error_response(ErrorCode.INTERNAL_ERROR, message)
