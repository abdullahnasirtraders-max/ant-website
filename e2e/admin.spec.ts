import { expect, test } from '@playwright/test';
import { ADMIN, trackErrors } from './helpers';

test.describe.configure({ mode: 'serial' });
test.skip(({ isMobile }) => isMobile, 'Admin is exercised on desktop');

async function login(page: import('@playwright/test').Page) {
  await page.goto('/admin');
  await page.getByTestId('admin-email').fill(ADMIN.email);
  await page.getByTestId('admin-password').fill(ADMIN.password);
  await page.getByTestId('admin-submit').click();
  await expect(page.getByTestId('admin-overview')).toBeVisible();
}

test('rejects a wrong password', async ({ page }) => {
  await page.goto('/admin');
  await page.getByTestId('admin-email').fill(ADMIN.email);
  await page.getByTestId('admin-password').fill('definitely-wrong');
  await page.getByTestId('admin-submit').click();
  await expect(page.getByRole('alert')).toContainText('Incorrect email or password');
});

test('admin API is closed without a session', async ({ request }) => {
  expect((await request.get('/api/admin/products')).status()).toBe(401);
});

test('products: create, edit, deactivate, delete', async ({ page }) => {
  const errors = trackErrors(page);
  await login(page);
  await page.screenshot({ path: 'e2e/screenshots/admin-overview.png' });
  await page.getByRole('link', { name: 'Products', exact: true }).click();
  const name = `E2E Filter ${Date.now()}`;
  await page.getByTestId('new-product').click();
  await page.getByTestId('p-name').fill(name);
  await page.getByTestId('p-price').fill('1234');
  await page.getByTestId('p-save').click();
  const row = page.getByTestId('product-row').filter({ hasText: name });
  await expect(row).toContainText('1,234');

  await row.getByTestId('edit-product').click();
  await page.getByTestId('p-price').fill('2345');
  await page.getByTestId('p-save').click();
  await expect(row).toContainText('2,345');

  await row.getByLabel(`${name} active`).uncheck();
  await expect(row.getByLabel(`${name} active`)).not.toBeChecked();
  const publicList = await (await page.request.get('/api/products')).json();
  expect(publicList.products.some((p: { name: string }) => p.name === name)).toBe(false);

  page.once('dialog', (d) => d.accept());
  await row.getByTestId('delete-product').click();
  await expect(row).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('settings + announcements', async ({ page }) => {
  await login(page);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByTestId('delivery-fee-input').fill('450');
  await page.getByTestId('save-settings').click();
  await expect(page.getByText('Settings saved.')).toBeVisible();
  expect((await (await page.request.get('/api/settings')).json()).settings.deliveryFee).toBe(450);

  await page.getByRole('link', { name: 'Announcements', exact: true }).click();
  const text = `E2E notice ${Date.now()}`;
  await page.getByTestId('new-announcement').click();
  await page.getByTestId('a-text').fill(text);
  await page.getByTestId('a-save').click();
  await expect(page.getByTestId('announcement-row').filter({ hasText: text })).toBeVisible();
  await page.goto('/products');
  await expect(page.getByTestId('announcement')).toContainText(text);

  await page.goto('/admin/announcements');
  const row = page.getByTestId('announcement-row').filter({ hasText: text });
  page.once('dialog', (d) => d.accept());
  await row.getByRole('button', { name: 'Delete' }).click();
  await expect(row).toHaveCount(0);
});

test('orders: place via API, update status in admin', async ({ page }) => {
  const { products } = await (await page.request.get('/api/products')).json();
  const res = await page.request.post('/api/orders', {
    data: { customer: { name: 'Status Test', phone: '03001234567', email: 's@example.com', address: 'House 9, Test Street', city: 'Karachi', province: 'Sindh' }, items: [{ productId: products[0].id, quantity: 1 }], paymentMethod: 'cod' },
  });
  expect(res.status()).toBe(201);
  const { order } = await res.json();

  await login(page);
  await page.getByRole('link', { name: 'Orders', exact: true }).click();
  const row = page.getByTestId('order-row').filter({ hasText: order.orderNumber });
  await row.getByRole('button').first().click();
  await row.getByTestId('order-status-select').selectOption('Confirmed');
  await page.reload();
  const again = page.getByTestId('order-row').filter({ hasText: order.orderNumber });
  await again.getByRole('button').first().click();
  await expect(again.getByTestId('order-status-select')).toHaveValue('Confirmed');

  page.once('dialog', (d) => d.accept()); // delete the order
  await again.getByTestId('delete-order').click();
  await expect(page.getByTestId('order-row').filter({ hasText: order.orderNumber })).toHaveCount(0);
});
