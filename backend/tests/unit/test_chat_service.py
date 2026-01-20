"""
Unit tests for the ChatService.
Tests conversation and message management operations.
"""
import pytest
from datetime import datetime, timezone
from uuid import uuid4

from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import StaticPool

from src.services.chat_service import ChatService
from src.models.conversation import Conversation
from src.models.message import Message, MessageRole


@pytest.fixture(name="engine")
def engine_fixture():
    """Create an in-memory SQLite engine for testing."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture(name="session")
def session_fixture(engine):
    """Create a test session."""
    with Session(engine) as session:
        yield session


@pytest.fixture(name="chat_service")
def chat_service_fixture(session):
    """Create a ChatService instance."""
    return ChatService(session)


@pytest.fixture(name="user_id")
def user_id_fixture():
    """Create a test user ID."""
    return uuid4()


class TestCreateConversation:
    """Tests for conversation creation."""

    def test_create_conversation_returns_conversation(
        self, chat_service: ChatService, user_id
    ):
        """Test that create_conversation returns a Conversation object."""
        conversation = chat_service.create_conversation(user_id)

        assert isinstance(conversation, Conversation)
        assert conversation.id is not None
        assert conversation.user_id == user_id

    def test_create_conversation_sets_timestamps(
        self, chat_service: ChatService, user_id
    ):
        """Test that created_at and updated_at are set."""
        before = datetime.now(timezone.utc)
        conversation = chat_service.create_conversation(user_id)
        after = datetime.now(timezone.utc)

        assert conversation.created_at is not None
        assert conversation.updated_at is not None
        # Timestamps should be within test window
        assert before <= conversation.created_at.replace(tzinfo=timezone.utc) <= after

    def test_create_multiple_conversations(
        self, chat_service: ChatService, user_id
    ):
        """Test creating multiple conversations for same user."""
        conv1 = chat_service.create_conversation(user_id)
        conv2 = chat_service.create_conversation(user_id)

        assert conv1.id != conv2.id
        assert conv1.user_id == conv2.user_id == user_id


class TestGetConversation:
    """Tests for getting a single conversation."""

    def test_get_conversation_returns_conversation(
        self, chat_service: ChatService, user_id
    ):
        """Test that get_conversation returns the correct conversation."""
        created = chat_service.create_conversation(user_id)

        retrieved = chat_service.get_conversation(created.id, user_id)

        assert retrieved is not None
        assert retrieved.id == created.id

    def test_get_conversation_wrong_user_returns_none(
        self, chat_service: ChatService, user_id
    ):
        """Test that wrong user_id returns None."""
        created = chat_service.create_conversation(user_id)
        other_user = uuid4()

        retrieved = chat_service.get_conversation(created.id, other_user)

        assert retrieved is None

    def test_get_conversation_not_found_returns_none(
        self, chat_service: ChatService, user_id
    ):
        """Test that non-existent conversation returns None."""
        retrieved = chat_service.get_conversation(99999, user_id)

        assert retrieved is None


class TestGetUserConversations:
    """Tests for listing user conversations."""

    def test_get_user_conversations_returns_list(
        self, chat_service: ChatService, user_id
    ):
        """Test that get_user_conversations returns a list."""
        chat_service.create_conversation(user_id)
        chat_service.create_conversation(user_id)

        conversations = chat_service.get_user_conversations(user_id)

        assert isinstance(conversations, list)
        assert len(conversations) == 2

    def test_get_user_conversations_ordered_by_updated_at(
        self, chat_service: ChatService, user_id, session
    ):
        """Test that conversations are ordered by updated_at descending."""
        conv1 = chat_service.create_conversation(user_id)
        conv2 = chat_service.create_conversation(user_id)

        # Update conv1 to be more recent
        chat_service.add_message(
            conv1.id, user_id, MessageRole.USER, "Hello"
        )

        conversations = chat_service.get_user_conversations(user_id)

        # conv1 should be first (most recently updated)
        assert conversations[0].id == conv1.id

    def test_get_user_conversations_respects_limit(
        self, chat_service: ChatService, user_id
    ):
        """Test that limit parameter works."""
        for _ in range(5):
            chat_service.create_conversation(user_id)

        conversations = chat_service.get_user_conversations(user_id, limit=2)

        assert len(conversations) == 2

    def test_get_user_conversations_respects_offset(
        self, chat_service: ChatService, user_id
    ):
        """Test that offset parameter works."""
        for _ in range(5):
            chat_service.create_conversation(user_id)

        all_convs = chat_service.get_user_conversations(user_id)
        offset_convs = chat_service.get_user_conversations(user_id, offset=2)

        assert len(offset_convs) == 3
        assert offset_convs[0].id == all_convs[2].id


class TestAddMessage:
    """Tests for adding messages."""

    def test_add_message_user(
        self, chat_service: ChatService, user_id
    ):
        """Test adding a user message."""
        conv = chat_service.create_conversation(user_id)

        message = chat_service.add_message(
            conv.id, user_id, MessageRole.USER, "Hello!"
        )

        assert message.id is not None
        assert message.conversation_id == conv.id
        assert message.role == MessageRole.USER
        assert message.content == "Hello!"
        assert message.tool_calls is None

    def test_add_message_assistant(
        self, chat_service: ChatService, user_id
    ):
        """Test adding an assistant message."""
        conv = chat_service.create_conversation(user_id)

        message = chat_service.add_message(
            conv.id, user_id, MessageRole.ASSISTANT, "Hi there!"
        )

        assert message.role == MessageRole.ASSISTANT
        assert message.content == "Hi there!"

    def test_add_message_assistant_with_tool_calls(
        self, chat_service: ChatService, user_id
    ):
        """Test adding assistant message with tool calls."""
        conv = chat_service.create_conversation(user_id)
        tool_calls = [
            {"tool": "add_task", "input": {"title": "Test"}, "output": {"success": True}}
        ]

        message = chat_service.add_message(
            conv.id, user_id, MessageRole.ASSISTANT, "Task added!",
            tool_calls=tool_calls
        )

        assert message.tool_calls == tool_calls

    def test_add_message_updates_conversation_updated_at(
        self, chat_service: ChatService, user_id, session
    ):
        """Test that adding message updates conversation's updated_at."""
        conv = chat_service.create_conversation(user_id)
        original_updated_at = conv.updated_at

        # Add message after a moment
        chat_service.add_message(
            conv.id, user_id, MessageRole.USER, "Hello"
        )

        # Refresh conversation
        session.refresh(conv)

        assert conv.updated_at >= original_updated_at

    def test_add_message_sets_timestamp(
        self, chat_service: ChatService, user_id
    ):
        """Test that message has created_at timestamp."""
        conv = chat_service.create_conversation(user_id)
        before = datetime.now(timezone.utc)

        message = chat_service.add_message(
            conv.id, user_id, MessageRole.USER, "Hello"
        )

        after = datetime.now(timezone.utc)
        assert message.created_at is not None


