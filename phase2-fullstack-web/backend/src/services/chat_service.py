"""
Chat Service for managing conversations and messages.
Provides stateless operations for the chat API.
"""
from datetime import datetime, timezone
from typing import Optional, Any
from uuid import UUID
import json

from sqlmodel import Session, select, func

from ..models.conversation import Conversation
from ..models.message import Message, MessageRole
from ..models.user import User


class ChatService:
    """
    Service for chat-related operations.
    All methods are stateless - state is stored in the database.
    """

    def __init__(self, session: Session):
        """
        Initialize ChatService with a database session.

        Args:
            session: SQLModel database session
        """
        self.session = session

    def create_conversation(self, user_id: UUID) -> Conversation:
        """
        Create a new conversation for a user.

        Args:
            user_id: UUID of the user

        Returns:
            Created Conversation object with generated ID
        """
        now = datetime.now(timezone.utc)
        conversation = Conversation(
            user_id=user_id,
            created_at=now,
            updated_at=now,
        )
        self.session.add(conversation)
        self.session.commit()
        self.session.refresh(conversation)
        return conversation

    def get_conversation(
        self, conversation_id: int, user_id: UUID
    ) -> Optional[Conversation]:
        """
        Get a conversation by ID, validating user ownership.

        Args:
            conversation_id: ID of the conversation
            user_id: UUID of the user (for ownership validation)

        Returns:
            Conversation if found and owned by user, None otherwise
        """
        statement = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
        return self.session.exec(statement).first()

    def get_user_conversations(
        self, user_id: UUID, limit: int = 50, offset: int = 0
    ) -> list[Conversation]:
        """
        Get all conversations for a user, ordered by most recent first.

        Args:
            user_id: UUID of the user
            limit: Maximum number of conversations to return
            offset: Number of conversations to skip

        Returns:
            List of Conversation objects
        """
        statement = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(self.session.exec(statement).all())

    def get_conversation_with_details(
        self, user_id: UUID, limit: int = 50, offset: int = 0
    ) -> list[dict[str, Any]]:
        """
        Get conversations with message count and last message preview.

        Args:
            user_id: UUID of the user
            limit: Maximum number of conversations
            offset: Number to skip

        Returns:
            List of dicts with conversation details
        """
        conversations = self.get_user_conversations(user_id, limit, offset)
        result = []

        for conv in conversations:
            # Get message count
            count_stmt = (
                select(func.count(Message.id))
                .where(Message.conversation_id == conv.id)
            )
            message_count = self.session.exec(count_stmt).one()

            # Get last message preview
            last_msg_stmt = (
                select(Message)
                .where(Message.conversation_id == conv.id)
                .order_by(Message.created_at.desc())
                .limit(1)
            )
            last_message = self.session.exec(last_msg_stmt).first()
            preview = ""
            if last_message:
                preview = last_message.content[:100] if last_message.content else ""

            result.append({
                "id": conv.id,
                "created_at": conv.created_at.isoformat() if conv.created_at else None,
                "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
                "message_count": message_count,
                "last_message_preview": preview,
            })

        return result

    def add_message(
        self,
        conversation_id: int,
        user_id: UUID,
        role: MessageRole,
        content: str,
        tool_calls: Optional[list[dict[str, Any]]] = None,
    ) -> Message:
        """
        Add a message to a conversation.

        Args:
            conversation_id: ID of the conversation
            user_id: UUID of the user
            role: MessageRole (user or assistant)
            content: Message content text
            tool_calls: Optional list of tool calls (for assistant messages)

        Returns:
            Created Message object
        """
        now = datetime.now(timezone.utc)
        message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role=role,
            content=content,
            tool_calls=tool_calls,
            created_at=now,
        )
        self.session.add(message)

        # Update conversation's updated_at
        conversation = self.session.get(Conversation, conversation_id)
        if conversation:
            conversation.updated_at = now
            self.session.add(conversation)

        self.session.commit()
        self.session.refresh(message)
        return message

    def get_messages(
        self,
        conversation_id: int,
        user_id: UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[Message], int, bool]:
        """
        Get messages for a conversation with pagination.

        Args:
            conversation_id: ID of the conversation
            user_id: UUID of the user (for ownership validation)
            limit: Maximum messages to return (default 50, max 100)
            offset: Number of messages to skip

        Returns:
            Tuple of (messages, total_count, has_more)
        """
        # Validate ownership
        conversation = self.get_conversation(conversation_id, user_id)
        if not conversation:
            return [], 0, False

        # Cap limit at 100
        limit = min(limit, 100)

        # Get total count
        count_stmt = (
            select(func.count(Message.id))
            .where(Message.conversation_id == conversation_id)
        )
        total = self.session.exec(count_stmt).one()

        # Get messages
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .offset(offset)
            .limit(limit)
        )
        messages = list(self.session.exec(statement).all())

        has_more = (offset + len(messages)) < total

        return messages, total, has_more

    def get_history_for_agent(
        self, conversation_id: int, limit: int = 50
    ) -> list[dict[str, str]]:
        """
        Get message history formatted for the agent context.

        Args:
            conversation_id: ID of the conversation
            limit: Maximum messages to load (default 50)

        Returns:
            List of dicts with role and content for agent input
        """
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .limit(limit)
        )
        messages = self.session.exec(statement).all()

        return [
            {
                "role": msg.role.value,
                "content": msg.content,
            }
            for msg in messages
        ]

    def get_conversation_count(self, user_id: UUID) -> int:
        """
        Get total conversation count for a user.

        Args:
            user_id: UUID of the user

        Returns:
            Total number of conversations
        """
        statement = (
            select(func.count(Conversation.id))
            .where(Conversation.user_id == user_id)
        )
        return self.session.exec(statement).one()

    def delete_conversation(self, conversation_id: int, user_id: UUID) -> bool:
        """
        Delete a conversation and all its messages.

        Args:
            conversation_id: ID of the conversation to delete
            user_id: UUID of the user (for ownership validation)

        Returns:
            True if deleted, False if not found or unauthorized
        """
        # Validate ownership
        conversation = self.get_conversation(conversation_id, user_id)
        if not conversation:
            return False

        # Delete all messages in the conversation first
        delete_messages_stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
        )
        messages = self.session.exec(delete_messages_stmt).all()
        for msg in messages:
            self.session.delete(msg)

        # Delete the conversation
        self.session.delete(conversation)
        self.session.commit()

        return True

    async def process_message(
        self,
        user_id: UUID,
        message: str,
        conversation_id: Optional[int] = None,
    ) -> dict[str, Any]:
        """
        Process a user message through the agent (stateless).

        This method:
        1. Creates or retrieves the conversation
        2. Loads conversation history from DB
        3. Runs the agent with the message
        4. Stores user and assistant messages
        5. Returns the response

        Args:
            user_id: UUID of the user
            message: User's natural language message
            conversation_id: Optional existing conversation ID

        Returns:
            Dict with conversation_id, response, and tool_calls
        """
        from ..agent.runner import AgentRunner

        # Create or get conversation
        if conversation_id is None:
            conversation = self.create_conversation(user_id)
        else:
            conversation = self.get_conversation(conversation_id, user_id)
            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found or unauthorized")

        # Load history from database (stateless - no in-memory state)
        history = self.get_history_for_agent(conversation.id)

        # T-CHATBOT-FIX: Fetch user name for personalized responses
        user = self.session.get(User, user_id)
        user_name = user.name if user else None

        # Store user message
        self.add_message(
            conversation.id, user_id, MessageRole.USER, message
        )

        try:
            # Run agent with user name for personalization
            runner = AgentRunner()
            agent_response = await runner.run(
                session=self.session,
                user_id=user_id,
                message=message,
                history=history,
                user_name=user_name,
            )
        except Exception as e:
            # Log the specific error that occurred during agent execution
            import traceback
            print(f"Agent execution error: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")

            # Re-raise the exception to be caught by the API layer
            raise

        # Convert tool_calls to serializable format
        tool_calls_data = [
            {
                "tool": tc.tool,
                "input": tc.input,
                "output": tc.output,
            }
            for tc in agent_response.tool_calls
        ]

        # Store assistant message with tool calls
        self.add_message(
            conversation.id,
            user_id,
            MessageRole.ASSISTANT,
            agent_response.response,
            tool_calls=tool_calls_data if tool_calls_data else None,
        )

        return {
            "conversation_id": conversation.id,
            "response": agent_response.response,
            "tool_calls": tool_calls_data,
        }
