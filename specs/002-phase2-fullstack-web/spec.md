# Feature Specification: Phase II Full-Stack Web Todo Application

**Feature Branch**: `002-phase2-fullstack-web`
**Created**: 2026-01-01
**Status**: Hardened (Revision 2)
**Input**: User description: "Phase 2: Full-Stack Web UI for Todo Application - responsive user interface preserving all Phase 1 features (add, list, update, mark complete, delete tasks) with no new features beyond Phase 1 functionality"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Todo Dashboard (Priority: P1)

As a user, I want to see all my todos in a clean web interface so that I can manage my tasks from any browser without using the command line.

**Why this priority**: This is the foundation of Phase 2. Without a working web UI that displays tasks, none of the other interactions can exist. This delivers immediate value by making the app accessible through browsers.

**Independent Test**: Can be fully tested by opening the web application in a browser, verifying the dashboard loads in under 2 seconds, and seeing any existing todos displayed in a responsive layout. Delivers value by providing visual task management.

**Acceptance Scenarios**:

1. **Given** the web app is running, **When** I navigate to the home page, **Then** I see a dashboard with a header at top, task list area in center, and add task form above the task list
2. **Given** I have 5 todos in the system, **When** I load the dashboard, **Then** I see all 5 tasks displayed with title, description (or "-" if empty), status icon, creation date (YYYY-MM-DD format), and 8-character task ID
3. **Given** I have no todos, **When** I load the dashboard, **Then** I see centered empty state message "No tasks yet. Add one to get started!" with icon, displayed where the task list would normally appear
4. **Given** I view the dashboard on mobile (375px width), **When** the page loads, **Then** all elements are sized minimum 16px font, buttons are 44x44px minimum, and no horizontal scrolling appears
5. **Given** I view the dashboard on tablet (768px width), **When** I load the page, **Then** the task list displays in 1 column with task cards at 100% width minus 32px padding (16px each side)
6. **Given** I view the dashboard on desktop (1920px width), **When** the page loads, **Then** the content is centered with 800px max-width and 24px left/right margins
7. **Given** the page is loading tasks from API, **When** the initial request is in progress, **Then** I see a centered spinner in the task list area with text "Loading tasks..." below it
8. **Given** the API request fails, **When** the error occurs, **Then** I see error message "Unable to load tasks. Please check your connection." with a "Retry" button (44x44px minimum) centered where task list would appear

---

### User Story 2 - Add Task via Web Form (Priority: P1)

As a user, I want to add new tasks through a web form so that I can quickly capture todos without typing commands.

**Why this priority**: Task creation is equally critical as viewing. Together with P1, these form the minimal viable product for web-based task management.

**Independent Test**: Can be tested by entering text in the title field, optionally entering description, clicking "Add Task" button, and verifying the new task appears at the top of the list within 500ms with a success notification. Delivers value through intuitive task creation.

**Acceptance Scenarios**:

1. **Given** I am on the dashboard, **When** I enter "Buy groceries" in the title field and click "Add Task" button, **Then** the task appears at the top of the list within 500ms and a green success toast notification "Task added successfully" appears for 3 seconds at top-right of screen
2. **Given** I am adding a task, **When** I enter title "Complete homework" and description "Math assignment pages 10-15" then click "Add Task", **Then** both fields are saved and the task card displays the full title and description text
3. **Given** I try to add a task with empty title, **When** I click "Add Task", **Then** I see red inline error text "Title is required" displayed directly below the title input field and the form does not submit
4. **Given** I enter a title with 101 characters, **When** I attempt to submit, **Then** I see red inline error text "Title must be 100 characters or less" below title field and submit button remains disabled until character count is ≤ 100
5. **Given** I successfully add a task, **When** the API returns success (200 status), **Then** both title and description fields clear to empty strings immediately (within 100ms) for next task entry
6. **Given** I am on mobile (375px width), **When** I tap the title input field, **Then** the mobile keyboard appears, the input field remains visible above the keyboard, and the "Add Task" button remains accessible without scrolling
7. **Given** I am adding a task, **When** I press Enter key while focused in the title field, **Then** the form submits as if I clicked "Add Task" button (same validation and behavior)
8. **Given** I am adding a task, **When** I press Enter key while focused in the description textarea, **Then** a newline is inserted (form does NOT submit - description allows multi-line text)
9. **Given** I click "Add Task" while a previous add request is still in progress, **When** the button is clicked, **Then** the button is disabled (opacity 0.5, cursor not-allowed) and shows spinner until API responds
10. **Given** the add task API fails (500 error or timeout > 5 seconds), **When** the error occurs, **Then** I see red error toast notification "Failed to add task. Please try again." at top-right for 5 seconds, and the form data remains populated (not cleared)

---

### User Story 3 - Mark Task Complete via Click (Priority: P2)

As a user, I want to mark tasks as complete with a single click so that I can quickly track my progress visually.

**Why this priority**: Completion tracking provides progress visibility and depends on viewing tasks (P1). This is core functionality but requires existing tasks to be useful.

**Independent Test**: Can be tested by clicking the checkbox on the left side of a pending task card, verifying the task title shows strikethrough and green checkmark icon appears within 300ms, and confirming the status updates to "completed". Delivers value through visual progress tracking.

**Acceptance Scenarios**:

1. **Given** I have a pending task "Buy groceries", **When** I click the round checkbox (24x24px) on the left side of the task card, **Then** within 300ms the task title text shows strikethrough styling, a green checkmark icon (✓) appears inside the checkbox, and completion timestamp displays as "Completed: YYYY-MM-DD HH:MM" below the description
2. **Given** a task is marked complete, **When** I refresh the browser page (F5 or reload), **Then** the task remains visually complete (strikethrough, green checkmark) with the same completion timestamp displayed
3. **Given** I click the checkbox on a completed task (with checkmark visible), **When** the checkbox is clicked, **Then** within 300ms the task reverts to pending status (strikethrough removed, checkbox becomes empty circle, completion timestamp disappears, completed_at field set to null in database)
4. **Given** I complete a task, **When** the status change API returns success, **Then** I see green success toast "Task completed!" at top-right for 3 seconds
5. **Given** I am on mobile (375px width), **When** I tap the completion checkbox, **Then** the checkbox is exactly 44x44px (meeting WCAG touch target minimum) with 8px spacing from adjacent task text
6. **Given** I rapidly click the checkbox 3 times within 1 second, **When** the clicks occur, **Then** only the final checkbox state (after debounce delay of 300ms) triggers an API call, preventing race conditions
7. **Given** the complete/uncomplete API fails, **When** the error occurs, **Then** the checkbox reverts to its previous state (before the click) and red error toast "Failed to update task status" appears for 5 seconds

