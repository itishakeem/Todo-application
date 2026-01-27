/**
 * E2E Tests for Inline Task Editing
 * T101-T109: Inline editing functionality testing
 * Spec: User Story 4 - Update task title and description inline
 */

import { test, expect } from '@playwright/test';

// T101: Click Edit button enters edit mode
test('T101: clicking Edit button enters edit mode', async ({ page }) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: 'test-task-1',
            title: 'Original Title',
            description: 'Original Description',
            status: 'pending',
            created_at: '2026-01-02T22:00:00Z',
            completed_at: null,
            updated_at: null,
          },
        ],
      }),
    });
  });

  await page.goto('/');

  await expect(
    page.locator('[data-testid="task-title"]', { hasText: 'Original Title' })
  ).toBeVisible();

  // Click Edit button
  const editButton = page.locator('[data-testid="edit-button"]').first();
  await editButton.click();

  // Should enter edit mode - look for input fields
  const titleInput = page.locator('input[name="edit-title"]');
  await expect(titleInput).toBeVisible();
  await expect(titleInput).toHaveValue('Original Title');
});

// T102: Edit mode shows title and description inputs
test('T102: edit mode displays title and description input fields', async ({
  page,
}) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: 'test-task-1',
            title: 'Test Task',
            description: 'Test Description',
            status: 'pending',
            created_at: '2026-01-02T22:00:00Z',
            completed_at: null,
            updated_at: null,
          },
        ],
      }),
    });
  });

  await page.goto('/');

  const editButton = page.locator('[data-testid="edit-button"]').first();
  await editButton.click();

  // Both inputs should be visible
  const titleInput = page.locator('input[name="edit-title"]');
  const descriptionInput = page.locator('textarea[name="edit-description"]');

  await expect(titleInput).toBeVisible();
  await expect(descriptionInput).toBeVisible();

  // Check pre-filled values
  await expect(titleInput).toHaveValue('Test Task');
  await expect(descriptionInput).toHaveValue('Test Description');
});

// T103: Save button updates task and exits edit mode
test('T103: clicking Save updates task and exits edit mode', async ({
  page,
}) => {
  let taskTitle = 'Original Title';

  await page.route('**/api/tasks*', async (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: 'test-task-1',
              title: taskTitle,
              description: 'Original Description',
              status: 'pending',
              created_at: '2026-01-02T22:00:00Z',
              completed_at: null,
              updated_at: null,
            },
          ],
        }),
      });
    }
  });

  await page.route('**/api/tasks/test-task-1', async (route) => {
    if (route.request().method() === 'PUT') {
      const data = route.request().postDataJSON();
      taskTitle = data.title;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-task-1',
          title: data.title,
          description: data.description,
          status: 'pending',
          created_at: '2026-01-02T22:00:00Z',
          completed_at: null,
          updated_at: '2026-01-03T10:00:00Z',
        }),
      });
    }
  });

  await page.goto('/');

  const editButton = page.locator('[data-testid="edit-button"]').first();
  await editButton.click();

  // Edit title
  const titleInput = page.locator('input[name="edit-title"]');
  await titleInput.fill('Updated Title');

  // Click Save
  const saveButton = page.locator('button', { hasText: /save/i });
  await saveButton.click();

  // Wait for edit mode to exit
  await page.waitForTimeout(500);

  // Edit inputs should be hidden
  await expect(titleInput).not.toBeVisible();

  // Updated title should be visible
  await expect(
    page.locator('[data-testid="task-title"]', { hasText: 'Updated Title' })
  ).toBeVisible({ timeout: 2000 });
});

// T104: Cancel button discards changes
test('T104: clicking Cancel discards changes and exits edit mode', async ({
  page,
}) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: 'test-task-1',
            title: 'Original Title',
            description: 'Original Description',
            status: 'pending',
            created_at: '2026-01-02T22:00:00Z',
            completed_at: null,
            updated_at: null,
          },
        ],
      }),
    });
  });

  await page.goto('/');

  const editButton = page.locator('[data-testid="edit-button"]').first();
  await editButton.click();

  // Edit title
  const titleInput = page.locator('input[name="edit-title"]');
  await titleInput.fill('Changed Title');

  // Click Cancel
  const cancelButton = page.locator('button', { hasText: /cancel/i });
  await cancelButton.click();

  // Edit mode should exit
  await expect(titleInput).not.toBeVisible();

  // Original title should still be visible (not changed)
  await expect(
    page.locator('[data-testid="task-title"]', { hasText: 'Original Title' })
  ).toBeVisible();
});

