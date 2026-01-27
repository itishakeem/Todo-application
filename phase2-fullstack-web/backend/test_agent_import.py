#!/usr/bin/env python3
"""
Simple test script to check agent imports and initialization
"""

def test_agent_imports():
    print("Testing agent imports...")

    try:
        from agents import Agent, function_tool, RunContextWrapper, ModelSettings
        print("[OK] Successfully imported Agent, function_tool, RunContextWrapper, ModelSettings")
    except ImportError as e:
        print(f"[ERROR] Import error for main agent components: {e}")
        return False

    try:
        from agents import Runner, ToolCallItem, ToolCallOutputItem
        print("[OK] Successfully imported Runner, ToolCallItem, ToolCallOutputItem")
    except ImportError as e:
        print(f"[ERROR] Import error for runner components: {e}")
        return False

    try:
        from src.agent.config import get_agent_config
        print("[OK] Successfully imported agent config")
    except ImportError as e:
        print(f"[ERROR] Import error for agent config: {e}")
        return False

    try:
        from src.agent.todo_agent import create_todo_agent
        print("[OK] Successfully imported todo agent creator")
    except ImportError as e:
        print(f"[ERROR] Import error for todo agent: {e}")
        return False

    try:
        from src.agent.runner import AgentRunner
        print("[OK] Successfully imported agent runner")
    except ImportError as e:
        print(f"[ERROR] Import error for agent runner: {e}")
        return False

    try:
        config = get_agent_config()
        print(f"[OK] Successfully got agent config: {config}")
    except Exception as e:
        print(f"[ERROR] Error getting agent config: {e}")
        return False

    try:
        agent = create_todo_agent(config)
        print(f"[OK] Successfully created agent: {agent.name}")
    except Exception as e:
        print(f"[ERROR] Error creating agent: {e}")
        import traceback
        print(traceback.format_exc())
        return False

    try:
        runner = AgentRunner(config)
        print(f"[OK] Successfully created agent runner")

        # Test runner.agent property
        agent_instance = runner.agent
        print(f"[OK] Successfully accessed agent from runner: {agent_instance.name}")
    except Exception as e:
        print(f"[ERROR] Error with agent runner: {e}")
        import traceback
        print(traceback.format_exc())
        return False

    print("\nAll tests passed! Agent system appears to be working correctly.")
    return True

if __name__ == "__main__":
    test_agent_imports()