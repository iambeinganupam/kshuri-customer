import { test, expect } from '@playwright/test';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('R1 discovery surface — smoke', () => {
  test('home page loads with navbar and brand mark', async ({ page }) => {
    await page.goto('/');
    // Allow either landing variant to load — the brand name is the stable anchor.
    await expect(page.getByText(/kshuri/i).first()).toBeVisible();
  });

  test('CityPicker chip is mounted in the desktop navbar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    // The CityPicker renders a "Pick a city" or "<City>" trigger button with a MapPin icon.
    await expect(page.getByRole('button', { name: /pick a city|mumbai|delhi|bengaluru/i })).toBeVisible();
  });

  test('city landing page loads and shows breadcrumb + city name', async ({ page }) => {
    await page.goto('/discover/mumbai');
    await expect(page.getByRole('heading', { name: /mumbai/i, level: 1 })).toBeVisible();
    await expect(page.getByText(/discover/i).first()).toBeVisible();
  });
});

test.describe('R1 discovery surface — accessibility (WCAG A/AA)', () => {
  test('home page has no critical axe violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const critical = results.violations.filter((v) => v.impact === 'critical');
    expect(critical).toEqual([]);
  });

  test('/discover/mumbai has no critical axe violations', async ({ page }) => {
    await page.goto('/discover/mumbai');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const critical = results.violations.filter((v) => v.impact === 'critical');
    expect(critical).toEqual([]);
  });
});

test.describe('R1 discovery surface — concurrency', () => {
  test('two browser contexts loading /discover/mumbai both render the city heading', async () => {
    const browser = await chromium.launch();
    try {
      const [ctxA, ctxB] = await Promise.all([browser.newContext(), browser.newContext()]);
      try {
        const [pageA, pageB] = await Promise.all([ctxA.newPage(), ctxB.newPage()]);
        await Promise.all([
          pageA.goto('/discover/mumbai'),
          pageB.goto('/discover/mumbai'),
        ]);
        await Promise.all([
          expect(pageA.getByRole('heading', { name: /mumbai/i, level: 1 })).toBeVisible(),
          expect(pageB.getByRole('heading', { name: /mumbai/i, level: 1 })).toBeVisible(),
        ]);
      } finally {
        await Promise.all([ctxA.close(), ctxB.close()]);
      }
    } finally {
      await browser.close();
    }
  });
});
