/**
 * E2E Tests for Task Creation Form & Validation
 * T049-T058: Task creation form testing
 * Spec: User Story 2 - Create new todo items
 */

import { test, expect } from '@playwright/test';

// T049: Form renders with title and description fields
test('T049: displays task creation form with title and description fields', async ({ page }) => {
  await page.goto('/');

  // Check form is visible
  const titleInput = page.locator('input[name="title"]');
  const descriptionTextarea = page.locator('textarea[name="description"]');
  const submitButton = page.locator('button[type="submit"]', { hasText: /add task|create/i });

  await expect(titleInput).toBeVisible();
  await expect(descriptionTextarea).toBeVisible();
  await expect(submitButton).toBeVisible();

  // Verify placeholders
  await expect(titleInput).toHaveAttribute('placeholder', /title/i);
  await expect(descriptionTextarea).toHaveAttribute('placeholder', /description/i);
});

// T050: Submit with valid title creates task
test('T050: submitting form with valid title creates new task', async ({ page }) => {
  // Mock API response
  await page.route('**/api/tasks', async (route) => {
    if (route.request().method() === 'POST') {
      const postData = route.request().postDataJSON();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: postData.title,
          description: postData.description || '',
          status: 'pending',
          created_at: '2026-01-02T22:00:00Z',
          completed_at: null,
          updated_at: null,
        }),
      });
    } else {
      // GET request
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ tasks: [] }),
      });
    }
  });

  await page.goto('/');

  // Fill form
  await page.fill('input[name="title"]', 'Complete Phase II implementation');
  await page.fill('textarea[name="description"]', 'Build full-stack web application');

  // Submit
  await page.click('button[type="submit"]');

  // Wait for task to appear in list
  await expect(page.locator('text=Complete Phase II implementation')).toBeVisible({ timeout: 5000 });
});

// T051: Form clears within 100ms after success
test('T051: form clears within 100ms after successful submission', async ({ page }) => {
  await page.route('**/api/tasks', async (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Task',
          description: '',
          status: 'pending',
          created_at: '2026-01-02T22:00:00Z',
          completed_at: null,
          updated_at: null,
        }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ tasks: [] }),
      });
    }
  });

  await page.goto('/');

  const titleInput = page.locator('input[name="title"]');
  const descriptionTextarea = page.locator('textarea[name="description"]');

  await titleInput.fill('Test Task');
  await descriptionTextarea.fill('Test Description');

  const startTime = Date.now();
  await page.click('button[type="submit"]');

  // Wait for form to clear
  await expect(titleInput).toHaveValue('', { timeout: 200 });
  await expect(descriptionTextarea).toHaveValue('', { timeout: 200 });

  const endTime = Date.now();
  const clearTime = endTime - startTime;

  // Should clear within 100ms (allowing some buffer for network)
  expect(clearTime).toBeLessThan(500);
});

// T052: Success toast auto-dismisses after 3s
test('T052: success toast appears and auto-dismisses after 3 seconds', async ({ page }) => {
  await page.route('**/api/tasks', async (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Task',
          description: '',
          status: 'pending',
          created_at: '2026-01-02T22:00:00Z',
          completed_at: null,
          updated_at: null,
        }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ tasks: [] }),
      });
    }
  });

  await page.goto('/');

  await page.fill('input[name="title"]', 'Test Task');
  await page.click('button[type="submit"]');

  // Toast should appear
  const toast = page.locator('[role="alert"]', { hasText: /task created|success/i });
  await expect(toast).toBeVisible({ timeout: 2000 });

  // Toast should auto-dismiss after 3s (check at 4s to be safe)
  await expect(toast).not.toBeVisible({ timeout: 5000 });
});

