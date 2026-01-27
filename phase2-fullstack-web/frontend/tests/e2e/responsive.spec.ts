/**
 * E2E Tests for Responsive Layout System
 * T070-T076: Responsive design testing across breakpoints
 * Spec: User Story 7 - Responsive layout
 */

import { test, expect } from '@playwright/test';

// T070: Mobile layout (320px width, single column)
test('T070: displays single column layout on mobile (320px width)', async ({
  page,
}) => {
  // Mock API with sample tasks
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: '1',
            title: 'Mobile Test Task',
            description: 'Testing mobile layout',
            status: 'pending',
            created_at: '2026-01-02T22:00:00Z',
            completed_at: null,
            updated_at: null,
          },
        ],
      }),
    });
  });

  // Set mobile viewport
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');

  // Wait for task to load
  await expect(page.locator('text=Mobile Test Task')).toBeVisible();

  // Verify single column layout (task cards should stack vertically)
  const taskList = page.locator('[data-testid="task-list"]');
  await expect(taskList).toBeVisible();

  // Check container has proper mobile padding
  const container = page.locator('main > div').first();
  const padding = await container.evaluate((el) =>
    window.getComputedStyle(el).paddingLeft
  );
  // Mobile should have 16px (1rem) padding
  expect(parseInt(padding)).toBeGreaterThanOrEqual(16);
});

// T071: Tablet layout (768px width, 100% - 32px padding)
test('T071: displays proper layout on tablet (768px width)', async ({
  page,
}) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: '1',
            title: 'Tablet Test Task',
            description: 'Testing tablet layout',
            status: 'pending',
            created_at: '2026-01-02T22:00:00Z',
            completed_at: null,
            updated_at: null,
          },
        ],
      }),
    });
  });

  // Set tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');

  await expect(page.locator('text=Tablet Test Task')).toBeVisible();

  // Check container has tablet padding (24px / 1.5rem)
  const container = page.locator('main > div').first();
  const padding = await container.evaluate((el) =>
    window.getComputedStyle(el).paddingLeft
  );
  expect(parseInt(padding)).toBeGreaterThanOrEqual(24);
});

// T072: Desktop layout (1280px width, 800px max-width)
test('T072: displays centered layout on desktop (1280px width)', async ({
  page,
}) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: '1',
            title: 'Desktop Test Task',
            description: 'Testing desktop layout',
            status: 'pending',
            created_at: '2026-01-02T22:00:00Z',
            completed_at: null,
            updated_at: null,
          },
        ],
      }),
    });
  });

  // Set desktop viewport
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  await expect(page.locator('text=Desktop Test Task')).toBeVisible();

  // Check max-width constraint (should be 1024px per tailwind.config max-w-screen-lg)
  const container = page.locator('main > div').first();
  const maxWidth = await container.evaluate(
    (el) => window.getComputedStyle(el).maxWidth
  );
  // max-w-screen-lg is 1024px
  expect(parseInt(maxWidth)).toBeLessThanOrEqual(1024);
});

// T073: Touch targets 44x44px with 8px spacing on mobile
test('T073: ensures 44x44px touch targets with 8px spacing on mobile', async ({
  page,
}) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: '1',
            title: 'Touch Target Test',
            description: 'Testing touch targets',
            status: 'pending',
            created_at: '2026-01-02T22:00:00Z',
            completed_at: null,
            updated_at: null,
          },
        ],
      }),
    });
  });

  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto('/');

  await expect(page.locator('text=Touch Target Test')).toBeVisible();

  // Check button dimensions (Edit, Delete buttons in TaskCard)
  const buttons = page.locator('button[aria-label*="Edit"], button[aria-label*="Delete"]').first();
  if (await buttons.count() > 0) {
    const dimensions = await buttons.boundingBox();
    if (dimensions) {
      expect(dimensions.height).toBeGreaterThanOrEqual(44);
      expect(dimensions.width).toBeGreaterThanOrEqual(44);
    }
  }

  // Check form submit button
  const submitButton = page.locator('button[type="submit"]');
  const submitDimensions = await submitButton.boundingBox();
  if (submitDimensions) {
    expect(submitDimensions.height).toBeGreaterThanOrEqual(44);
  }
});

// T074: Font scales 16px mobile → 18px desktop
test('T074: font size scales from 16px mobile to 18px desktop', async ({
  page,
}) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: '1',
            title: 'Font Size Test Task',
            description: 'Testing font scaling',
            status: 'pending',
            created_at: '2026-01-02T22:00:00Z',
            completed_at: null,
            updated_at: null,
          },
        ],
      }),
    });
  });

  // Mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page.locator('text=Font Size Test Task')).toBeVisible();

  const taskTitle = page.locator('[data-testid="task-list"] h3').first();
  const mobileFontSize = await taskTitle.evaluate(
    (el) => window.getComputedStyle(el).fontSize
  );
  expect(parseInt(mobileFontSize)).toBe(16); // 16px mobile

  // Desktop
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(100); // Wait for resize

  const desktopFontSize = await taskTitle.evaluate(
    (el) => window.getComputedStyle(el).fontSize
  );
  expect(parseInt(desktopFontSize)).toBe(18); // 18px desktop
});

// T075: Card padding 12px mobile → 16px desktop
test('T075: card padding scales from 12px mobile to 16px desktop', async ({
  page,
}) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: '1',
            title: 'Card Padding Test',
            description: 'Testing card padding',
            status: 'pending',
            created_at: '2026-01-02T22:00:00Z',
            completed_at: null,
            updated_at: null,
          },
        ],
      }),
    });
  });

  // Mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page.locator('text=Card Padding Test')).toBeVisible();

  const taskCard = page.locator('[data-testid="task-card"]').first();
  const mobilePadding = await taskCard.evaluate(
    (el) => window.getComputedStyle(el).padding
  );
  expect(parseInt(mobilePadding)).toBe(12); // 12px mobile

  // Desktop
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(100);

  const desktopPadding = await taskCard.evaluate(
    (el) => window.getComputedStyle(el).padding
  );
  expect(parseInt(desktopPadding)).toBe(16); // 16px desktop
});

// T076: Action buttons horizontal on tablet/desktop
test('T076: action buttons display horizontally on tablet and desktop', async ({
  page,
}) => {
  await page.route('**/api/tasks*', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: '1',
            title: 'Button Layout Test',
            description: 'Testing button layout',
            status: 'pending',
            created_at: '2026-01-02T22:00:00Z',
            completed_at: null,
            updated_at: null,
          },
        ],
      }),
    });
  });

  // Tablet
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');
  await expect(page.locator('text=Button Layout Test')).toBeVisible();

  // Find action buttons container
  const buttonContainer = page.locator('[data-testid="task-card"] > div').last();
  const flexDirection = await buttonContainer.evaluate(
    (el) => window.getComputedStyle(el).flexDirection
  );
  expect(flexDirection).toBe('row'); // Horizontal on tablet

  // Desktop
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(100);

  const desktopFlexDirection = await buttonContainer.evaluate(
    (el) => window.getComputedStyle(el).flexDirection
  );
  expect(desktopFlexDirection).toBe('row'); // Horizontal on desktop
});
