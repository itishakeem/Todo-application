/**
 * E2E Tests for Task Filtering & Navigation
 * T138-T144: Task filtering functionality testing
 * Spec: User Story 6 - Filter tasks by status
 */

import { test, expect } from '@playwright/test';

// T138: All filter shows all tasks (default)
test('T138: All filter shows all tasks by default', async ({ page }) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: '1',
            title: 'Pending Task',
            description: 'Pending',
            status: 'pending',
            created_at: '2026-01-02T22:00:00Z',
            completed_at: null,
            updated_at: null,
          },
          {
            id: '2',
            title: 'Completed Task',
            description: 'Completed',
            status: 'completed',
            created_at: '2026-01-02T21:00:00Z',
            completed_at: '2026-01-03T10:00:00Z',
            updated_at: null,
          },
        ],
      }),
    });
  });

  await page.goto('/');

  // Both tasks should be visible
  await expect(page.locator('text=Pending Task')).toBeVisible();
  await expect(page.locator('text=Completed Task')).toBeVisible();

  // All tab should be active
  const allTab = page.locator('button', { hasText: /^all$/i });
  await expect(allTab).toHaveClass(/text-blue-600/);
});

// T139: Active filter shows only pending tasks
test('T139: Active filter shows only pending tasks', async ({ page }) => {
  await page.route('**/api/tasks*', async (route) => {
    const filter = route.request().url().includes('filter=active')
      ? 'active'
      : 'all';

    if (filter === 'active') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: '1',
              title: 'Pending Task',
              description: 'Pending',
              status: 'pending',
              created_at: '2026-01-02T22:00:00Z',
              completed_at: null,
              updated_at: null,
            },
          ],
        }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: '1',
              title: 'Pending Task',
              description: 'Pending',
              status: 'pending',
              created_at: '2026-01-02T22:00:00Z',
              completed_at: null,
              updated_at: null,
            },
            {
              id: '2',
              title: 'Completed Task',
              description: 'Completed',
              status: 'completed',
              created_at: '2026-01-02T21:00:00Z',
              completed_at: '2026-01-03T10:00:00Z',
              updated_at: null,
            },
          ],
        }),
      });
    }
  });

  await page.goto('/');

  // Click Active filter
  const activeTab = page.locator('button', { hasText: /^active$/i });
  await activeTab.click();

  // Wait for filter to apply
  await page.waitForTimeout(500);

  // Only pending task should be visible
  await expect(page.locator('text=Pending Task')).toBeVisible();
  await expect(page.locator('text=Completed Task')).not.toBeVisible();
});

// T140: Completed filter shows only completed tasks
test('T140: Completed filter shows only completed tasks', async ({ page }) => {
  await page.route('**/api/tasks*', async (route) => {
    const filter = route.request().url().includes('filter=completed')
      ? 'completed'
      : 'all';

    if (filter === 'completed') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: '2',
              title: 'Completed Task',
              description: 'Completed',
              status: 'completed',
              created_at: '2026-01-02T21:00:00Z',
              completed_at: '2026-01-03T10:00:00Z',
              updated_at: null,
            },
          ],
        }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: '1',
              title: 'Pending Task',
              description: 'Pending',
              status: 'pending',
              created_at: '2026-01-02T22:00:00Z',
              completed_at: null,
              updated_at: null,
            },
            {
              id: '2',
              title: 'Completed Task',
              description: 'Completed',
              status: 'completed',
              created_at: '2026-01-02T21:00:00Z',
              completed_at: '2026-01-03T10:00:00Z',
              updated_at: null,
            },
          ],
        }),
      });
    }
  });

  await page.goto('/');

  // Click Completed filter
  const completedTab = page.locator('button', { hasText: /^completed$/i });
  await completedTab.click();

  // Wait for filter to apply
  await page.waitForTimeout(500);

  // Only completed task should be visible
  await expect(page.locator('text=Completed Task')).toBeVisible();
  await expect(page.locator('text=Pending Task')).not.toBeVisible();
});

// T141: Active tab has blue underline indicator
test('T141: active tab displays blue underline indicator', async ({ page }) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ tasks: [] }),
    });
  });

  await page.goto('/');

  const activeTab = page.locator('button', { hasText: /^active$/i });
  await activeTab.click();

  // Active tab should have blue text and border
  await expect(activeTab).toHaveClass(/text-blue-600/);
  await expect(activeTab).toHaveClass(/border-blue-600/);
});

// T142: Filter resets to All on page reload
test('T142: filter resets to All after page reload', async ({ page }) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ tasks: [] }),
    });
  });

  await page.goto('/');

  // Click Completed filter
  const completedTab = page.locator('button', { hasText: /^completed$/i });
  await completedTab.click();

  await expect(completedTab).toHaveClass(/text-blue-600/);

  // Reload page
  await page.reload();

  // All tab should be active again
  const allTab = page.locator('button', { hasText: /^all$/i });
  await expect(allTab).toHaveClass(/text-blue-600/);
});

// T143: Empty state shows when filtered list empty
test('T143: empty state displays when filtered list is empty', async ({
  page,
}) => {
  await page.route('**/api/tasks*', async (route) => {
    const filter = route.request().url().includes('filter=completed')
      ? 'completed'
      : 'all';

    if (filter === 'completed') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ tasks: [] }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: '1',
              title: 'Pending Task',
              description: 'Pending',
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

  await page.goto('/');

  // Pending task visible initially
  await expect(page.locator('text=Pending Task')).toBeVisible();

  // Click Completed filter
  const completedTab = page.locator('button', { hasText: /^completed$/i });
  await completedTab.click();

  // Wait for filter
  await page.waitForTimeout(500);

  // Empty state should show
  await expect(page.locator('text=/no tasks|empty/i')).toBeVisible();
});

// T144: Filter tabs keyboard accessible (Tab + Enter)
test('T144: filter tabs are keyboard accessible', async ({ page }) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ tasks: [] }),
    });
  });

  await page.goto('/');

  // Tab to focus on filter tabs
  await page.keyboard.press('Tab'); // Skip to first focusable element
  await page.keyboard.press('Tab'); // Move through page
  await page.keyboard.press('Tab'); // Should reach filter tabs

  // Press Enter on active tab
  await page.keyboard.press('Enter');

  // Active tab should have focus indicator
  const focusedElement = await page.locator(':focus').textContent();
  expect(focusedElement?.toLowerCase()).toMatch(/all|active|completed/);
});