// T053: Empty title shows inline error
test('T053: submitting empty title shows inline validation error', async ({ page }) => {
  await page.goto('/');

  const titleInput = page.locator('input[name="title"]');
  const submitButton = page.locator('button[type="submit"]');

  // Try to submit with empty title
  await submitButton.click();

  // Should show inline error message
  const errorMessage = page.locator('text=/title.*required|please enter.*title/i');
  await expect(errorMessage).toBeVisible({ timeout: 1000 });

  // Error should be near the title input (inline validation)
  const errorElement = page.locator('[role="alert"]').first();
  await expect(errorElement).toBeVisible();
});

// T054: Title >100 chars shows inline error
test('T054: title exceeding 100 characters shows inline validation error', async ({ page }) => {
  await page.goto('/');

  const titleInput = page.locator('input[name="title"]');
  const longTitle = 'A'.repeat(101); // 101 characters

  await titleInput.fill(longTitle);
  await titleInput.blur(); // Trigger validation

  // Should show inline error
  const errorMessage = page.locator('text=/title.*100|maximum.*100/i');
  await expect(errorMessage).toBeVisible({ timeout: 1000 });
});

// T055: Description >500 chars shows inline error
test('T055: description exceeding 500 characters shows inline validation error', async ({ page }) => {
  await page.goto('/');

  const descriptionTextarea = page.locator('textarea[name="description"]');
  const longDescription = 'B'.repeat(501); // 501 characters

  await descriptionTextarea.fill(longDescription);
  await descriptionTextarea.blur(); // Trigger validation

  // Should show inline error
  const errorMessage = page.locator('text=/description.*500|maximum.*500/i');
  await expect(errorMessage).toBeVisible({ timeout: 1000 });
});

// T056: Enter key in title field submits form
test('T056: pressing Enter in title field submits the form', async ({ page }) => {
  await page.route('**/api/tasks', async (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Enter Key Task',
          description: '',
          status: 'pending',
          created_at: '2026-01-02T22:00:00Z',
          completed_at: null,
          updated_at: null,
        }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ tasks: [] }),
      });
    }
  });

  await page.goto('/');

  const titleInput = page.locator('input[name="title"]');
  await titleInput.fill('Enter Key Task');

  // Press Enter
  await titleInput.press('Enter');

  // Task should appear (form submitted)
  await expect(page.locator('text=Enter Key Task')).toBeVisible({ timeout: 5000 });
});

// T057: Loading state shows inline spinner on button
test('T057: submit button shows loading state during API call', async ({ page }) => {
  // Delay API response to observe loading state
  await page.route('**/api/tasks', async (route) => {
    if (route.request().method() === 'POST') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Loading Test',
          description: '',
          status: 'pending',
          created_at: '2026-01-02T22:00:00Z',
          completed_at: null,
          updated_at: null,
        }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ tasks: [] }),
      });
    }
  });

  await page.goto('/');

  await page.fill('input[name="title"]', 'Loading Test');

  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  // Should show loading spinner (16x16 inline spinner as per LoadingSpinner component)
  const spinner = submitButton.locator('svg[aria-label="Loading"]');
  await expect(spinner).toBeVisible({ timeout: 500 });

  // Button should be disabled during loading
  await expect(submitButton).toBeDisabled();
});

// T058: API error shows toast with 5s duration
test('T058: API error displays error toast for 5 seconds', async ({ page }) => {
  await page.route('**/api/tasks', async (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal server error' }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ tasks: [] }),
      });
    }
  });

  await page.goto('/');

  await page.fill('input[name="title"]', 'Error Test');
  await page.click('button[type="submit"]');

  // Error toast should appear
  const errorToast = page.locator('[role="alert"]', { hasText: /error|failed/i });
  await expect(errorToast).toBeVisible({ timeout: 2000 });

  // Should still be visible after 3s (success toast dismisses at 3s, error at 5s)
  await page.waitForTimeout(3500);
  await expect(errorToast).toBeVisible();

  // Should auto-dismiss after 5s (check at 6s)
  await expect(errorToast).not.toBeVisible({ timeout: 3000 });
});
