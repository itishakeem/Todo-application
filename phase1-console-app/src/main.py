"""Main application entry point for Phase I console task app.

Orchestrates TaskStorage and ConsoleUI to provide interactive menu-driven
task management.
"""

import sys
import io

# Force UTF-8 encoding for Windows console
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from storage.task_storage import TaskStorage
from ui.console_ui import ConsoleUI


def main() -> None:
    """Run the main application loop."""
    storage = TaskStorage()
    ui = ConsoleUI()

    while True:
        try:
            ui.display_menu()
            choice = ui.get_menu_choice()

            if choice == 1:  # Add task
                title = ui.prompt_task_title()
                description = ui.prompt_task_description()
                task = storage.add(title, description)
                ui.display_success(f"Task added: '{task.title}' (ID: {task.id[:8]})")

            elif choice == 2:  # List tasks
                tasks = storage.get_all()
                ui.display_tasks(tasks)

            elif choice == 3:  # Mark complete
                task_id = ui.prompt_task_id()
                try:
                    completed = storage.mark_complete(task_id)
                    ui.display_success(
                        f"Marked complete: '{completed.text}' (ID: {completed.id[:8]})"
                    )
                except KeyError:
                    ui.display_error("Task ID not found")

            elif choice == 4:  # Update task
                task_id = ui.prompt_task_id()
                try:
                    new_text = ui.prompt_task_text()
                    updated = storage.update_text(task_id, new_text)
                    ui.display_success(
                        f"Updated: '{updated.text}' (ID: {updated.id[:8]})"
                    )
                except KeyError:
                    ui.display_error("Task ID not found")

            elif choice == 5:  # Delete task
                task_id = ui.prompt_task_id()
                if storage.delete(task_id):
                    ui.display_success(f"Deleted task (ID: {task_id[:8]})")
                else:
                    ui.display_error("Task ID not found")

            elif choice == 6:  # Exit
                ui.confirm_exit()
                break

        except KeyboardInterrupt:
            print("\n")  # New line after Ctrl+C
            ui.confirm_exit()
            break
        except ValueError as e:
            ui.display_error(str(e))
        except Exception as e:
            ui.display_error(f"Unexpected error: {e}")


if __name__ == "__main__":
    main()