class TestGetMessages:
    """Tests for retrieving messages."""

    def test_get_messages_returns_messages(
        self, chat_service: ChatService, user_id
    ):
        """Test that get_messages returns list of messages."""
        conv = chat_service.create_conversation(user_id)
        chat_service.add_message(conv.id, user_id, MessageRole.USER, "Hi")
        chat_service.add_message(conv.id, user_id, MessageRole.ASSISTANT, "Hello!")

        messages, total, has_more = chat_service.get_messages(
            conv.id, user_id
        )

        assert len(messages) == 2
        assert total == 2
        assert has_more is False

    def test_get_messages_ordered_by_created_at(
        self, chat_service: ChatService, user_id
    ):
        """Test that messages are ordered by created_at ascending."""
        conv = chat_service.create_conversation(user_id)
        chat_service.add_message(conv.id, user_id, MessageRole.USER, "First")
        chat_service.add_message(conv.id, user_id, MessageRole.ASSISTANT, "Second")
        chat_service.add_message(conv.id, user_id, MessageRole.USER, "Third")

        messages, _, _ = chat_service.get_messages(conv.id, user_id)

        assert messages[0].content == "First"
        assert messages[1].content == "Second"
        assert messages[2].content == "Third"

    def test_get_messages_wrong_user_returns_empty(
        self, chat_service: ChatService, user_id
    ):
        """Test that wrong user_id returns empty list."""
        conv = chat_service.create_conversation(user_id)
        chat_service.add_message(conv.id, user_id, MessageRole.USER, "Hi")
        other_user = uuid4()

        messages, total, has_more = chat_service.get_messages(
            conv.id, other_user
        )

        assert messages == []
        assert total == 0
        assert has_more is False

    def test_get_messages_pagination(
        self, chat_service: ChatService, user_id
    ):
        """Test message pagination with limit and offset."""
        conv = chat_service.create_conversation(user_id)
        for i in range(10):
            chat_service.add_message(
                conv.id, user_id, MessageRole.USER, f"Message {i}"
            )

        messages, total, has_more = chat_service.get_messages(
            conv.id, user_id, limit=3, offset=0
        )

        assert len(messages) == 3
        assert total == 10
        assert has_more is True
        assert messages[0].content == "Message 0"

    def test_get_messages_limit_capped_at_100(
        self, chat_service: ChatService, user_id
    ):
        """Test that limit is capped at 100."""
        conv = chat_service.create_conversation(user_id)

        # Request with limit > 100
        messages, _, _ = chat_service.get_messages(
            conv.id, user_id, limit=150
        )

        # Should use 100 as max


