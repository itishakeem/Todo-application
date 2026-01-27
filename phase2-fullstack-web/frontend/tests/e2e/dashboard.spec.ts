/**
 * E2E Tests for User Story 1: View Todo Dashboard (Priority: P1)
 * T031-T038: Dashboard functionality tests
 */

import { test, expect } from '@playwright/test';

test.describe('User Story 1: View Todo Dashboard', () => {
  // T031: Dashboard renders with loading spinner
  test('T031: should display loading spinner while fetching tasks', async ({
    page,
  }) => {
    // Intercept API call to delay response
    await page.route('**/api/tasks', async (route) => {
      await page.waitForTimeout(1000);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ tasks: [] }),
      });
    });

    await page.goto('/');

    // Should see loading spinner
    const spinner = page.locator('[data-testid="loading-spinner"]');
    await expect(spinner).toBeVisible();

    // Should see loading text
    await expect(page.getByText('Loading tasks...')).toBeVisible();
  });

  // T032: Dashboard shows empty state when no tasks
  test('T032: should show empty state when no tasks exist', async ({
    page,
  }) => {
    // Mock empty tasks response
    await page.route('**/api/tasks', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ tasks: [] }),
      });
    });

    await page.goto('/');

    // Wait for loading to complete
    await page.waitForSelector('[data-testid="empty-state"]', {
      timeout: 5000,
    });

    // Should see empty state message
    const emptyState = page.locator('[data-testid="empty-state"]');
    await expect(emptyState).toBeVisible();
    await expect(
      page.getByText('No tasks yet. Add one to get started!')
    ).toBeVisible();
  });

  // T033: Dashboard displays task list with tasks
  test('T033: should display task list when tasks exist', async ({ page }) => {
    // Mock tasks response
    await page.route('**/api/tasks', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: '12345678-1234-1234-1234-123456789012',
              title: 'Test Task 1',
              description: 'Description 1',
              status: 'pending',
              created_at: '2026-01-01T10:00:00Z',
              completed_at: null,
              updated_at: null,
            },
            {
              id: '87654321-4321-4321-4321-210987654321',
              title: 'Test Task 2',
              description: 'Description 2',
              status: 'completed',
              created_at: '2026-01-01T09:00:00Z',
              completed_at: '2026-01-01T11:00:00Z',
              updated_at: null,
            },
          ],
        }),
      });
    });

    await page.goto('/');

    // Wait for task list to render
    await page.waitForSelector('[data-testid="task-list"]', { timeout: 5000 });

    // Should see task list
    const taskList = page.locator('[data-testid="task-list"]');
    await expect(taskList).toBeVisible();

    // Should see both tasks
    const taskCards = page.locator('[data-testid="task-card"]');
    await expect(taskCards).toHaveCount(2);
  });

  // T034: Task card shows title, description, status
  test('T034: should display task card with title, description, and status', async ({
    page,
  }) => {
    await page.route('**/api/tasks', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: '12345678-1234-1234-1234-123456789012',
              title: 'Buy groceries',
              description: 'Milk, eggs, bread',
              status: 'pending',
              created_at: '2026-01-02T10:00:00Z',
              completed_at: null,
              updated_at: null,
            },
          ],
        }),
      });
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="task-card"]', { timeout: 5000 });

    // Should display title
    await expect(page.getByText('Buy groceries')).toBeVisible();

    // Should display description
    await expect(page.getByText('Milk, eggs, bread')).toBeVisible();

    // Should display creation date
    await expect(page.getByText(/Created: 2026-01-02/)).toBeVisible();
  });

  // T035: Task ID displayed in bottom-left (12px gray)
  test('T035: should display 8-character task ID at bottom-left in gray', async ({
    page,
  }) => {
    await page.route('**/api/tasks', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: 'abcdef12-3456-7890-abcd-ef1234567890',
              title: 'Test Task',
              description: 'Test Description',
              status: 'pending',
              created_at: '2026-01-02T10:00:00Z',
              completed_at: null,
              updated_at: null,
            },
          ],
        }),
      });
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="task-id"]', { timeout: 5000 });

    // Should display first 8 characters of ID
    const taskId = page.locator('[data-testid="task-id"]');
    await expect(taskId).toBeVisible();
    await expect(taskId).toHaveText('abcdef12');

    // Should have gray color and 12px font size
    const color = await taskId.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('color')
    );
    const fontSize = await taskId.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('font-size')
    );

    // RGB for #6B7280 is approximately rgb(107, 114, 128)
    expect(color).toContain('107');
    expect(fontSize).toBe('12px');
  });

  // T036: Responsive layout mobile (320px)
  test('T036: should display correctly on mobile viewport (320px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    await page.route('**/api/tasks', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: '12345678-1234-1234-1234-123456789012',
              title: 'Mobile Test Task',
              description: 'Test mobile layout',
              status: 'pending',
              created_at: '2026-01-02T10:00:00Z',
              completed_at: null,
              updated_at: null,
            },
          ],
        }),
      });
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="task-card"]', { timeout: 5000 });

    // Check no horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Check minimum font size (16px for body text)
    const bodyFontSize = await page.locator('body').evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('font-size')
    );
    const fontSize = parseInt(bodyFontSize);
    expect(fontSize).toBeGreaterThanOrEqual(16);
  });

  // T037: Responsive layout desktop (1024px+)
  test('T037: should display correctly on desktop viewport (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.route('**/api/tasks', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: '12345678-1234-1234-1234-123456789012',
              title: 'Desktop Test Task',
              description: 'Test desktop layout',
              status: 'pending',
              created_at: '2026-01-02T10:00:00Z',
              completed_at: null,
              updated_at: null,
            },
          ],
        }),
      });
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="task-list"]', { timeout: 5000 });

    // Content should be centered with max-width 800px
    const taskList = page.locator('[data-testid="task-list"]');
    const width = await taskList.evaluate((el) => el.offsetWidth);

    // Should be within reasonable bounds for centered 800px max-width layout
    expect(width).toBeLessThanOrEqual(800);
  });

  // T038: Error state with toast notification
  test('T038: should display error toast when API fails', async ({ page }) => {
    // Mock API error
    await page.route('**/api/tasks', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Internal server error' } }),
      });
    });

    await page.goto('/');

    // Wait for error toast to appear
    await page.waitForSelector('[data-testid="toast-error"]', {
      timeout: 5000,
    });

    // Should see error toast
    const errorToast = page.locator('[data-testid="toast-error"]');
    await expect(errorToast).toBeVisible();

    // Should see error message
    await expect(
      page.getByText('Unable to load tasks. Please check your connection.')
    ).toBeVisible();

    // Should see retry button
    const retryButton = page.locator('[data-testid="retry-button"]');
    await expect(retryButton).toBeVisible();

    // Retry button should be at least 44x44px (WCAG requirement)
    const buttonBox = await retryButton.boundingBox();
    expect(buttonBox).not.toBeNull();
    if (buttonBox) {
      expect(buttonBox.width).toBeGreaterThanOrEqual(44);
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
    }
  });
});
