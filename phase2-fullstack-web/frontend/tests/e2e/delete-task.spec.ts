/**
 * E2E Tests for Task Deletion with Confirmation Modal
 * T121-T127: Task deletion functionality testing
 * Spec: User Story 5 - Delete tasks with confirmation
 */

import { test, expect } from '@playwright/test';

// T121: Click Delete button opens modal
test('T121: clicking Delete button opens confirmation modal', async ({
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
            title: 'Task to Delete',
            description: 'This will be deleted',
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
    page.locator('[data-testid="task-title"]', { hasText: 'Task to Delete' })
  ).toBeVisible();

  // Click Delete button
  const deleteButton = page.locator('[data-testid="delete-button"]').first();
  await deleteButton.click();

  // Modal should appear
  const modal = page.locator('[data-testid="delete-modal"]');
  await expect(modal).toBeVisible();
});

// T122: Modal shows task title and confirmation message
test('T122: modal displays task title and confirmation message', async ({
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
            title: 'Important Task',
            description: 'Very important',
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

  const deleteButton = page.locator('[data-testid="delete-button"]').first();
  await deleteButton.click();

  const modal = page.locator('[data-testid="delete-modal"]');
  await expect(modal).toBeVisible();

  // Should show task title
  await expect(modal.locator('text=Important Task')).toBeVisible();

  // Should show confirmation message
  await expect(
    modal.locator('text=/delete.*permanently|are you sure/i')
  ).toBeVisible();
});

// T123: Confirm button deletes task and closes modal
test('T123: clicking Confirm deletes task and closes modal', async ({
  page,
}) => {
  let taskDeleted = false;

  await page.route('**/api/tasks*', async (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: taskDeleted
            ? []
            : [
                {
                  id: 'test-task-1',
                  title: 'Task to Delete',
                  description: 'Will be deleted',
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
    if (route.request().method() === 'DELETE') {
      taskDeleted = true;
      route.fulfill({ status: 204 });
    }
  });

  await page.goto('/');

  // Click Delete
  const deleteButton = page.locator('[data-testid="delete-button"]').first();
  await deleteButton.click();

  // Confirm deletion
  const confirmButton = page.locator('button', { hasText: /confirm|delete/i });
  await confirmButton.click();

  // Modal should close
  const modal = page.locator('[data-testid="delete-modal"]');
  await expect(modal).not.toBeVisible({ timeout: 2000 });

  // Task should disappear
  await expect(
    page.locator('[data-testid="task-title"]', { hasText: 'Task to Delete' })
  ).not.toBeVisible({ timeout: 3000 });
});

// T124: Cancel button closes modal without deleting
test('T124: clicking Cancel closes modal without deleting task', async ({
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
            title: 'Task to Keep',
            description: 'Should not be deleted',
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

  // Click Delete
  const deleteButton = page.locator('[data-testid="delete-button"]').first();
  await deleteButton.click();

  const modal = page.locator('[data-testid="delete-modal"]');
  await expect(modal).toBeVisible();

  // Click Cancel
  const cancelButton = page.locator('button', { hasText: /cancel/i });
  await cancelButton.click();

  // Modal should close
  await expect(modal).not.toBeVisible();

  // Task should still be visible
  await expect(
    page.locator('[data-testid="task-title"]', { hasText: 'Task to Keep' })
  ).toBeVisible();
});

// T125: Click outside modal closes without deleting
test('T125: clicking outside modal closes it without deleting', async ({
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
            title: 'Task to Keep',
            description: 'Should not be deleted',
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

  // Click Delete
  const deleteButton = page.locator('[data-testid="delete-button"]').first();
  await deleteButton.click();

  const modal = page.locator('[data-testid="delete-modal"]');
  await expect(modal).toBeVisible();

  // Click on overlay (outside modal)
  const overlay = page.locator('[data-testid="modal-overlay"]');
  await overlay.click({ position: { x: 10, y: 10 } });

  // Modal should close
  await expect(modal).not.toBeVisible();

  // Task should still be visible
  await expect(
    page.locator('[data-testid="task-title"]', { hasText: 'Task to Keep' })
  ).toBeVisible();
});

// T126: Escape key closes modal without deleting
test('T126: pressing Escape key closes modal without deleting', async ({
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
            title: 'Task to Keep',
            description: 'Should not be deleted',
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

  // Click Delete
  const deleteButton = page.locator('[data-testid="delete-button"]').first();
  await deleteButton.click();

  const modal = page.locator('[data-testid="delete-modal"]');
  await expect(modal).toBeVisible();

  // Press Escape
  await page.keyboard.press('Escape');

  // Modal should close
  await expect(modal).not.toBeVisible();

  // Task should still be visible
  await expect(
    page.locator('[data-testid="task-title"]', { hasText: 'Task to Keep' })
  ).toBeVisible();
});

// T127: API error shows toast notification
test('T127: API error displays error toast notification', async ({ page }) => {
  await page.route('**/api/tasks*', async (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: 'test-task-1',
              title: 'Task with Error',
              description: 'Will fail to delete',
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
    if (route.request().method() === 'DELETE') {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Server error' }),
      });
    }
  });

  await page.goto('/');

  // Click Delete
  const deleteButton = page.locator('[data-testid="delete-button"]').first();
  await deleteButton.click();

  // Confirm deletion
  const confirmButton = page.locator('button', { hasText: /confirm|delete/i });
  await confirmButton.click();

  // Should show error toast
  const errorToast = page.locator('[role="alert"]', {
    hasText: /error|failed/i,
  });
  await expect(errorToast).toBeVisible({ timeout: 2000 });

  // Task should still be visible (not deleted)
  await expect(
    page.locator('[data-testid="task-title"]', { hasText: 'Task with Error' })
  ).toBeVisible();
});
