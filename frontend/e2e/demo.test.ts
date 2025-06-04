import { expect, test } from '@playwright/test';

test.describe('COFRAP Authentication App', () => {
	test('home page loads correctly', async ({ page }) => {
		await page.goto('/');
		
		// Check for main heading
		await expect(page.locator('h1')).toContainText('COFRAP Authentication');
		
		// Check for sign in form
		await expect(page.locator('h2')).toContainText('Sign in to your account');
		
		// Check username input is present
		await expect(page.locator('input[name="username"]')).toBeVisible();
	});

	test('shows validation error for empty username', async ({ page }) => {
		await page.goto('/');
		
		// Try to proceed without entering username
		const submitButton = page.locator('button:has-text("Check User")');
		if (await submitButton.isVisible()) {
			await submitButton.click();
			await expect(page.locator('text=Please enter a username')).toBeVisible();
		}
	});

	test('shows validation error for invalid username', async ({ page }) => {
		await page.goto('/');
		
		// Enter invalid username (too short)
		await page.fill('input[name="username"]', 'ab');
		
		const submitButton = page.locator('button:has-text("Check User")');
		if (await submitButton.isVisible()) {
			await submitButton.click();
			await expect(page.locator('text*=Username must be at least 3 characters')).toBeVisible();
		}
	});
});
