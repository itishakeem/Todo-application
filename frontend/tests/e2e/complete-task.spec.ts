/**
 * E2E Tests for Task Completion Toggle
 * T084-T090: Task completion functionality testing
 * Spec: User Story 3 - Toggle task completion status
 */

import { test, expect } from '@playwright/test';

// T084: Click checkbox completes task with strikethrough
test('T084: clicking checkbox marks task as complete with strikethrough', async ({
  page,
}) => {
  // Mock API responses
  let taskStatus = 'pending';

  await page.route('**/api/tasks*', async (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: 'test-task-1',
              title: 'Complete Me',
              description: 'Test task',
              status: taskStatus,
              created_at: '2026-01-02T22:00:00Z',
              completed_at: taskStatus === 'completed' ? '2026-01-03T10:00:00Z' : null,
              updated_at: null,
            },
          ],
        }),
      });
    }
  });

  await page.route('**/api/tasks/*/complete', async (route) => {
    if (route.request().method() === 'PATCH') {
      taskStatus = taskStatus === 'pending' ? 'completed' : 'pending';
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-task-1',
          title: 'Complete Me',
          description: 'Test task',
          status: taskStatus,
          created_at: '2026-01-02T22:00:00Z',
          completed_at: taskStatus === 'completed' ? '2026-01-03T10:00:00Z' : null,
          updated_at: '2026-01-03T10:00:00Z',
        }),
      });
    }
  });

  await page.goto('/');

  // Wait for task to load
  const taskTitle = page.locator('[data-testid="task-title"]', {
    hasText: 'Complete Me',
  });
  await expect(taskTitle).toBeVisible();

  // Initially no strikethrough
  await expect(taskTitle).not.toHaveClass(/line-through/);

  // Click checkbox
  const checkbox = page.locator('[data-testid="task-checkbox"]').first();
  await checkbox.click();

  // Wait for optimistic update
  await page.waitForTimeout(400);

  // Should have strikethrough
  await expect(taskTitle).toHaveClass(/line-through/);
});

// T085: Completed task shows green checkmark icon
test('T085: completed task displays green checkmark icon', async ({ page }) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: 'test-task-1',
            title: 'Completed Task',
            description: 'Already done',
            status: 'completed',
            created_at: '2026-01-02T22:00:00Z',
            completed_at: '2026-01-03T10:00:00Z',
            updated_at: null,
          },
        ],
      }),
    });
  });

  await page.goto('/');

  await expect(
    page.locator('[data-testid="task-title"]', { hasText: 'Completed Task' })
  ).toBeVisible();

  // Check for green background on checkbox
  const checkbox = page.locator('[data-testid="task-checkbox"] > div').first();
  const backgroundColor = await checkbox.evaluate(
    (el) => window.getComputedStyle(el).backgroundColor
  );

  // Green-500 is rgb(34, 197, 94)
  expect(backgroundColor).toContain('rgb(34, 197, 94)');

  // Check for checkmark SVG
  const checkmark = page.locator('[data-testid="task-checkbox"] svg').first();
  await expect(checkmark).toBeVisible();
});

// T086: Click checkbox again uncompletes task
test('T086: clicking checkbox again marks task as incomplete', async ({
  page,
}) => {
  let taskStatus = 'completed';

  await page.route('**/api/tasks*', async (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: 'test-task-1',
              title: 'Toggle Me',
              description: 'Test toggle',
              status: taskStatus,
              created_at: '2026-01-02T22:00:00Z',
              completed_at: taskStatus === 'completed' ? '2026-01-03T10:00:00Z' : null,
              updated_at: null,
            },
          ],
        }),
      });
    }
  });

  await page.route('**/api/tasks/*/complete', async (route) => {
    if (route.request().method() === 'PATCH') {
      taskStatus = taskStatus === 'pending' ? 'completed' : 'pending';
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-task-1',
          title: 'Toggle Me',
          description: 'Test toggle',
          status: taskStatus,
          created_at: '2026-01-02T22:00:00Z',
          completed_at: taskStatus === 'completed' ? '2026-01-03T10:00:00Z' : null,
          updated_at: '2026-01-03T10:00:00Z',
        }),
      });
    }
  });

  await page.goto('/');

  const taskTitle = page.locator('[data-testid="task-title"]', {
    hasText: 'Toggle Me',
  });
  await expect(taskTitle).toBeVisible();

  // Initially has strikethrough (completed)
  await expect(taskTitle).toHaveClass(/line-through/);

  // Click checkbox to uncomplete
  const checkbox = page.locator('[data-testid="task-checkbox"]').first();
  await checkbox.click();

  // Wait for update
  await page.waitForTimeout(400);

  // Should no longer have strikethrough
  await expect(taskTitle).not.toHaveClass(/line-through/);
});

