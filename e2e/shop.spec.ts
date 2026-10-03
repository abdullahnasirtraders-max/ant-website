import { expect, test } from '@playwright/test';
import { trackErrors } from './helpers';

test('server ignores client-sent prices', async ({ request }) => {
  const { products } = await (await request.get('/api/products')).json();
  const p = products[0];
  const q = await (await request.post('/api/cart/quote', { data: { items: [{ productId: p.id, quantity: 2, price: 1 }] } })).json();
  expect(q.lines[0].unitPrice).toBe(p.price);
  expect(q.subtotal).toBe(p.price * 2);
});

test('browse → cart → quantity → remove → COD checkout', async ({ page }, info) => {
  const errors = trackErrors(page);
  await page.goto('/products');
  const cards = page.getByTestId('product-card');
  await expect(cards.first()).toBeVisible();
  await page.screenshot({ path: `e2e/screenshots/${info.project.name}-products.png` });

  await cards.first().getByRole('link').first().click();
  await expect(page).toHaveURL(/\/products\/.+/);
  await expect(page.getByTestId('pd-name')).toBeVisible();
  await page.screenshot({ path: `e2e/screenshots/${info.project.name}-product-detail.png`, fullPage: true });
  await page.getByTestId('add-to-cart').click();
  await expect(page.getByTestId('cart-count')).toHaveText('1');

  await page.goto('/cart'); // full reload proves localStorage persistence
  await expect(page.getByTestId('cart-line')).toHaveCount(1);
  const before = await page.getByTestId('total').innerText();
  await page.getByTestId('qty-inc').click();
  await expect(page.getByTestId('qty-value')).toHaveText('2');
  await expect(page.getByTestId('total')).not.toHaveText(before);
  await page.screenshot({ path: `e2e/screenshots/${info.project.name}-cart.png` });
  await page.getByTestId('remove-line').click();
  await expect(page.getByText('Your cart is empty.')).toBeVisible();

  await page.goto('/products');
  await page.getByTestId('product-card').first().getByRole('button', { name: /Add .* to cart/ }).click();
  await page.goto('/checkout');
  await page.getByTestId('place-order').click(); // empty form → validation errors
  await expect(page.getByTestId('form-error')).toBeVisible();

  await page.locator('#name').fill('Test Customer');
  await page.locator('#phone').fill('0300 1234567');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#address').fill('House 1, Street 2, Block C');
  await page.locator('#city').fill('Lahore');
  await page.locator('#province').selectOption('Punjab');
  await page.getByTestId('pay-cod').check();
  await page.screenshot({ path: `e2e/screenshots/${info.project.name}-checkout.png`, fullPage: true });
  await page.getByTestId('place-order').click();
  await expect(page).toHaveURL(/order-confirmation\/ANT-/);
  await expect(page.getByTestId('order-number')).toContainText('ANT-');
  await expect(page.getByTestId('cart-count')).toHaveText('0');
  expect(errors.filter((e) => !e.includes('400'))).toEqual([]); // the deliberate empty-form submit logs a 400
});
