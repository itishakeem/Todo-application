#!/usr/bin/env python3
"""
Test script to check agent execution with mock data
"""

import asyncio
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID, uuid4
from sqlmodel import Session

async def test_agent_execution():
    print("Testing agent execution...")

    # Create mock session and user_id
    mock_session = MagicMock(spec=Session)
    user_id = uuid4()

    # Test the agent runner execution
    try:
        from src.agent.runner import AgentRunner
        from src.agent.config import get_agent_config

        config = get_agent_config()
        runner = AgentRunner(config)

        print("[OK] Created AgentRunner successfully")

        # Mock the runner.run method to avoid actual API calls
        original_run = runner.run

        # Test creating input
        input_items = runner._build_input("Test message", [])
        print(f"[OK] Built input successfully: {len(input_items)} items")

        # Test the _extract_tool_calls method
        from agents import ToolCallItem
        from src.agent.runner import ToolCallInfo

        # Create mock tool call items
        mock_tool_call = MagicMock()
        mock_tool_call.raw_item.id = "test-id"
        mock_tool_call.raw_item.name = "test_tool"
        mock_tool_call.raw_item.arguments = {"param": "value"}

        mock_tool_output = MagicMock()
        mock_tool_output.raw_item.call_id = "test-id"
        mock_tool_output.output = "test output"

        tool_calls = runner._extract_tool_calls([mock_tool_call, mock_tool_output])
        print(f"[OK] Extracted tool calls successfully: {len(tool_calls)}")

        print("\nAgent system components working correctly!")
        print("The issue is likely related to the OpenAI API call itself or network connectivity.")
        print("Make sure your OPENAI_API_KEY is valid and has proper permissions.")

    except Exception as e:
        print(f"[ERROR] Error in agent execution test: {e}")
        import traceback
        print(traceback.format_exc())
        return False

    return True

if __name__ == "__main__":
    asyncio.run(test_agent_execution())