class TestGetHistoryForAgent:
    """Tests for agent history loading."""

    def test_get_history_for_agent_returns_formatted_list(
        self, chat_service: ChatService, user_id
    ):
        """Test that history is formatted for agent context."""
        conv = chat_service.create_conversation(user_id)
        chat_service.add_message(conv.id, user_id, MessageRole.USER, "Hello")
        chat_service.add_message(
            conv.id, user_id, MessageRole.ASSISTANT, "Hi there!"
        )

        history = chat_service.get_history_for_agent(conv.id)

        assert len(history) == 2
        assert history[0] == {"role": "user", "content": "Hello"}
        assert history[1] == {"role": "assistant", "content": "Hi there!"}

    def test_get_history_for_agent_respects_limit(
        self, chat_service: ChatService, user_id
    ):
        """Test that history limit is respected."""
        conv = chat_service.create_conversation(user_id)
        for i in range(10):
            chat_service.add_message(
                conv.id, user_id, MessageRole.USER, f"Message {i}"
            )

        history = chat_service.get_history_for_agent(conv.id, limit=5)

        assert len(history) == 5

    def test_get_history_for_agent_empty_conversation(
        self, chat_service: ChatService, user_id
    ):
        """Test that empty conversation returns empty list."""
        conv = chat_service.create_conversation(user_id)

        history = chat_service.get_history_for_agent(conv.id)

        assert history == []


class TestGetConversationWithDetails:
    """Tests for conversation listing with details."""

    def test_get_conversation_with_details_includes_message_count(
        self, chat_service: ChatService, user_id
    ):
        """Test that message count is included."""
        conv = chat_service.create_conversation(user_id)
        chat_service.add_message(conv.id, user_id, MessageRole.USER, "Hi")
        chat_service.add_message(conv.id, user_id, MessageRole.ASSISTANT, "Hello!")

        details = chat_service.get_conversation_with_details(user_id)

        assert len(details) == 1
        assert details[0]["message_count"] == 2

    def test_get_conversation_with_details_includes_preview(
        self, chat_service: ChatService, user_id
    ):
        """Test that last message preview is included."""
        conv = chat_service.create_conversation(user_id)
        chat_service.add_message(conv.id, user_id, MessageRole.USER, "Hi")
        chat_service.add_message(
            conv.id, user_id, MessageRole.ASSISTANT, "Hello! How can I help?"
        )

        details = chat_service.get_conversation_with_details(user_id)

        assert "Hello! How can I help?" in details[0]["last_message_preview"]

    def test_get_conversation_with_details_empty_conversation(
        self, chat_service: ChatService, user_id
    ):
        """Test that empty conversation has zero message count."""
        chat_service.create_conversation(user_id)

        details = chat_service.get_conversation_with_details(user_id)

        assert details[0]["message_count"] == 0
        assert details[0]["last_message_preview"] == ""


class TestGetConversationCount:
    """Tests for conversation counting."""

    def test_get_conversation_count(
        self, chat_service: ChatService, user_id
    ):
        """Test that conversation count is correct."""
        chat_service.create_conversation(user_id)
        chat_service.create_conversation(user_id)
        chat_service.create_conversation(user_id)

        count = chat_service.get_conversation_count(user_id)

        assert count == 3

    def test_get_conversation_count_zero(
        self, chat_service: ChatService, user_id
    ):
        """Test that count is zero for new user."""
        count = chat_service.get_conversation_count(user_id)

        assert count == 0

    def test_get_conversation_count_user_isolation(
        self, chat_service: ChatService, user_id
    ):
        """Test that count only includes user's conversations."""
        other_user = uuid4()
        chat_service.create_conversation(user_id)
        chat_service.create_conversation(user_id)
        chat_service.create_conversation(other_user)

        count = chat_service.get_conversation_count(user_id)

        assert count == 2
