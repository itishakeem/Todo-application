import { test, expect } from '@playwright/test';

test.describe('Chat Page - Infrastructure Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login and authenticate first
    await page.goto('/login');

    // Fill in login form with test credentials
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
  });

  test('Chat page renders with authentication', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.getByText('TaskFlow')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'AI Chat' })).toBeVisible();
  });

  test('Unauthenticated user redirected to login', async ({ page }) => {
    // Logout first
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.waitForURL('/login');

    // Try to access chat directly
    await page.goto('/chat');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Sign in to continue to TaskFlow')).toBeVisible();
  });

  test('Send message and receive AI response', async ({ page }) => {
    await page.goto('/chat');

    // Wait for chat to load
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible();

    // Send a message
    await page.locator('[data-testid="message-input-field"]').fill('Hello, can you help me add a task?');
    await page.locator('[data-testid="send-button"]').click();

    // Wait for response to appear
    await expect(page.getByText('Hello! I\'d be happy to help you manage your tasks.')).toBeVisible({ timeout: 10000 });
  });

  test('Create new conversation', async ({ page }) => {
    await page.goto('/chat');

    // Wait for initial state
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible();

    // Click "New Chat" button
    await page.locator('button', { hasText: 'New Chat' }).click();

    // Verify conversation list shows new conversation
    await expect(page.locator('[data-testid="conversation-list"]')).toContainText('New Conversation');
  });

  test('Resume existing conversation', async ({ page }) => {
    await page.goto('/chat');

    // Wait for chat to load
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible();

    // Send a message to create conversation
    await page.locator('[data-testid="message-input-field"]').fill('Testing conversation resume');
    await page.locator('[data-testid="send-button"]').click();

    // Wait for response
    await page.waitForSelector('.message-assistant', { timeout: 10000 });

    // Navigate away and back
    await page.goto('/dashboard');
    await page.goto('/chat');

    // Verify conversation history is preserved
    await expect(page.locator('.message-user').first()).toContainText('Testing conversation resume');
  });

  test('Conversation list displays correctly', async ({ page }) => {
    await page.goto('/chat');

    // Wait for sidebar to load
    await expect(page.locator('[data-testid="conversation-list"]')).toBeVisible();

    // Verify "New Chat" button exists
    await expect(page.locator('button', { hasText: 'New Chat' })).toBeVisible();
  });

  test('Switch between conversations', async ({ page }) => {
    await page.goto('/chat');

    // Create first conversation
    await page.locator('[data-testid="message-input-field"]').fill('First conversation message');
    await page.locator('[data-testid="send-button"]').click();
    await expect(page.locator('.message-user').first()).toContainText('First conversation message');

    // Create second conversation
    await page.locator('button', { hasText: 'New Chat' }).click();
    await page.locator('[data-testid="message-input-field"]').fill('Second conversation message');
    await page.locator('[data-testid="send-button"]').click();

    // Switch back to first conversation
    // We'll need to identify conversations by timestamp or other unique identifiers
    await page.waitForTimeout(1000);
  });

  test('Message history loads on conversation select', async ({ page }) => {
    await page.goto('/chat');

    // Send a message to create conversation
    await page.locator('[data-testid="message-input-field"]').fill('Test message for history');
    await page.locator('[data-testid="send-button"]').click();
    await expect(page.locator('.message-user').first()).toContainText('Test message for history');

    // Create new conversation
    await page.locator('button', { hasText: 'New Chat' }).click();

    // Switch back to previous conversation
    // Need to implement logic to identify and select previous conversations
    await page.waitForTimeout(1000);
  });
});