// T087: Optimistic UI updates within 300ms
test('T087: optimistic UI update occurs within 300ms', async ({ page }) => {
  await page.route('**/api/tasks*', async (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: 'test-task-1',
              title: 'Optimistic Test',
              description: 'Test optimistic update',
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

  await page.route('**/api/tasks/*/complete', async (route) => {
    // Delay API response by 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-task-1',
        title: 'Optimistic Test',
        description: 'Test optimistic update',
        status: 'completed',
        created_at: '2026-01-02T22:00:00Z',
        completed_at: '2026-01-03T10:00:00Z',
        updated_at: '2026-01-03T10:00:00Z',
      }),
    });
  });

  await page.goto('/');

  const taskTitle = page.locator('[data-testid="task-title"]', {
    hasText: 'Optimistic Test',
  });
  await expect(taskTitle).toBeVisible();

  const checkbox = page.locator('[data-testid="task-checkbox"]').first();

  const startTime = Date.now();
  await checkbox.click();

  // Wait for strikethrough to appear (optimistic update)
  await expect(taskTitle).toHaveClass(/line-through/, { timeout: 500 });

  const endTime = Date.now();
  const updateTime = endTime - startTime;

  // Should update within 300ms (optimistic)
  expect(updateTime).toBeLessThan(300);
});

// T088: Debouncing prevents double-click issues
test('T088: debouncing prevents duplicate API calls from double-click', async ({
  page,
}) => {
  let apiCallCount = 0;

  await page.route('**/api/tasks*', async (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: 'test-task-1',
              title: 'Debounce Test',
              description: 'Test debouncing',
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

  await page.route('**/api/tasks/*/complete', async (route) => {
    apiCallCount++;
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-task-1',
        title: 'Debounce Test',
        description: 'Test debouncing',
        status: 'completed',
        created_at: '2026-01-02T22:00:00Z',
        completed_at: '2026-01-03T10:00:00Z',
        updated_at: '2026-01-03T10:00:00Z',
      }),
    });
  });

  await page.goto('/');

  await expect(
    page.locator('[data-testid="task-title"]', { hasText: 'Debounce Test' })
  ).toBeVisible();

  const checkbox = page.locator('[data-testid="task-checkbox"]').first();

  // Double-click rapidly
  await checkbox.click();
  await checkbox.click();

  // Wait for debounce period (300ms)
  await page.waitForTimeout(500);

  // Should only call API once (debounced)
  expect(apiCallCount).toBeLessThanOrEqual(1);
});

// T089: Keyboard space key toggles completion
test('T089: pressing Space key on checkbox toggles completion', async ({
  page,
}) => {
  let taskStatus = 'pending';

  await page.route('**/api/tasks*', async (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: 'test-task-1',
              title: 'Keyboard Test',
              description: 'Test keyboard',
              status: taskStatus,
              created_at: '2026-01-02T22:00:00Z',
              completed_at: null,
              updated_at: null,
            },
          ],
        }),
      });
    }
  });

  await page.route('**/api/tasks/*/complete', async (route) => {
    taskStatus = taskStatus === 'pending' ? 'completed' : 'pending';
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-task-1',
        title: 'Keyboard Test',
        description: 'Test keyboard',
        status: taskStatus,
        created_at: '2026-01-02T22:00:00Z',
        completed_at: taskStatus === 'completed' ? '2026-01-03T10:00:00Z' : null,
        updated_at: '2026-01-03T10:00:00Z',
      }),
    });
  });

  await page.goto('/');

  const taskTitle = page.locator('[data-testid="task-title"]', {
    hasText: 'Keyboard Test',
  });
  await expect(taskTitle).toBeVisible();

  const checkbox = page.locator('[data-testid="task-checkbox"]').first();

  // Focus checkbox and press Space
  await checkbox.focus();
  await page.keyboard.press('Space');

  // Wait for update
  await page.waitForTimeout(400);

  // Should have strikethrough
  await expect(taskTitle).toHaveClass(/line-through/);
});

// T090: API error reverts optimistic update
test('T090: API error reverts optimistic update and shows toast', async ({
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
              title: 'Error Test',
              description: 'Test error handling',
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

  await page.route('**/api/tasks/*/complete', async (route) => {
    // Return error
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Server error' }),
    });
  });

  await page.goto('/');

  const taskTitle = page.locator('[data-testid="task-title"]', {
    hasText: 'Error Test',
  });
  await expect(taskTitle).toBeVisible();

  // Initially no strikethrough
  await expect(taskTitle).not.toHaveClass(/line-through/);

  const checkbox = page.locator('[data-testid="task-checkbox"]').first();
  await checkbox.click();

  // Wait for API error
  await page.waitForTimeout(1000);

  // Should NOT have strikethrough (reverted)
  await expect(taskTitle).not.toHaveClass(/line-through/);

  // Should show error toast
  const errorToast = page.locator('[role="alert"]', {
    hasText: /error|failed/i,
  });
  await expect(errorToast).toBeVisible({ timeout: 2000 });
});