---

### User Story 4 - Update Task Inline (Priority: P3)

As a user, I want to edit task details directly in the list so that I can correct mistakes or update information without navigating away.

**Why this priority**: Editing improves usability but is not essential for basic task tracking. Users can work around this by deleting and re-adding if needed. Requires P1 (viewing) and P2 (completion) to be in place.

**Independent Test**: Can be tested by clicking the "Edit" icon button (pencil icon, 44x44px) on the right side of a task card, modifying the title or description in the inline form that appears, clicking "Save" button, and verifying the changes persist with updated timestamp. Delivers value through convenient task refinement.

**Acceptance Scenarios**:

1. **Given** I have a task "Buy milk", **When** I click the pencil icon edit button (44x44px) on the right side of the task card, **Then** the task card transforms into edit mode with title and description shown in editable input fields, and action buttons change to "Save" (green, 44x44px) and "Cancel" (gray, 44x44px)
2. **Given** I am in edit mode for a task, **When** I change title to "Buy milk and eggs", click "Save", and API returns success, **Then** the task card exits edit mode within 300ms, displays the updated text, shows green success toast "Task updated successfully" for 3 seconds, and updated timestamp shows "Updated: YYYY-MM-DD HH:MM"
3. **Given** I am editing a task, **When** I click the "Cancel" button, **Then** the original title and description text are restored exactly as before edit mode, the card exits edit mode within 100ms, and no API call is made
4. **Given** I am editing a task, **When** I press Escape key, **Then** edit mode is cancelled with same behavior as clicking "Cancel" button (text restored, no API call)
5. **Given** I try to save a task with empty title during edit, **When** I click "Save", **Then** I see red inline error text "Title is required" below the title input field, the edit form remains open (does not exit edit mode), and no API call is made
6. **Given** I am editing a task, **When** I try to edit a different task (click edit on another card), **Then** the first task automatically exits edit mode (changes discarded, no save), and the second task enters edit mode
7. **Given** I update a task title and description, **When** the save completes successfully, **Then** the updated_at timestamp refreshes to current UTC time displayed as "Updated: YYYY-MM-DD HH:MM" in the task card
8. **Given** I am editing a task on mobile (375px width), **When** the mobile keyboard appears, **Then** the edit form with Save/Cancel buttons remains visible (viewport scrolls if needed to show buttons), and both buttons remain 44x44px minimum touch targets
9. **Given** the update API fails, **When** the error occurs, **Then** the task card remains in edit mode, red error toast "Failed to update task" appears for 5 seconds, and I can retry saving or cancel

---

### User Story 5 - Delete Task with Confirmation (Priority: P3)

As a user, I want to remove tasks I no longer need so that my list stays focused on current work, with confirmation to prevent accidents.

**Why this priority**: Deletion is useful for list maintenance but least critical since users can ignore irrelevant tasks. Completes the CRUD functionality set. Requires P1 (viewing) to verify deletion.

**Independent Test**: Can be tested by clicking the "Delete" icon button (trash icon, 44x44px, red color) on the right side of a task card, clicking "Confirm" in the modal dialog that appears, and verifying the task disappears from the list within 300ms. Delivers value through safe list cleanup.

**Acceptance Scenarios**:

1. **Given** I have a task "Old project notes", **When** I click the red trash icon delete button (44x44px) on the right side of the task card, **Then** a centered modal dialog (400px width on desktop, 90% width on mobile) appears with title "Delete Task?", message "Are you sure you want to delete this task? This action cannot be undone.", and two buttons: "Cancel" (gray, 44x44px) and "Confirm" (red, 44x44px)
2. **Given** the delete confirmation modal is open, **When** I click "Confirm" button, **Then** the modal closes immediately (within 100ms), the task card fades out and disappears within 300ms using slide-up animation, green success toast "Task deleted successfully" appears for 3 seconds, and remaining tasks maintain their positions without layout jumps
3. **Given** the delete confirmation modal is open, **When** I click "Cancel" button, **Then** the modal closes within 100ms, the task remains in the list unchanged, and no API call is made
4. **Given** the delete confirmation modal is open, **When** I press Escape key, **Then** the modal closes with same behavior as clicking "Cancel" (no deletion, no API call)
5. **Given** the delete confirmation modal is open, **When** I click outside the modal on the darkened background overlay, **Then** the modal closes with same behavior as clicking "Cancel" (no deletion)
6. **Given** I am on mobile (320px width), **When** the delete confirmation modal appears, **Then** the modal is 90% viewport width with 16px margins, text is minimum 16px font size, and both "Cancel" and "Confirm" buttons are 44x44px minimum with 16px spacing between them
7. **Given** the delete API fails, **When** the error occurs, **Then** the task remains in the list, the modal closes, and red error toast "Failed to delete task. Please try again." appears for 5 seconds

---

### User Story 6 - Filter Tasks by Status (Priority: P4)

As a user, I want to view all tasks, only pending tasks, or only completed tasks so that I can focus on what needs attention.

**Why this priority**: Filtering enhances usability for users with many tasks but is not essential for basic functionality. All viewing needs can be met by showing all tasks (P1).

**Independent Test**: Can be tested by clicking the "Active" tab button, verifying only pending tasks display in the list, clicking the "Completed" tab, verifying only completed tasks display, and confirming the task count badge updates. Delivers value through focused task views.

**Acceptance Scenarios**:

