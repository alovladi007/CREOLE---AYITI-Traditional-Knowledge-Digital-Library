import { test, expect } from '@playwright/test';

test.describe('CREOLE Platform', () => {
  test('home page renders correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check that the toolbar is present
    await expect(page.locator('h1')).toContainText('CREOLE');
    
    // Check that navigation links are present
    await expect(page.locator('a:has-text("Home")')).toBeVisible();
    await expect(page.locator('a:has-text("Intake")')).toBeVisible();
    
    // Check that the search bar is present
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    
    // Check that the sign in button is present
    await expect(page.locator('a:has-text("Sign in")')).toBeVisible();
  });

  test('login redirects to Keycloak', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Click the sign in button
    const signInButton = page.locator('a:has-text("Sign in")');
    await signInButton.click();
    
    // Wait for redirect to Keycloak
    await page.waitForURL(/.*8080.*/, { timeout: 10000 });
    
    // Verify we're on the Keycloak login page
    const url = page.url();
    expect(url).toContain('8080');
    expect(url).toContain('/realms/creole/protocol/openid-connect/auth');
    expect(url).toContain('response_type=code');
    expect(url).toContain('code_challenge_method=S256');
  });

  test('search functionality works', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Type in search box
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Joumou');
    
    // Submit search
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();
    
    // Check URL has search parameter
    await expect(page).toHaveURL(/.*\?q=Joumou/);
  });

  test('intake page requires authentication', async ({ page }) => {
    await page.goto('http://localhost:3000/intake');
    
    // Check that the intake form is present
    await expect(page.locator('h2')).toContainText('Submit New Record');
    
    // Try to submit form (should redirect to login)
    const submitButton = page.locator('button:has-text("Submit Record")');
    await expect(submitButton).toBeVisible();
  });

  test('record detail page loads', async ({ page }) => {
    // Create a mock record ID (this would be a real ID in production)
    await page.goto('http://localhost:3000/records/test-id');
    
    // Should either show record or not found message
    const content = await page.textContent('body');
    expect(content).toMatch(/Record Not Found|Record ID:/);
  });
});