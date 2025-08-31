import { test, expect } from '@playwright/test';

test('home loads', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByText('CREOLE Public Search')).toBeVisible();
});

test('login redirects to keycloak', async ({ page }) => {
  await page.goto('http://localhost:3000/api/auth/login');
  await expect(page).toHaveURL(/realms\/creole\/protocol\/openid-connect\/auth/);
});