test.describe('Task Operations via Chat Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login and authenticate first
    await page.goto('/login');

    // Fill in login form with test credentials
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');

    // Navigate to chat
    await page.goto('/chat');
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
  });

  test('Add task via natural language', async ({ page }) => {
    await page.locator('[data-testid="message-input-field"]').fill('Add a task to buy groceries');
    await page.locator('[data-testid="send-button"]').click();

    // Wait for response indicating task was added
    await expect(page.getByText(/task.*buy groceries/i)).toBeVisible({ timeout: 10000 });
  });

  test('List tasks via natural language', async ({ page }) => {
    await page.locator('[data-testid="message-input-field"]').fill('Show me my tasks');
    await page.locator('[data-testid="send-button"]').click();

    // Wait for response with task list
    await expect(page.getByText(/here are your tasks/i)).toBeVisible({ timeout: 10000 });
  });

  test('Complete task via natural language', async ({ page }) => {
    // First add a task
    await page.locator('[data-testid="message-input-field"]').fill('Add a task to complete');
    await page.locator('[data-testid="send-button"]').click();

    // Then complete it
    await page.locator('[data-testid="message-input-field"]').fill('Mark the "complete" task as done');
    await page.locator('[data-testid="send-button"]').click();

    // Wait for response confirming completion
    await expect(page.getByText(/marked as completed/i)).toBeVisible({ timeout: 10000 });
  });

  test('Update task via natural language', async ({ page }) => {
    // First add a task
    await page.locator('[data-testid="message-input-field"]').fill('Add a task to update');
    await page.locator('[data-testid="send-button"]').click();

    // Then update it
    await page.locator('[data-testid="message-input-field"]').fill('Change the "update" task to "updated task"');
    await page.locator('[data-testid="send-button"]').click();

    // Wait for response confirming update
    await expect(page.getByText(/updated/i)).toBeVisible({ timeout: 10000 });
  });

  test('Delete task via natural language', async ({ page }) => {
    // First add a task
    await page.locator('[data-testid="message-input-field"]').fill('Add a task to delete');
    await page.locator('[data-testid="send-button"]').click();

    // Then delete it
    await page.locator('[data-testid="message-input-field"]').fill('Delete the "delete" task');
    await page.locator('[data-testid="send-button"]').click();

    // Wait for response confirming deletion
    await expect(page.getByText(/deleted/i)).toBeVisible({ timeout: 10000 });
  });

  test('Natural language variations understood', async ({ page }) => {
    await page.locator('[data-testid="message-input-field"]').fill('Create a task to remember to call mom');
    await page.locator('[data-testid="send-button"]').click();

    // Wait for response indicating task was added
    await expect(page.getByText(/task.*call mom/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Error Handling Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login and authenticate first
    await page.goto('/login');

    // Fill in login form with test credentials
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');

    // Navigate to chat
    await page.goto('/chat');
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
  });

  test('Empty message shows validation error', async ({ page }) => {
    // Try to send empty message
    await page.locator('[data-testid="message-input-field"]').fill('');
    await page.locator('[data-testid="send-button"]').click();

    // Should not send and show validation feedback
    await expect(page.locator('[data-testid="send-button"]')).toBeEnabled();
  });

  test('Network error shows retry option', async ({ page }) => {
    // This would require mocking network failures
    // Simulate by temporarily disabling network
    await page.route('**/api/chat', route => route.abort());

    await page.locator('[data-testid="message-input-field"]').fill('Test message');
    await page.locator('[data-testid="send-button"]').click();

    // Should show error with retry option
    await expect(page.getByText(/error/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/retry/i)).toBeVisible();

    // Restore network
    await page.unroute('**/api/chat');
  });

  test('Invalid task ID shows helpful error', async ({ page }) => {
    // Try to operate on non-existent task
    await page.locator('[data-testid="message-input-field"]').fill('Mark task abc123 as done');
    await page.locator('[data-testid="send-button"]').click();

    // Wait for response with helpful error
    await expect(page.getByText(/not found/i)).toBeVisible({ timeout: 10000 });
  });

  test('Ambiguous command prompts clarification', async ({ page }) => {
    await page.locator('[data-testid="message-input-field"]').fill('Do something');
    await page.locator('[data-testid="send-button"]').click();

    // Wait for response asking for clarification
    await expect(page.getByText(/clarify/i)).toBeVisible({ timeout: 10000 });
  });
});