1. **Given** I have 3 pending and 2 completed tasks, **When** I click the "Active" tab button (located above task list, 44x44px height), **Then** only the 3 pending tasks appear in the list, completed tasks are hidden, and the task count shows "3 tasks"
2. **Given** I have tasks filtered to "Completed", **When** I click "All" tab button, **Then** all 5 tasks (pending and completed) appear in the list sorted by creation date (newest first), and the task count shows "5 tasks"
3. **Given** I filter to "Active" (showing only pending tasks), **When** I add a new task using the form, **Then** the new task appears immediately at the top of the filtered list (since new tasks are pending by default)
4. **Given** I am viewing "Active" filter with 3 pending tasks displayed, **When** I complete one of the visible tasks (click checkbox), **Then** that task disappears from the view within 300ms (since it no longer matches "Active" filter) and the count updates to "2 tasks"
5. **Given** I am on mobile (375px width), **When** I switch between filter tabs, **Then** the tab transition completes within 200ms with cross-fade animation, and the active tab shows blue underline (4px height) while inactive tabs have no underline
6. **Given** I have selected a filter (e.g., "Completed"), **When** I refresh the browser page, **Then** the filter resets to "All" (filter state does NOT persist across page reloads in Phase 2)
7. **Given** I am on the "All" filter, **When** the page loads, **Then** the "All" tab button shows blue underline (4px height) and blue text color (#0066CC) indicating it is the active filter

---

### User Story 7 - Responsive Task Card Layout (Priority: P2)

As a user, I want task cards to display appropriately on different screen sizes so that I can read and interact with tasks comfortably on any device.

**Why this priority**: Responsive layout is core to Phase 2's value proposition of web accessibility. Without proper responsive behavior, mobile users cannot effectively use the application.

**Independent Test**: Can be tested by viewing the same task on mobile (375px), tablet (768px), and desktop (1440px) screens and verifying layout, spacing, and interactive elements meet specified requirements at each breakpoint.

**Acceptance Scenarios**:

1. **Given** I view a task card on mobile (320-767px width), **When** the card renders, **Then** the layout is: checkbox (44x44px) at top-left, title and description stacked below checkbox with 8px spacing, action buttons (Edit 44x44px, Delete 44x44px) stacked vertically on right side with 8px between them, card padding 12px all sides, task ID displayed at bottom-left in 12px gray text
2. **Given** I view a task card on tablet (768-1023px width), **When** the card renders, **Then** the layout is: checkbox (44x44px) at left, title and description in center taking 60% width, action buttons (Edit 44x44px, Delete 44x44px) arranged horizontally on right with 8px between them, card padding 16px all sides, timestamps displayed below description in 14px gray text
3. **Given** I view a task card on desktop (1024px+ width), **When** the card renders, **Then** the layout is: checkbox (44x44px) at left, title (18px bold font) and description (16px font) in center taking 70% width, action buttons (Edit 44x44px, Delete 44x44px) arranged horizontally on right with 12px spacing, card padding 20px all sides, task ID and timestamps displayed in single row below description
4. **Given** I view the dashboard on mobile in landscape orientation (667px width × 375px height), **When** the page renders, **Then** the layout uses the mobile breakpoint rules (320-767px) with single-column task cards and stacked action buttons
5. **Given** I view a task with a title longer than the card width, **When** the title renders, **Then** the text wraps to multiple lines (no truncation) with line-height 1.5 and word-break at word boundaries, and the full title is visible without ellipsis
6. **Given** I view a task with a description longer than 200 characters, **When** the description renders, **Then** the first 200 characters display with "..." appended, and clicking anywhere on the task card (except checkbox, Edit, Delete buttons) expands the card to show the full description
7. **Given** I click on a task card body to expand the description, **When** the card expands, **Then** the expansion animation takes 200ms with ease-in-out easing, the full description displays, and clicking the card body again collapses it back to 200 character preview

---

### User Story 8 - Authentication Error Handling (Priority: P2)

As a user, I want to see clear, inline error messages when I enter wrong credentials so that I understand what went wrong and can correct my input without confusion.

**Why this priority**: Authentication is the gateway to the application. Clear error feedback when login fails is essential for user experience and prevents user frustration. This is core usability that directly impacts first impressions.

**Independent Test**: Can be tested by entering invalid email/password combinations on the login page and verifying that error messages appear inline (not as browser alerts) within 300ms with clear guidance on what went wrong.

**Acceptance Scenarios**:

1. **Given** I am on the login page, **When** I enter an unregistered email "nonexistent@test.com" and any password, then click "Sign In", **Then** I see a red inline error message "Invalid email or password" displayed below the form inputs within 300ms, the form inputs retain their values, and the submit button re-enables
2. **Given** I am on the login page, **When** I enter a registered email but wrong password, then click "Sign In", **Then** I see a red inline error message "Invalid email or password" displayed below the form inputs within 300ms (same generic message for security - does not reveal which field is wrong)
3. **Given** the login page shows an error message, **When** I start typing in either email or password field, **Then** the error message clears immediately (within 100ms) to allow retry without visual clutter
4. **Given** I am on the login page, **When** I submit with empty email field, **Then** I see inline validation error "Email is required" below the email input, and the form does not submit to the server
5. **Given** I am on the login page, **When** I submit with empty password field, **Then** I see inline validation error "Password is required" below the password input, and the form does not submit to the server
6. **Given** I am on the login page, **When** I enter an invalid email format (e.g., "notanemail"), **Then** I see inline validation error "Please enter a valid email address" below the email input on blur or submit
7. **Given** the login API request fails due to network error, **When** the error occurs, **Then** I see inline error message "Unable to connect. Please check your internet connection and try again." below the form
8. **Given** I am on the login page on mobile (375px width), **When** an error is displayed, **Then** the error text is minimum 14px font size, red color (#EF4444), centered below the form with 8px top margin, and the form inputs remain visible above the keyboard

---

### Edge Cases

- **What happens when the user submits the add task form while a previous add request is still in progress?** The "Add Task" button becomes disabled (opacity 0.5, cursor: not-allowed, aria-disabled="true") and shows a spinner icon until the API responds (success or error), preventing duplicate submissions
- **How does the system handle tasks with very long titles (200+ characters)?** Title text wraps to multiple lines with word-break at word boundaries, line-height 1.5, no character limit on display (full title always visible)
- **What happens when the network request fails due to API timeout (> 5 seconds)?** System shows red error toast notification at top-right: "Request timed out. Please check your connection." with a "Retry" button (44x44px) that repeats the failed request when clicked. Toast persists until manually dismissed (X button) or retry is clicked.
- **How does the UI handle 100+ tasks in the list?** System uses pagination: displays 50 tasks per page, shows pagination controls at bottom (Previous/Next buttons 44x44px each, page numbers 1, 2, 3... with current page highlighted in blue), loads next page when Next is clicked without full page refresh (client-side pagination initially, can optimize to server-side in future)
- **What happens when a user rapidly clicks the complete checkbox 5 times within 2 seconds?** System debounces checkbox clicks with 300ms delay - only the final state after 300ms of no clicks triggers an API call. Visual checkbox state updates immediately on each click (optimistic UI) but reverts if API fails.
- **How does the app respond on very small screens (320px width)?** Layout uses full viewport width minus 16px margins (8px each side), font sizes minimum 16px for body text, all interactive elements minimum 44x44px, buttons stack vertically with 8px spacing, no horizontal scrolling at any point
- **What happens when JavaScript is disabled in the browser?** System displays a centered warning message: "JavaScript is required to use this application. Please enable JavaScript in your browser settings." styled with yellow background, black text, 20px font, 40px padding. No other content renders.
- **How does the system handle tasks created at the exact same millisecond timestamp?** Tasks with identical created_at timestamps are sorted by UUID in ascending alphabetical order as a stable secondary sort key (deterministic ordering)
- **What happens when viewing tasks in different browser tabs?** Each browser tab operates independently with its own local state. Changes made in one tab (add/edit/delete/complete) are NOT reflected in other open tabs until those tabs are manually refreshed (no WebSocket or polling in Phase 2). Each tab makes independent API calls.
- **How does the UI respond to browser back/forward navigation buttons?** Application uses client-side routing (Next.js App Router). Clicking back button returns to previous route (if any, otherwise browser history). Filter selections do NOT create history entries (clicking back while on "Active" filter does NOT return to "All" - filter state is not in URL). No unexpected page reloads occur.
- **What happens when a user tries to edit two tasks simultaneously?** When user clicks "Edit" on Task B while Task A is in edit mode, Task A automatically exits edit mode (changes discarded, no save) and Task B enters edit mode. Only one task can be in edit mode at a time.
- **How are timestamps displayed across different timezones?** All timestamps are stored in UTC in the database and displayed in the user's local timezone using browser's Intl.DateTimeFormat API. Format: "YYYY-MM-DD HH:MM" (24-hour time). Timezone conversion is automatic.
- **What happens when a user enters wrong credentials multiple times on the login page?** Each failed attempt shows the same inline error message "Invalid email or password". No rate limiting in Phase II (defer to Phase V). The error message clears when the user starts typing again to allow retry. No account lockout in Phase II.
- **How does the login page handle network errors vs authentication errors?** Network errors (timeout, offline, 500 server error) show "Unable to connect. Please check your internet connection and try again." Authentication errors (401) show "Invalid email or password". Both are displayed as inline red text below the form, not as browser alerts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all tasks in a responsive web interface accessible via modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **FR-002**: System MUST provide a task creation form with title input field (text input, 100 character max, required) and description textarea (500 character max, optional) located above the task list
- **FR-003**: System MUST display each task card with: round checkbox (24x24px, left side), title text (18px bold on desktop, 16px bold on mobile), description text (16px regular, or "-" if empty), status icon (green checkmark if completed), creation date (format: YYYY-MM-DD), completion timestamp if completed (format: "Completed: YYYY-MM-DD HH:MM"), updated timestamp if edited (format: "Updated: YYYY-MM-DD HH:MM"), 8-character task ID (12px gray text), Edit button (pencil icon, 44x44px, right side), Delete button (trash icon, 44x44px, red, right side)
- **FR-004**: System MUST allow users to mark tasks complete/incomplete by clicking round checkbox (44x44px touch target on mobile, 24x24px visible size) on left side of task card, toggling between pending (empty circle checkbox) and completed (green checkmark in checkbox, title strikethrough)
- **FR-005**: System MUST allow users to edit task title and description by clicking Edit button (pencil icon, 44x44px) which transforms the task card into edit mode with: title input field (pre-filled with current title), description textarea (pre-filled with current description), Save button (green, 44x44px), Cancel button (gray, 44x44px)
- **FR-006**: System MUST allow users to delete tasks by clicking Delete button (trash icon, 44x44px, red) which opens a centered confirmation modal (400px width on desktop, 90% viewport width on mobile) with "Delete Task?" title, warning message "Are you sure you want to delete this task? This action cannot be undone.", Cancel button (gray, 44x44px), and Confirm button (red, 44x44px)
- **FR-007**: System MUST show loading states as follows: initial page load shows centered spinner with "Loading tasks..." text in task list area; form submission shows spinner inside the submit button and disables the button; task operations (complete/edit/delete) show inline spinner on the affected task card
- **FR-008**: System MUST display success notifications as green toast messages at top-right of screen for 3 seconds with auto-dismiss: "Task added successfully", "Task updated successfully", "Task completed!", "Task deleted successfully"
- **FR-009**: System MUST display error notifications as follows: validation errors show red inline text below the relevant input field and persist until user corrects the input; API errors show red toast at top-right for 5 seconds with manual dismiss (X button): "Failed to add task. Please try again.", "Failed to update task", "Failed to update task status", "Failed to delete task. Please try again.", "Request timed out. Please check your connection." (with Retry button)
- **FR-010**: System MUST sort tasks by created_at timestamp in descending order (newest first), with UUID as secondary sort for identical timestamps
- **FR-011**: System MUST provide responsive layouts at three breakpoints: Mobile (320-767px): single column, 16px font, 44x44px buttons, 12px card padding, stacked action buttons; Tablet (768-1023px): single column, 18px titles, 44x44px buttons, 16px card padding, horizontal action buttons; Desktop (1024px+): max-width 800px centered, 18px titles, 44x44px buttons, 20px card padding, horizontal action buttons
- **FR-012**: System MUST maintain Phase 1 functional behaviors: UUID v4 generation for task IDs, UTC timestamps for created_at/completed_at/updated_at, validation rules (title 1-100 chars required, description 0-500 chars optional), partial ID matching (minimum 8 characters)
- **FR-013**: System MUST provide visual status indicators: pending tasks show empty circle checkbox; completed tasks show green checkmark (✓) in checkbox, title with strikethrough text decoration, and "Completed: YYYY-MM-DD HH:MM" timestamp below description
- **FR-014**: System MUST prevent form submission with invalid data: disable submit button if title is empty or > 100 characters; show red inline error text below input; prevent API call until validation passes
- **FR-015**: System MUST track and display timestamps: created_at (always, format "Created: YYYY-MM-DD"), completed_at (only when status=completed, format "Completed: YYYY-MM-DD HH:MM"), updated_at (only when title or description edited, format "Updated: YYYY-MM-DD HH:MM")
- **FR-016**: System MUST provide filter tabs above task list: "All" (shows all tasks), "Active" (shows only pending tasks), "Completed" (shows only completed tasks). Tabs are 44x44px height buttons, active tab has blue underline (4px height) and blue text (#0066CC). Filter does NOT persist across page reloads (always resets to "All").
- **FR-017**: System MUST display 8-character task ID (first 8 chars of UUID) in 12px gray text at bottom-left of each task card on all devices
- **FR-018**: System MUST use consistent design tokens: Primary color #0066CC (blue), Success color #10B981 (green), Error color #EF4444 (red), Gray text #6B7280, Background #FFFFFF, Card border #E5E7EB (1px), Border radius 8px, Spacing scale 4/8/12/16/20/24px
- **FR-019**: System MUST ensure all interactive elements meet minimum touch target size: 44x44px for all buttons, checkboxes (44x44px touch target with 24px visible checkbox), input fields (minimum 44px height), with minimum 8px spacing between adjacent touch targets
- **FR-020**: System MUST handle empty states: when no tasks exist, display centered message "No tasks yet. Add one to get started!" with icon in the task list area; when filtered view has no matches (e.g., "Active" filter with 0 pending tasks), display "No [active/completed] tasks" centered in task list area
- **FR-021**: System MUST display authentication errors on login page as inline error messages (not browser alerts): "Invalid email or password" for 401 responses, "Unable to connect. Please check your internet connection and try again." for network errors. Error text MUST be displayed in 14px red font (#EF4444), centered below the form with 8px top margin, and clear automatically when user starts typing
- **FR-022**: System MUST validate login form inputs inline before submission: empty email shows "Email is required", empty password shows "Password is required", invalid email format shows "Please enter a valid email address". Validation errors appear below the respective input field in 14px red font (#EF4444)

### UI Component Specifications

- **Task Card Component**: Card container with 1px border (#E5E7EB), 8px border-radius, padding varies by breakpoint (12px mobile, 16px tablet, 20px desktop), background #FFFFFF, box-shadow on hover (0 4px 6px rgba(0,0,0,0.1), transition 200ms ease). Layout: Flexbox row with 3 sections: Left (checkbox), Center (content), Right (actions).

- **Checkbox Component**: Clickable area 44x44px, visible checkbox 24x24px centered within, border 2px #6B7280 when unchecked, background #10B981 with white checkmark icon when checked, border-radius 50% (circular), cursor pointer, transition all 150ms ease

- **Button Components**: Primary button (Add Task): background #0066CC, white text, 44x44px minimum height, 16px horizontal padding, border-radius 8px, font-weight 600, cursor pointer, hover background #0052A3. Secondary button (Cancel): background #E5E7EB, gray text #6B7280, same sizing. Danger button (Confirm Delete): background #EF4444, white text, same sizing. Disabled state: opacity 0.5, cursor not-allowed

- **Input Components**: Text input (title): height 44px, border 1px #E5E7EB, border-radius 8px, padding 12px, font-size 16px, focus border #0066CC (2px), width 100%. Textarea (description): min-height 88px (2 lines), same styling as text input, resize vertical allowed. Error state: border #EF4444 (2px), red error text below (14px, #EF4444)

- **Modal Component**: Fixed position overlay (background rgba(0,0,0,0.5)), centered modal box (400px width on desktop, 90% width on mobile, max 600px), background #FFFFFF, border-radius 12px, padding 24px, box-shadow 0 20px 25px rgba(0,0,0,0.15). Title 20px bold, message 16px regular, button row flexbox with 16px gap

- **Toast Notification Component**: Fixed position top-right (24px from top, 24px from right on desktop; 16px on mobile), width 320px max, background #FFFFFF, border-radius 8px, padding 16px, box-shadow 0 10px 15px rgba(0,0,0,0.1). Success toast: green left border 4px #10B981. Error toast: red left border 4px #EF4444. Slide-in animation from right 300ms ease, auto-dismiss after specified duration (3s success, 5s error) with fade-out 200ms

- **Filter Tabs Component**: Horizontal button group, each tab 44px height, padding 12px 24px, font-size 16px, background transparent, border-bottom 4px transparent, cursor pointer. Active tab: border-bottom 4px #0066CC, color #0066CC, font-weight 600. Inactive tab: color #6B7280, font-weight 400. Hover state: background #F3F4F6

- **Login Error Message Component**: Displayed below the login form, centered, font-size 14px, color #EF4444 (red), margin-top 8px, max-width matches form width. Error message appears with fade-in animation (150ms ease). Clears on input focus (any form field). For field-level validation errors, display directly below the relevant input with 4px top margin.

- **Empty State Component**: Centered flexbox column, icon (64x64px gray), heading (20px bold), message (16px regular gray), total height fills available task list area. Icon uses SVG with #6B7280 fill

- **Loading Spinner Component**: Inline spinner: 16px circle, 2px border, rotating animation 1s linear infinite, gray color. Centered spinner: 48px circle, 3px border, same animation, with "Loading tasks..." text below (16px gray)

### Key Entities

- **Task**: Represents a todo item with the following attributes:
  - **id** (string, UUID v4 format, displayed as first 8 characters in UI)
  - **title** (string, 1-100 characters, required)
  - **description** (string, 0-500 characters, optional, defaults to empty string)
  - **status** (enum: "pending" or "completed")
  - **created_at** (ISO 8601 timestamp, UTC, displayed as "YYYY-MM-DD" in local timezone)
  - **completed_at** (ISO 8601 timestamp or null, UTC, displayed as "Completed: YYYY-MM-DD HH:MM" in local timezone when not null)
  - **updated_at** (ISO 8601 timestamp or null, UTC, displayed as "Updated: YYYY-MM-DD HH:MM" in local timezone when not null, set when title or description changes)

- **Task List View**: Web interface component that:
  - Displays tasks in responsive single-column layout
  - Supports client-side filtering by status (all/pending/completed) via tab buttons
  - Shows task count badge ("X tasks") above the list
  - Provides quick actions (checkbox for complete, Edit button, Delete button) on each card
  - Paginates at 50 tasks per page with Previous/Next navigation

- **Task Form**: Web form component that:
  - Contains title text input (100 char max) and description textarea (500 char max)
  - Validates on blur and on submit
  - Shows inline error messages below fields in red text
  - Clears fields on successful submission
  - Supports Enter key submission for title field only
  - Disables submit button during API requests

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their task list within 2 seconds of opening the web application on a 3G network connection (3 Mbps download, 750 Kbps upload, 100ms latency)
- **SC-002**: Users can add a new task in under 15 seconds from page load to task appearing in list, measured from initial page render to new task card visible
- **SC-003**: Users can complete all CRUD operations (Add, View, Update, Complete, Delete) using only mouse or touch input without requiring keyboard shortcuts or Tab navigation
- **SC-004**: Application remains functional and all interactive elements are accessible on mobile devices with screen widths as small as 320px without horizontal scrolling
- **SC-005**: 90% of form validation errors (empty title, title > 100 chars, description > 500 chars) are displayed as inline red text directly below the relevant input field rather than in global toast notifications
- **SC-006**: Application displays appropriate feedback (loading spinner, success toast, or error toast) within 300ms for 100% of user actions (add, edit, delete, complete)
- **SC-007**: Users can view and interact with at least 100 tasks loaded on a single page without browser lag (maintaining 60fps scroll performance and < 300ms action response time)
- **SC-008**: 100% of interactive elements (buttons, checkboxes, input fields, links) have minimum 44x44px touch target size with 8px minimum spacing between adjacent targets
- **SC-009**: Page layout adapts correctly to at least 3 viewport breakpoints (mobile 320-767px, tablet 768-1023px, desktop 1024px+) with no horizontal scrolling at any width
- **SC-010**: Users can complete the primary workflow (add task → view task in list → mark complete → verify completion) in under 30 seconds measured from form input start to visual confirmation of completed state

### Quality Attributes

- **Usability**: 90% of first-time users can complete the primary workflow (add, view, complete a task) within 2 minutes without instructions, measured by usability testing with 10+ participants
- **Responsiveness**: UI layout transitions smoothly between breakpoints when resizing browser window with no broken layouts, overlapping text, or hidden content at any width between 320px and 2560px
- **Performance**: All API responses return within 500ms at p95 (95th percentile), page interactions respond within 300ms (button clicks, checkbox toggles, tab switches), and page Time to Interactive (TTI) is under 2 seconds on mobile 3G
- **Accessibility**: All interactive elements have minimum color contrast ratio of 4.5:1 for normal text (WCAG AA), minimum 44x44px touch targets (WCAG 2.1 Level AA), and visible focus indicators (2px blue outline) when navigating with keyboard
- **Reliability**: Application handles network errors (timeouts, 500 errors, connection failures) gracefully with user-friendly error messages and retry options, maintaining UI state without data loss, with 0% crash rate during normal operations

## Implementation Clarifications

### Authentication Behavior
- **User Name Persistence**: During signup, the user's name is collected and stored in the `users.name` field. This name is returned by both signup and login API endpoints and persisted in frontend localStorage.
- **Welcome Messages**:
  - After signup: Display "Welcome, {user.name}!" on the dashboard (first visit only)
  - After login: Display "Welcome back, {user.name}!" on the dashboard (all subsequent visits)
  - The `isNewUser` flag in localStorage determines which message to show, cleared after 5 seconds
  - Fallback: If name is not available, display the email username (part before @)

### Guest vs Authenticated Users
- **Guest Access**: Unauthenticated users can access the dashboard in guest mode
- **Guest Storage**: Guest tasks are stored in-memory (client-side state) only and will be lost on page refresh or browser close
- **Authenticated Storage**: Only authenticated users have tasks persisted to Neon DB
- **Session Persistence**: Authenticated users remain logged in across page refreshes via session cookies

### Navigation Behavior
- **"Start Free" Button**:
  - If user is already authenticated: Redirects directly to `/dashboard`
  - If user is not authenticated: Redirects to `/login` page
  - This prevents unnecessary login page visits for authenticated users

## Assumptions

1. **Database Persistence**: Phase 2 adds PostgreSQL database via Neon DB to persist tasks across sessions (addressing Phase 1's in-memory limitation). Data persists indefinitely (no automatic deletion).
2. **Authentication**: Phase 2 includes user authentication via Better Auth with email/password signup and login. Each user sees only their own tasks (user_id foreign key on tasks table). Session-based auth with HTTP-only cookies.
3. **Modern Browsers**: Target browsers are Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ (released within last 2 years). No Internet Explorer support. ES6+ JavaScript and CSS Grid/Flexbox required.
4. **Network Connectivity**: Application requires active network connection for API calls. No offline support (no service workers or IndexedDB caching in Phase 2). Network errors show retry options.
5. **Session-Based Auth**: Users remain logged in during browser session (session cookie). Closing browser or clicking logout clears session. No "Remember Me" checkbox in Phase 2.
6. **Single-Page Application**: Frontend is a Next.js App Router SPA with client-side routing. Navigation between routes does not trigger full page reloads. Only initial page load fetches HTML from server.
7. **REST API**: Backend provides RESTful JSON API with standard HTTP methods: GET /api/tasks (list), POST /api/tasks (create), PUT /api/tasks/:id (update), DELETE /api/tasks/:id (delete), PATCH /api/tasks/:id/complete (toggle completion). All endpoints return JSON.
8. **No Real-Time Sync**: Multiple browser tabs operate independently. Changes in one tab are NOT reflected in other tabs until manual refresh (no WebSocket, Server-Sent Events, or polling in Phase 2).
9. **English Language**: All UI text is in English (buttons, labels, messages, placeholders). No i18n or multi-language support in Phase 2 (multi-language is Phase III bonus feature).
10. **Standard Form Validation**: Uses HTML5 form validation attributes (required, maxLength) enhanced with custom JavaScript validation. No third-party validation libraries (yup, zod) in Phase 2.

## Out of Scope (Phase II)

The following features are explicitly excluded from Phase II and will be addressed in later phases:

- **AI Chatbot Interface**: Natural language task management via chat (Phase III)
- **MCP Server**: Model Context Protocol integration (Phase III)
- **Voice Commands**: Speech-to-text task creation (Phase III bonus)
- **Multi-Language Support**: Urdu or other languages (Phase III bonus)
- **Containerization**: Docker images and Dockerfiles (Phase IV)
- **Kubernetes Deployment**: K8s manifests, Helm charts, Minikube (Phase IV)
- **Cloud Deployment**: GKE/AKS/OKE hosting (Phase V)
- **Event-Driven Architecture**: Kafka and Dapr integration (Phase V)
- **Advanced Features**: Due dates, priorities, recurring tasks, reminders, categories/tags, subtasks, task dependencies (Phase V)
- **CI/CD Pipelines**: GitHub Actions workflows (Phase V)
- **Real-Time Collaboration**: Multi-user simultaneous editing, presence indicators, live cursors
- **Offline Support**: Service workers, IndexedDB caching, background sync, offline-first architecture
- **Advanced Search**: Full-text search, filtering by multiple criteria (date range, priority, tags), saved searches
- **Drag-and-Drop**: Reordering tasks via drag interactions, drag to complete, drag to delete
- **Bulk Operations**: Select multiple tasks with checkboxes, batch complete, batch delete, batch edit
- **Task History**: Audit log of all changes with timestamps and user attribution, undo/redo operations
- **Import/Export**: CSV/JSON export, data portability, backup/restore features
- **Keyboard Shortcuts**: Power user efficiency features (J/K navigation, C to complete, E to edit, D to delete)
- **Dark Mode**: Theme switching, auto-detect system preference, theme persistence
- **Notifications**: Browser push notifications, email reminders, webhook integrations
- **Attachments**: File uploads, image attachments, document previews
- **Comments**: Task discussions, @mentions, activity feeds
- **Custom Fields**: User-defined metadata fields, custom task properties
- **Views**: Kanban board, calendar view, timeline/Gantt chart
- **Analytics**: Task completion trends, productivity metrics, charts/graphs
- **Mobile Apps**: Native iOS/Android apps (Phase II is web-only)

## Dependencies

- **Frontend Technology**: Next.js 15+ (App Router), React 19+, TypeScript 5+, TailwindCSS 4+ for styling
- **Backend Technology**: FastAPI (latest stable), Python 3.13+, SQLModel ORM for database operations
- **Database**: Neon DB (PostgreSQL 16+) for persistent storage, connection pooling enabled
- **Authentication**: Better Auth (latest stable) for user signup/login/session management
- **Development Tool**: Claude Code for spec-driven implementation following SDD workflow
- **Testing**: Playwright (latest stable) for E2E tests, Vitest (latest stable) for unit tests, coverage target 80%+
- **Phase I Completion**: All Phase I functionality must be working (console app with CRUD operations tested) before Phase II begins
- **Deployment Platform**: Vercel for frontend (Next.js), backend deployed to same Vercel project (API routes), Neon DB cloud hosting

## Constraints

- **No Manual Coding**: All code MUST be generated via Claude Code by refining specifications (hackathon rule). No direct file editing allowed except for configuration files.
- **Preserve Phase I Features**: All CRUD operations from Phase I must work identically in Phase II (same validation rules, same data model, same business logic). Behavioral compatibility required for regression testing.
- **No New Features**: Phase II focuses purely on web UI for existing functionality. Do NOT add due dates, priorities, tags, search, sorting options, or any features beyond Phase I's add/list/update/complete/delete.
- **Responsive Required**: Must work on mobile (320px minimum), tablet (768px), and desktop (1024px+). NOT desktop-only. Mobile-first design approach.
- **Modern Stack Only**: Must use Next.js 15+, FastAPI, Neon DB, Better Auth as specified in hackathon requirements. No framework substitutions (no Vue, Angular, Express, Django).
- **RESTful API**: Backend must follow REST principles with proper HTTP methods (GET/POST/PUT/DELETE), status codes (200/201/400/401/404/500), and JSON payloads.
- **No WebSockets**: Real-time features (live updates, presence) deferred to later phases. HTTP-only in Phase II.
- **Session-Based Auth**: Simple session cookies with Better Auth. No JWT tokens, no OAuth (Google/GitHub login), no passwordless magic links in Phase II.
- **No Third-Party UI Libraries**: No Material-UI, Chakra UI, shadcn/ui, Ant Design. Use TailwindCSS utility classes for styling. Custom components only.
- **API Rate Limiting**: Not required in Phase II (internal app, single user during development). Add in Phase V for production.

## Non-Functional Requirements

### Performance
- Initial page load (Time to First Byte) under 800ms on 3G network
- Largest Contentful Paint (LCP) under 2.5 seconds on mobile 3G
- First Input Delay (FID) under 100ms for all interactive elements
- Cumulative Layout Shift (CLS) under 0.1 (no layout jumps during load)
- API response time under 500ms at p95 for all CRUD endpoints
- Time to Interactive (TTI) under 2 seconds on mobile devices
- Support at least 100 tasks loaded in browser without pagination lag (60fps scrolling maintained)
- Smooth 60fps animations and transitions (200-300ms duration max)
- Bundle size under 500KB gzipped for initial page load (JavaScript + CSS)

### Usability
- Touch targets exactly 44x44px minimum for all interactive elements (buttons, checkboxes, links)
- Adjacent touch targets have minimum 8px spacing (WCAG 2.1 Level AA 2.5.5)
- Clear visual feedback for all interactive states: hover (opacity 0.8 or background color change), active (scale 0.98), focus (2px blue outline #0066CC), disabled (opacity 0.5, cursor not-allowed)
- Inline validation errors appear within 300ms of input blur event, displayed as 14px red text (#EF4444) directly below the input field
- Consistent spacing using 4/8/12/16/20/24px scale (multiples of 4px)
- Readable text with minimum 16px font size on mobile, 18px on desktop for body text
- Sufficient color contrast ratios: 4.5:1 minimum for normal text (16px), 3:1 for large text (24px+), 3:1 for UI components (WCAG AA compliance)
- Line height 1.5 for body text, 1.2 for headings (optimal readability)
- Max line length 65-75 characters for body text on desktop (optimal readability per research)

### Responsiveness
- Three breakpoints defined: Mobile (320-767px), Tablet (768-1023px), Desktop (1024px+)
- Mobile breakpoint uses full viewport width minus 16px margins (8px each side)
- Tablet breakpoint uses full viewport width minus 32px margins (16px each side)
- Desktop breakpoint uses 800px max-width centered with 24px left/right margins
- No horizontal scrolling at any viewport width between 320px and 2560px
- Adaptive layouts that reorganize content for available space (stack vs horizontal)
- Touch-friendly interactions on mobile: no hover-dependent features (all actions accessible via tap)
- Landscape orientation on mobile (e.g., 667x375px) uses mobile breakpoint rules (< 768px width threshold)
- Font sizes scale between breakpoints: 16px mobile → 18px desktop for body, 20px mobile → 24px desktop for headings
- Images and icons scale proportionally: 24px icons on mobile → 24px desktop (no scaling needed for icons), decorative images use max-width 100% with height auto

### Reliability
- Graceful error handling for network failures with user-friendly messages: timeouts show "Request timed out. Please check your connection." with Retry button; 500 errors show "Something went wrong. Please try again."; 404 errors show "Task not found."
- Form state preservation during validation errors: input values remain populated, no data loss on failed submit
- No data loss on accidental navigation or refresh during edit: browser "unsaved changes" warning when leaving page with unsaved edits (beforeunload event)
- Proper loading states prevent double submissions: buttons disabled (aria-disabled="true", opacity 0.5) during API requests with spinner visible
- API errors logged to browser console for debugging (console.error with full error object) but NOT exposed to users (no stack traces in UI)
- Automatic retry with exponential backoff for transient failures (retry 1x after 1s, 2x after 2s, then show error)
- 0% crash rate during normal operations (no uncaught exceptions, comprehensive error boundaries)

### Security
- User authentication required to view or modify tasks (unauthenticated requests redirect to /login)
- Users can only access their own tasks (user_id foreign key enforced in database, API checks session user_id matches task.user_id)
- Input sanitization prevents XSS attacks: HTML-escape all user inputs before rendering (React's default behavior), use textContent not innerHTML
- CSRF protection on all state-changing operations (POST/PUT/DELETE) using Better Auth's built-in CSRF tokens
- Passwords hashed using bcrypt with salt rounds 10 (Better Auth's default)
- HTTPS enforced in production (HTTP redirects to HTTPS, HSTS header set), HTTP acceptable for local development (localhost)
- SQL injection prevented by using parameterized queries (SQLModel ORM protects against injection)
- Session cookies set with HttpOnly (prevents JavaScript access), Secure (HTTPS only in production), SameSite=Lax (CSRF protection)
- Sensitive data (passwords, session tokens) never logged or exposed in error messages
- Rate limiting NOT implemented in Phase II (defer to Phase V for production)

### Maintainability
- Clean component separation: UI components (src/components/), API client (src/lib/api.ts), state management (React hooks), utilities (src/lib/utils.ts)
- TypeScript strict mode enabled (strict: true in tsconfig.json) for type safety
- Consistent code formatting with Prettier (print width 100, single quotes, trailing commas, 2 space indent)
- ESLint rules enforced for code quality: no-unused-vars, no-console (warn), prefer-const, react-hooks/exhaustive-deps
- API routes follow RESTful conventions: GET /api/tasks (list all), POST /api/tasks (create), PUT /api/tasks/[id] (update), DELETE /api/tasks/[id] (delete), PATCH /api/tasks/[id]/complete (toggle completion)
- Database migrations tracked using SQL files (migrations/001_initial.sql, 002_add_user_id.sql, etc.) with timestamps
- Reusable components with clear props interfaces (TypeScript types exported)
- CSS utility classes follow TailwindCSS naming conventions (bg-blue-500, text-lg, p-4)
- Environment variables for configuration (DATABASE_URL, AUTH_SECRET, API_URL) loaded from .env.local

### Testability
- E2E tests cover all primary user workflows: signup → add task → view list → mark complete → edit → delete → logout (Playwright test suite)
- API endpoints have integration tests: test each CRUD endpoint with valid/invalid inputs, edge cases, auth checks (Vitest test suite)
- Critical UI components have unit tests: TaskCard, TaskForm, FilterTabs, Modal components (Vitest + React Testing Library)
- Test coverage goal: 80%+ for business logic (API routes, database queries, validation functions)
- Tests run in CI before deployment (GitHub Actions workflow): lint → type-check → unit tests → E2E tests → deploy
- Test data factories for consistent test setups (createTestTask, createTestUser helpers)
- Mock API responses in unit tests (msw library for network mocking)
- Visual regression testing NOT required in Phase II (defer to later phases)

## Phase Transition Criteria

Before advancing to Phase III, the following must be true:

- [ ] All P1-P4 user stories implemented and passing acceptance tests
- [ ] All edge cases handled gracefully with appropriate error messages
- [ ] All acceptance scenarios automated as E2E tests (Playwright) and passing
- [ ] Application responsive on mobile (375px), tablet (768px), desktop (1440px) with manual testing verified
- [ ] User authentication working with Better Auth (signup, login, logout, session persistence)
- [ ] Database persistence working with Neon DB (tasks persist across page reloads, user-specific data isolation)
- [ ] All Phase I CRUD operations working identically in web UI (regression tests passing)
- [ ] E2E test coverage for critical user journeys (add → view → complete → edit → delete workflow)
- [ ] API endpoints documented with OpenAPI spec (FastAPI auto-generates /docs endpoint)
- [ ] Code quality checks passing: TypeScript (no errors), ESLint (no errors), Prettier (formatted), Ruff (Python linter), MyPy (Python type checker)
- [ ] Demo video recorded (<90 seconds) showing responsive UI on mobile and desktop
- [ ] Specification documented with PHRs for all major decisions
- [ ] ADRs created for architectural decisions (if any significant choices made during planning)
- [ ] Phase transition validation approved by reviewing this checklist
- [ ] No open bugs blocking core functionality (P1/P2 user stories)
- [ ] Performance metrics met: LCP < 2.5s, FID < 100ms, CLS < 0.1, API p95 < 500ms

## Notes

This specification represents Phase II of a 5-phase hackathon project. Phase II transforms the console application into a full-stack web application while **preserving all Phase I functionality exactly**. The focus is on creating a responsive, user-friendly web interface without adding new features. This maintains the principle of progressive enhancement where each phase builds on the previous phase's foundation.

**Critical Success Factor**: The web UI must replicate Phase I behavior exactly—same validation rules (title 1-100 chars, description 0-500 chars), same data model (UUID, timestamps, status enum), same business logic (partial ID matching, newest-first sorting). Users should be able to perform the exact same CRUD operations through a visual interface instead of menu commands.

**No Feature Creep**: Resist the temptation to add "just one more feature" like due dates, priorities, tags, search, or sorting options. Phase II is strictly about the interface transformation from console to web. Advanced features come in Phase V. If a feature wasn't in Phase I, it does NOT belong in Phase II.

**Tech Stack Justification**:
- **Next.js 15+**: Provides Server-Side Rendering (SSR), App Router with client-side navigation, API routes in one framework, automatic code splitting, image optimization, and Vercel deployment integration
- **FastAPI**: Offers high-performance Python backend with automatic OpenAPI documentation at /docs, async request handling, Pydantic validation, and native async/await support for database queries
- **Neon DB**: Provides managed PostgreSQL without infrastructure management, generous free tier for development, built-in connection pooling, and branch-per-environment capability
- **Better Auth**: Simplifies authentication with minimal configuration, secure session management with HTTP-only cookies, password hashing with bcrypt, and CSRF protection built-in
- This stack aligns with hackathon requirements while maintaining clean architecture and separation of concerns

**Responsive Design Philosophy**: Mobile-first design ensures touch-friendly interactions (44x44px targets) and readable content (16px+ fonts) on small screens. Tablet layout enhances spacing and font sizes. Desktop layout maximizes readability with 800px max-width and increased padding. Each breakpoint provides an optimal experience for its device class without compromising functionality.

**Accessibility Considerations**: All interactive elements meet WCAG 2.1 Level AA standards: 4.5:1 color contrast for text, 44x44px touch targets, visible focus indicators (2px blue outline), semantic HTML for screen readers, proper heading hierarchy, and keyboard-accessible interactions (Tab, Enter, Escape).

**Performance Strategy**: Optimize Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1) by minimizing JavaScript bundle size (code splitting), optimizing images (WebP format, lazy loading), reducing API latency (database indexes, connection pooling), and using efficient rendering (React Server Components where applicable).
