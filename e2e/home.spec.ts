import { expect, test } from '@playwright/test';
import { trackErrors } from './helpers';

test('homepage renders every section with no console errors or horizontal overflow', async ({ page }, info) => {
  const errors = trackErrors(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/precision filtration/i);
  await expect(page.getByTestId('selected-grid')).toBeVisible();
  await page.screenshot({ path: `e2e/screenshots/${info.project.name}-home-top.png` });
  await page.screenshot({ path: `e2e/screenshots/${info.project.name}-home-full.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
  expect(errors).toEqual([]);
});

test('filter finder and navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('finder-q').fill('ANT-001');
  await page.getByTestId('finder-submit').click();
  await expect(page).toHaveURL(/\/products\?.*q=ANT-001/);
  await expect(page.getByTestId('product-card').first()).toBeVisible();
  await page.goto('/');
  await page.getByTestId('hero-explore').click();
  await expect(page).toHaveURL(/\/products$/);
});

test('top-level pages load', async ({ page }) => {
  const errors = trackErrors(page);
  for (const [path, heading] of [['/products', 'All products'], ['/about', 'Abdullah Nasir Traders'], ['/contact', 'Contact'], ['/cart', 'Cart']] as const) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  }
  expect(errors).toEqual([]);
});
