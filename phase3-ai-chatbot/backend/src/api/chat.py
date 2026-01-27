"""
Chat API endpoints for the AI-powered Todo Chatbot.
Provides endpoints for chat interactions and conversation management.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlmodel import Session
from typing import Optional, Any
from uuid import UUID
from pydantic import BaseModel, Field

from ..db.connection import get_session
from ..services.chat_service import ChatService
from ..models.message import MessageRole


router = APIRouter(prefix="/api/chat", tags=["chat"])


# ============================================
# Request/Response Models (TASK-045)
# ============================================

class ChatRequest(BaseModel):
    """Request model for sending a chat message."""
    conversation_id: Optional[int] = Field(
        default=None,
        description="Optional conversation ID to continue. If not provided, creates a new conversation.",
    )
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User message (1-2000 characters)",
    )


class ToolCallInfo(BaseModel):
    """Information about a tool call made by the agent."""
    tool: str
    input: dict[str, Any]
    output: Any


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    conversation_id: int
    response: str
    tool_calls: list[ToolCallInfo]


class ConversationSummary(BaseModel):
    """Summary of a conversation for listing."""
    id: int
    created_at: Optional[str]
    updated_at: Optional[str]
    message_count: int
    last_message_preview: str


class ConversationListResponse(BaseModel):
    """Response model for conversation list endpoint."""
    conversations: list[ConversationSummary]
    total: int


class MessageResponse(BaseModel):
    """Response model for a single message."""
    id: int
    role: str
    content: str
    tool_calls: Optional[list[dict[str, Any]]] = None
    created_at: Optional[str]


class MessageListResponse(BaseModel):
    """Response model for message list endpoint."""
    messages: list[MessageResponse]
    total: int
    has_more: bool


class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str
    code: Optional[str] = None


# ============================================
# Auth Dependency
# ============================================

async def get_current_user_id(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
) -> UUID:
    """
    Get current user ID from X-User-Id header.
    Validates the user is authenticated.
    """
    if not x_user_id:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please login first."
        )

    try:
        return UUID(x_user_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID format"
        )


# ============================================
# Chat Endpoints
# ============================================

@router.post("", response_model=ChatResponse)
async def send_chat_message(
    request: ChatRequest,
    session: Session = Depends(get_session),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Send a message to the AI chatbot.

    Creates a new conversation if conversation_id is not provided.
    Loads conversation history and runs the agent.
    Stores both user and assistant messages.

    Returns:
    - 200: Chat response with conversation_id, response, and tool_calls
    - 400: Validation error
    - 401: Authentication required
    - 404: Conversation not found (if conversation_id provided)
    - 500: Internal server error
    """
    try:
        chat_service = ChatService(session)
        result = await chat_service.process_message(
            user_id=user_id,
            message=request.message,
            conversation_id=request.conversation_id,
        )

        return ChatResponse(
            conversation_id=result["conversation_id"],
            response=result["response"],
            tool_calls=[
                ToolCallInfo(**tc) for tc in result["tool_calls"]
            ],
        )

    except ValueError as e:
        # Conversation not found or unauthorized
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Log the actual error for debugging
        import traceback
        print(f"Chat API Error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")

        # Return more specific error message based on the actual error
        error_detail = str(e)
        if "OPENAI_API_KEY" in error_detail.upper():
            error_detail = "OpenAI API configuration error. Please check your API key."
        elif "agents" in error_detail.lower():
            error_detail = "AI agent initialization error. Please check agent configuration."
        elif "module" in error_detail.lower() and "not found" in error_detail.lower():
            error_detail = "Required module not found. Please check dependencies."

        raise HTTPException(status_code=500, detail=f"An error occurred processing your message: {error_detail}")


# ============================================
# Conversation Endpoints
# ============================================

@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Get list of user's conversations.

    Returns conversations ordered by most recently updated first.
    Each conversation includes message count and last message preview.

    Query Parameters:
    - limit: Maximum number to return (1-100, default 50)
    - offset: Number to skip for pagination

    Returns:
    - 200: List of conversations with total count
    - 401: Authentication required
    """
    try:
        chat_service = ChatService(session)

        # Get conversation details
        conversations_data = chat_service.get_conversation_with_details(
            user_id=user_id,
            limit=limit,
            offset=offset,
        )

        # Get total count
        total = chat_service.get_conversation_count(user_id)

        return ConversationListResponse(
            conversations=[
                ConversationSummary(**conv) for conv in conversations_data
            ],
            total=total,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve conversations")


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    session: Session = Depends(get_session),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Delete a conversation and all its messages.

    Validates that the user owns the conversation before deletion.

    Path Parameters:
    - conversation_id: ID of the conversation to delete

    Returns:
    - 200: Success message
    - 401: Authentication required
    - 404: Conversation not found or not owned by user
    """
    try:
        chat_service = ChatService(session)
        deleted = chat_service.delete_conversation(conversation_id, user_id)

        if not deleted:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )

        return {"message": "Conversation deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete conversation")


@router.get("/conversations/{conversation_id}/messages", response_model=MessageListResponse)
async def get_conversation_messages(
    conversation_id: int,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Get messages for a specific conversation.

    Validates that the user owns the conversation.
    Returns messages ordered by creation time.

    Path Parameters:
    - conversation_id: ID of the conversation

    Query Parameters:
    - limit: Maximum messages to return (1-100, default 50)
    - offset: Number to skip for pagination

    Returns:
    - 200: List of messages with total count and has_more flag
    - 401: Authentication required
    - 404: Conversation not found or not owned by user
    """
    try:
        chat_service = ChatService(session)

        # Validate user owns conversation
        conversation = chat_service.get_conversation(conversation_id, user_id)
        if not conversation:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )

        # Get messages with pagination
        messages, total, has_more = chat_service.get_messages(
            conversation_id=conversation_id,
            user_id=user_id,
            limit=limit,
            offset=offset,
        )

        return MessageListResponse(
            messages=[
                MessageResponse(
                    id=msg.id,
                    role=msg.role.value,
                    content=msg.content,
                    tool_calls=msg.tool_calls,
                    created_at=msg.created_at.isoformat() if msg.created_at else None,
                )
                for msg in messages
            ],
            total=total,
            has_more=has_more,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve messages")