// T105: Escape key cancels edit mode
test('T105: pressing Escape key exits edit mode without saving', async ({
  page,
}) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: 'test-task-1',
            title: 'Original Title',
            description: 'Original Description',
            status: 'pending',
            created_at: '2026-01-02T22:00:00Z',
            completed_at: null,
            updated_at: null,
          },
        ],
      }),
    });
  });

  await page.goto('/');

  const editButton = page.locator('[data-testid="edit-button"]').first();
  await editButton.click();

  const titleInput = page.locator('input[name="edit-title"]');
  await expect(titleInput).toBeVisible();

  // Edit title
  await titleInput.fill('Changed Title');

  // Press Escape
  await page.keyboard.press('Escape');

  // Edit mode should exit
  await expect(titleInput).not.toBeVisible();

  // Original title should still be visible
  await expect(
    page.locator('[data-testid="task-title"]', { hasText: 'Original Title' })
  ).toBeVisible();
});

// T106: Only one task in edit mode at a time
test('T106: only one task can be in edit mode at a time', async ({ page }) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: 'task-1',
            title: 'First Task',
            description: 'First',
            status: 'pending',
            created_at: '2026-01-02T22:00:00Z',
            completed_at: null,
            updated_at: null,
          },
          {
            id: 'task-2',
            title: 'Second Task',
            description: 'Second',
            status: 'pending',
            created_at: '2026-01-02T23:00:00Z',
            completed_at: null,
            updated_at: null,
          },
        ],
      }),
    });
  });

  await page.goto('/');

  // Click Edit on first task
  const firstEditButton = page.locator('[data-testid="edit-button"]').first();
  await firstEditButton.click();

  const firstTaskInput = page.locator('input[name="edit-title"]').first();
  await expect(firstTaskInput).toBeVisible();

  // Click Edit on second task
  const secondEditButton = page.locator('[data-testid="edit-button"]').last();
  await secondEditButton.click();

  // First task should exit edit mode
  await expect(firstTaskInput).not.toBeVisible();

  // Second task should be in edit mode
  const allEditInputs = page.locator('input[name="edit-title"]');
  await expect(allEditInputs).toHaveCount(1);
});

// T107: Validation shows inline errors in edit mode
test('T107: validation errors display inline in edit mode', async ({
  page,
}) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: 'test-task-1',
            title: 'Original Title',
            description: 'Original Description',
            status: 'pending',
            created_at: '2026-01-02T22:00:00Z',
            completed_at: null,
            updated_at: null,
          },
        ],
      }),
    });
  });

  await page.goto('/');

  const editButton = page.locator('[data-testid="edit-button"]').first();
  await editButton.click();

  const titleInput = page.locator('input[name="edit-title"]');

  // Clear title (invalid)
  await titleInput.fill('');

  // Try to save
  const saveButton = page.locator('button', { hasText: /save/i });
  await saveButton.click();

  // Should show validation error
  const errorMessage = page.locator('text=/title.*required|please enter.*title/i');
  await expect(errorMessage).toBeVisible({ timeout: 1000 });
});

// T108: Loading state on Save button during API call
test('T108: Save button shows loading state during API call', async ({
  page,
}) => {
  await page.route('**/api/tasks*', async (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: 'test-task-1',
              title: 'Original Title',
              description: 'Original Description',
              status: 'pending',
              created_at: '2026-01-02T22:00:00Z',
              completed_at: null,
              updated_at: null,
            },
          ],
        }),
      });
    }
  });

  await page.route('**/api/tasks/test-task-1', async (route) => {
    // Delay response
    await new Promise((resolve) => setTimeout(resolve, 1000));
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-task-1',
        title: 'Updated Title',
        description: 'Original Description',
        status: 'pending',
        created_at: '2026-01-02T22:00:00Z',
        completed_at: null,
        updated_at: '2026-01-03T10:00:00Z',
      }),
    });
  });

  await page.goto('/');

  const editButton = page.locator('[data-testid="edit-button"]').first();
  await editButton.click();

  const titleInput = page.locator('input[name="edit-title"]');
  await titleInput.fill('Updated Title');

  const saveButton = page.locator('button', { hasText: /save/i });
  await saveButton.click();

  // Should show loading spinner
  const spinner = saveButton.locator('svg[aria-label="Loading"]');
  await expect(spinner).toBeVisible({ timeout: 500 });

  // Button should be disabled
  await expect(saveButton).toBeDisabled();
});

// T109: API error shows toast notification
test('T109: API error displays error toast notification', async ({ page }) => {
  await page.route('**/api/tasks*', async (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: 'test-task-1',
              title: 'Original Title',
              description: 'Original Description',
              status: 'pending',
              created_at: '2026-01-02T22:00:00Z',
              completed_at: null,
              updated_at: null,
            },
          ],
        }),
      });
    }
  });

  await page.route('**/api/tasks/test-task-1', async (route) => {
    // Return error
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Server error' }),
    });
  });

  await page.goto('/');

  const editButton = page.locator('[data-testid="edit-button"]').first();
  await editButton.click();

  const titleInput = page.locator('input[name="edit-title"]');
  await titleInput.fill('Updated Title');

  const saveButton = page.locator('button', { hasText: /save/i });
  await saveButton.click();

  // Should show error toast
  const errorToast = page.locator('[role="alert"]', {
    hasText: /error|failed/i,
  });
  await expect(errorToast).toBeVisible({ timeout: 2000 });
});
