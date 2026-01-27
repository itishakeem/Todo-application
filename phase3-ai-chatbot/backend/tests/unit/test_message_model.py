"""
Unit tests for Message model.
TASK-007: Write test for Message model
TC-007: Unit tests pass
"""
import pytest
from datetime import datetime
from uuid import UUID
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from src.models.message import Message, MessageRole
from src.models.conversation import Conversation


@pytest.fixture(name="session")
def session_fixture():
    """Create a fresh database session for each test."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="conversation")
def conversation_fixture(session: Session):
    """Create a conversation for message tests."""
    user_id = UUID("12345678-1234-1234-1234-123456789012")
    conversation = Conversation(user_id=user_id)
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


class TestMessageRole:
    """Test suite for MessageRole enum."""

    def test_user_role_value(self):
        """Test USER role has correct value."""
        assert MessageRole.USER.value == "user"

    def test_assistant_role_value(self):
        """Test ASSISTANT role has correct value."""
        assert MessageRole.ASSISTANT.value == "assistant"

    def test_role_is_string_enum(self):
        """Test MessageRole is a string enum."""
        assert isinstance(MessageRole.USER, str)
        assert isinstance(MessageRole.ASSISTANT, str)


class TestMessageModel:
    """Test suite for Message SQLModel."""

    def test_create_user_message(self, session: Session, conversation: Conversation):
        """Test creating a message with USER role."""
        user_id = UUID("12345678-1234-1234-1234-123456789012")

        message = Message(
            conversation_id=conversation.id,
            user_id=user_id,
            role=MessageRole.USER,
            content="Hello, can you help me add a task?",
        )
        session.add(message)
        session.commit()
        session.refresh(message)

        assert message.id is not None
        assert message.conversation_id == conversation.id
        assert message.user_id == user_id
        assert message.role == MessageRole.USER
        assert message.content == "Hello, can you help me add a task?"
        assert message.tool_calls is None
        assert message.created_at is not None

    def test_create_assistant_message(self, session: Session, conversation: Conversation):
        """Test creating a message with ASSISTANT role."""
        user_id = UUID("12345678-1234-1234-1234-123456789012")

        message = Message(
            conversation_id=conversation.id,
            user_id=user_id,
            role=MessageRole.ASSISTANT,
            content="I've added the task 'Buy groceries' to your list.",
        )
        session.add(message)
        session.commit()
        session.refresh(message)

        assert message.role == MessageRole.ASSISTANT
        assert message.content == "I've added the task 'Buy groceries' to your list."

    def test_message_with_tool_calls(self, session: Session, conversation: Conversation):
        """Test storing tool_calls JSONB data."""
        user_id = UUID("12345678-1234-1234-1234-123456789012")

        tool_calls_data = {
            "tool_name": "add_task",
            "arguments": {"title": "Buy groceries", "description": "Milk and bread"},
            "result": {"task_id": "abc123", "status": "created"},
        }

        message = Message(
            conversation_id=conversation.id,
            user_id=user_id,
            role=MessageRole.ASSISTANT,
            content="Task created successfully!",
            tool_calls=tool_calls_data,
        )
        session.add(message)
        session.commit()
        session.refresh(message)

        assert message.tool_calls is not None
        assert message.tool_calls["tool_name"] == "add_task"
        assert message.tool_calls["arguments"]["title"] == "Buy groceries"

    def test_message_auto_timestamp(self, session: Session, conversation: Conversation):
        """Test created_at is automatically set."""
        user_id = UUID("12345678-1234-1234-1234-123456789012")

        before_creation = datetime.utcnow()
        message = Message(
            conversation_id=conversation.id,
            user_id=user_id,
            role=MessageRole.USER,
            content="Test message",
        )
        session.add(message)
        session.commit()
        session.refresh(message)
        after_creation = datetime.utcnow()

        assert before_creation <= message.created_at <= after_creation

    def test_multiple_messages_in_conversation(
        self, session: Session, conversation: Conversation
    ):
        """Test multiple messages can belong to one conversation."""
        user_id = UUID("12345678-1234-1234-1234-123456789012")

        # Create user message
        user_message = Message(
            conversation_id=conversation.id,
            user_id=user_id,
            role=MessageRole.USER,
            content="Add task: Buy groceries",
        )
        # Create assistant response
        assistant_message = Message(
            conversation_id=conversation.id,
            user_id=user_id,
            role=MessageRole.ASSISTANT,
            content="Done! I've added 'Buy groceries' to your list.",
        )

        session.add(user_message)
        session.add(assistant_message)
        session.commit()

        # Query all messages for conversation
        messages = (
            session.query(Message)
            .filter(Message.conversation_id == conversation.id)
            .all()
        )

        assert len(messages) == 2

    def test_message_content_required(self, session: Session, conversation: Conversation):
        """Test that content is a required field."""
        user_id = UUID("12345678-1234-1234-1234-123456789012")

        # This should fail validation since content is required
        with pytest.raises(Exception):
            message = Message(
                conversation_id=conversation.id,
                user_id=user_id,
                role=MessageRole.USER,
                # content is missing
            )
            session.add(message)
            session.commit()

    def test_message_tablename(self):
        """Test that the table name is set correctly."""
        assert Message.__tablename__ == "messages"

    def test_message_id_auto_generated(
        self, session: Session, conversation: Conversation
    ):
        """Test that id is auto-generated as primary key."""
        user_id = UUID("12345678-1234-1234-1234-123456789012")

        message = Message(
            conversation_id=conversation.id,
            user_id=user_id,
            role=MessageRole.USER,
            content="Test message",
        )
        assert message.id is None  # Before commit

        session.add(message)
        session.commit()
        session.refresh(message)

        assert message.id is not None
        assert isinstance(message.id, int)
