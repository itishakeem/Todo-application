"""
Configuration for the OpenAI Agent.
Manages API keys and agent settings.
"""
import os
from dataclasses import dataclass
from typing import Optional


class AgentConfigError(Exception):
    """Raised when agent configuration is invalid or missing."""
    pass


def _get_default_model() -> str:
    """Get default model from environment or use gpt-4o."""
    # T-CHATBOT-FIX: Allow configuring faster model via environment
    # Use OPENAI_MODEL env var if set, otherwise use gpt-4o
    return os.environ.get("OPENAI_MODEL", "gpt-4o")


@dataclass
class AgentConfig:
    """
    Configuration for the TodoAssistant agent.

    Attributes:
        model: The OpenAI model to use (default: gpt-4o, configurable via OPENAI_MODEL env)
        max_tokens: Maximum tokens for response (default: 1024)
        temperature: Sampling temperature (default: 0.3 for reliable tool calling)
        history_limit: Maximum messages to load for context (default: 50)
    """
    model: str = ""  # Will be set in __post_init__
    max_tokens: int = 1024
    temperature: float = 0.3  # Lower temperature for more reliable tool usage
    history_limit: int = 50

    def __post_init__(self):
        """Set default model if not provided."""
        if not self.model:
            self.model = _get_default_model()


def get_openai_api_key() -> str:
    """
    Get the OpenAI API key from environment variables.

    Returns:
        The OpenAI API key string.

    Raises:
        AgentConfigError: If OPENAI_API_KEY is not set.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise AgentConfigError(
            "OPENAI_API_KEY environment variable is not set. "
            "Please set it in your .env file or environment."
        )

    # Validate that the key looks like a proper OpenAI key
    if not api_key.startswith(("sk-", "sess-")):
        raise AgentConfigError(
            "OPENAI_API_KEY does not appear to be a valid OpenAI API key format. "
            "OpenAI keys typically start with 'sk-' or 'sess-'."
        )

    return api_key


def get_agent_config(
    model: Optional[str] = None,
    max_tokens: Optional[int] = None,
    temperature: Optional[float] = None,
    history_limit: Optional[int] = None,
) -> AgentConfig:
    """
    Create an AgentConfig with optional overrides.

    Args:
        model: Override default model
        max_tokens: Override default max_tokens
        temperature: Override default temperature
        history_limit: Override default history_limit

    Returns:
        AgentConfig instance with specified or default values.
    """
    config = AgentConfig()
    if model is not None:
        config.model = model
    if max_tokens is not None:
        config.max_tokens = max_tokens
    if temperature is not None:
        config.temperature = temperature
    if history_limit is not None:
        config.history_limit = history_limit
    return config
