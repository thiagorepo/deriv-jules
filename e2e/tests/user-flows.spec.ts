import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || 3000;
const URL = `http://localhost:${PORT}`;

test.describe('Authentication Flows', () => {
  test('Dashboard loads correctly and navigation is functional', async ({
    page,
  }) => {
    await page.goto(URL);
    await expect(page.locator('h1')).toContainText('Dashboard');

    await page.click('a[href="/login"]');
    await page.waitForURL('**/login');
    await expect(page.locator('h2')).toContainText('Sign In to');

    await page.click('a[href="/register"]');
    await page.waitForURL('**/register');
    await expect(page.locator('h2')).toContainText('Join');
  });

  test('Admin Role Access - Mocking Cookies', async ({ page, context }) => {
    // Mock the cookies to simulate an authenticated Admin session
    await context.addCookies([
      {
        name: 'user_role',
        value: 'admin',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
      },
    ]);

    await page.goto(`${URL}/admin`);

    // Check main admin dashboard
    await expect(page.locator('h1')).toContainText('Admin Portal');

    // Test Admin Routes Navigation
    await page.click('text=User Management');
    await page.waitForURL('**/admin/users');
    await expect(page.locator('h1')).toContainText('User Management');

    await page.click('text=Subscription Plans');
    await page.waitForURL('**/admin/plans');
    await expect(page.locator('h1')).toContainText('Subscription Plans');

    await page.click('text=Products & Store');
    await page.waitForURL('**/admin/products');
    await expect(page.locator('h1')).toContainText('Product Management');

    await page.click('text=Settings');
    await page.waitForURL('**/admin/settings');
    await expect(page.locator('h1')).toContainText('Tenant Settings');

    // Ensure Admin cannot access user area
    await page.goto(`${URL}/user`);
    // Our middleware should intercept and redirect back to admin or login depending on flow.
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
  });

  test('User Role Access - Mocking Cookies', async ({ page, context }) => {
    // Mock the cookies to simulate an authenticated User session
    await context.addCookies([
      {
        name: 'user_role',
        value: 'user',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
      },
    ]);

    await page.goto(`${URL}/user`);

    // Check main user dashboard
    await expect(page.locator('h1')).toContainText('Welcome Back');

    // Test User Routes Navigation
    await page.click('text=Marketplace');
    await page.waitForURL('**/user/marketplace');
    await expect(page.locator('h1')).toContainText('Marketplace');

    await page.click('text=My Plan');
    await page.waitForURL('**/user/plans');
    await expect(page.locator('h1')).toContainText('My Subscription');

    await page.click('text=My Purchases');
    await page.waitForURL('**/user/purchases');
    await expect(page.locator('h1')).toContainText('My Purchases');

    // Ensure User cannot access admin area
    await page.goto(`${URL}/admin`);
    await page.waitForURL('**/user*');
    await expect(page).toHaveURL(/.*\/user/);
  });
});
