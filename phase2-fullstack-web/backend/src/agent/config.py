"""
Configuration for the AI Agent.
Supports both OpenAI and Google Gemini (via OpenAI-compatible API).
"""
import os
from dataclasses import dataclass, field
from typing import Optional

from openai import AsyncOpenAI


class AgentConfigError(Exception):
    """Raised when agent configuration is invalid or missing."""
    pass


# Gemini OpenAI-compatible endpoint
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
GEMINI_DEFAULT_MODEL = "gemini-2.5-flash"


def _detect_provider() -> str:
    """Detect which AI provider to use based on available API keys."""
    provider = os.environ.get("AI_PROVIDER", "").lower()
    if provider:
        return provider

    # Auto-detect: prefer Gemini if key is set (OpenAI quota exhausted)
    if os.environ.get("GEMINI_API_KEY"):
        return "gemini"
    if os.environ.get("OPENAI_API_KEY"):
        return "openai"
    return "gemini"  # Default to gemini


def _get_default_model() -> str:
    """Get default model based on provider."""
    provider = _detect_provider()
    if provider == "gemini":
        return os.environ.get("GEMINI_MODEL", GEMINI_DEFAULT_MODEL)
    return os.environ.get("OPENAI_MODEL", "gpt-4o")


@dataclass
class AgentConfig:
    """
    Configuration for the TodoAssistant agent.
    Supports OpenAI and Gemini providers.
    """
    model: str = ""
    max_tokens: int = 1024
    temperature: float = 0.3
    history_limit: int = 50
    provider: str = ""

    def __post_init__(self):
        if not self.provider:
            self.provider = _detect_provider()
        if not self.model:
            self.model = _get_default_model()


def get_api_client() -> AsyncOpenAI:
    """
    Create an AsyncOpenAI client configured for the active provider.
    Gemini uses Google's OpenAI-compatible endpoint.
    """
    provider = _detect_provider()

    if provider == "gemini":
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise AgentConfigError(
                "GEMINI_API_KEY environment variable is not set."
            )
        return AsyncOpenAI(
            api_key=api_key,
            base_url=GEMINI_BASE_URL,
        )
    else:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise AgentConfigError(
                "OPENAI_API_KEY environment variable is not set."
            )
        return AsyncOpenAI(api_key=api_key)


def get_agent_config(
    model: Optional[str] = None,
    max_tokens: Optional[int] = None,
    temperature: Optional[float] = None,
    history_limit: Optional[int] = None,
) -> AgentConfig:
    """Create an AgentConfig with optional overrides."""
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
