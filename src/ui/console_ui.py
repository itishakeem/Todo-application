"""ConsoleUI class for terminal-based user interface.

Handles all user interaction including menu display, input prompts,
and formatted output for tasks.
"""

from models.task import Task


class ConsoleUI:
    """Console-based user interface for task application.

    Provides methods for displaying menus, prompting for input,
    and formatting output with visual indicators.
    """

    def display_success(self, message: str) -> None:
        """Display success message with checkmark indicator.

        Args:
            message: Success message to display

        Example:
            >>> ui = ConsoleUI()
            >>> ui.display_success("Task added")
            ✅ Task added
        """
        print(f"✅ {message}")

    def display_error(self, message: str) -> None:
        """Display error message with X mark indicator.

        Args:
            message: Error message to display

        Example:
            >>> ui = ConsoleUI()
            >>> ui.display_error("Invalid input")
            ❌ Invalid input
        """
        print(f"❌ {message}")

    def display_menu(self) -> None:
        """Display main menu with numbered options 1-6.

        Shows all available operations:
        1. Add task
        2. List tasks
        3. Mark complete
        4. Update task
        5. Delete task
        6. Exit
        """
        print("\n" + "=" * 50)
        print("TASK APPLICATION")
        print("=" * 50)
        print("1. Add task")
        print("2. List tasks")
        print("3. Mark complete")
        print("4. Update task")
        print("5. Delete task")
        print("6. Exit")
        print("=" * 50)

    def get_menu_choice(self) -> int:
        """Prompt for menu selection and validate input.

        Returns:
            Valid menu choice (1-6)

        Note:
            Loops until valid input received. Displays error for
            invalid choices and re-prompts user.

        Example:
            >>> ui = ConsoleUI()
            >>> choice = ui.get_menu_choice()
            Select option (1-6): 2
            >>> choice
            2
        """
        while True:
            try:
                choice = int(input("\nSelect option (1-6): "))
                if 1 <= choice <= 6:
                    return choice
                self.display_error("Invalid choice. Please select 1-6")
            except ValueError:
                self.display_error("Invalid input. Please enter a number 1-6")

    def prompt_task_title(self) -> str:
        """Prompt for task title with validation.

        Returns:
            Valid task title (1-100 characters, stripped)

        Note:
            Loops until valid input received. Validates:
            - Not empty after stripping whitespace
            - Length ≤ 100 characters

        Example:
            >>> ui = ConsoleUI()
            >>> title = ui.prompt_task_title()
            Enter task title: Buy groceries
            >>> title
            'Buy groceries'
        """
        while True:
            title = input("Enter task title: ").strip()

            if not title:
                self.display_error("Task title required")
                continue

            if len(title) > 100:
                self.display_error("Task title too long (max 100 characters)")
                continue

            return title

    def prompt_task_description(self) -> str:
        """Prompt for task description with validation.

        Returns:
            Valid task description (0-500 characters, stripped)

        Note:
            Loops until valid input received. Validates:
            - Length ≤ 500 characters
            - Can be empty

        Example:
            >>> ui = ConsoleUI()
            >>> description = ui.prompt_task_description()
            Enter task description (optional): Milk, eggs, bread
            >>> description
            'Milk, eggs, bread'
        """
        while True:
            description = input("Enter task description (optional): ").strip()

            if len(description) > 500:
                self.display_error("Task description too long (max 500 characters)")
                continue

            return description

    def prompt_task_text(self) -> str:
        """Prompt for task text with validation (backward compatibility).

        Returns:
            Valid task text (1-200 characters, stripped)

        Note:
            Loops until valid input received. Validates:
            - Not empty after stripping whitespace
            - Length ≤ 200 characters

        Example:
            >>> ui = ConsoleUI()
            >>> text = ui.prompt_task_text()
            Enter task text: Buy groceries
            >>> text
            'Buy groceries'
        """
        while True:
            text = input("Enter task text: ").strip()

            if not text:
                self.display_error("Task text required")
                continue

            if len(text) > 200:
                self.display_error("Task text too long (max 200 characters)")
                continue

            return text

    def prompt_task_id(self) -> str:
        """Prompt for task ID with validation.

        Returns:
            Valid task ID (minimum 8 characters, stripped)

        Note:
            Loops until valid input received. Accepts full UUID
            or first 8+ characters for convenience.

        Example:
            >>> ui = ConsoleUI()
            >>> task_id = ui.prompt_task_id()
            Enter task ID (first 8+ chars): abc12345
            >>> task_id
            'abc12345'
        """
        while True:
            task_id = input("Enter task ID (first 8+ chars): ").strip()

            if len(task_id) < 8:
                self.display_error("Invalid ID (minimum 8 characters)")
                continue

            return task_id

    def display_tasks(self, tasks: list[Task]) -> None:
        """Display list of tasks with formatting.

        Args:
            tasks: List of tasks to display (may be empty)

        Note:
            Shows "No tasks yet" if list is empty.
            Otherwise displays table with:
            - ID (first 8 characters)
            - Status indicator ([✓] or [ ])
            - Text
            - Created date
            - Completed date (if applicable)

        Example:
            >>> ui = ConsoleUI()
            >>> ui.display_tasks([task1, task2])
            ID       | Status | Text           | Created    | Completed
            ---------|--------|----------------|------------|----------
            abc12345 | [ ]    | Buy groceries  | 2025-12-31 | -
            def67890 | [✓]    | Clean room     | 2025-12-30 | 2025-12-31
        """
        if not tasks:
            print("\nNo tasks yet. Add one to get started!")
            return

        print("\n" + "=" * 120)
        print("YOUR TASKS")
        print("=" * 120)
        print(
            f"{'ID':<10} | {'Status':<6} | {'Title':<25} | {'Description':<35} | {'Created':<12}"
        )
        print("-" * 120)

        for task in tasks:
            task_id = task.id[:8]
            status = "[✓]" if task.status == "completed" else "[ ]"
            title = task.title if len(task.title) <= 25 else task.title[:22] + "..."
            description = task.description if len(task.description) <= 35 else task.description[:32] + "..."
            if not description:
                description = "-"
            created = task.created_at.strftime("%Y-%m-%d")

            print(f"{task_id:<10} | {status:<6} | {title:<25} | {description:<35} | {created:<12}")

        print("=" * 120)
        print(f"Total: {len(tasks)} task(s)")

    def confirm_exit(self) -> None:
        """Display exit confirmation with data loss warning.

        Shows warning that all tasks will be lost (in-memory only)
        and displays goodbye message.

        Example:
            >>> ui = ConsoleUI()
            >>> ui.confirm_exit()
            ⚠️  All tasks will be lost (in-memory storage only)
            Goodbye! Have a productive day!
        """
        print("\n⚠️  All tasks will be lost (in-memory storage only)")
        print("Goodbye! Have a productive day!\n")
