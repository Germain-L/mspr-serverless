import { expect, test } from '@playwright/test';

test.describe('Authentication Flow', () => {
	const testUsername = `testuser_${Date.now()}`;
	
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('user registration flow', async ({ page }) => {
		// Enter a new username
		await page.fill('input[name="username"]', testUsername);
		
		// Check user status
		const checkButton = page.locator('button:has-text("Check User")');
		await checkButton.click();
		
		// Wait for response and look for create account option
		await page.waitForTimeout(2000);
		
		// If user doesn't exist, should show create account option
		const createAccountButton = page.locator('button:has-text("Create Account")');
		if (await createAccountButton.isVisible()) {
			await createAccountButton.click();
			
			// Should navigate to registration page
			await expect(page).toHaveURL(/\/register/);
			await expect(page.locator('h2')).toContainText('Create New Account');
			
			// Should have username pre-filled
			await expect(page.locator('input[name="username"]')).toHaveValue(testUsername);
		} else {
			// User already exists, check for password field
			await expect(page.locator('input[name="password"]')).toBeVisible();
		}
	});

	test('existing user login flow', async ({ page }) => {
		// Use a known test username that should exist
		const existingUsername = 'testuser';
		
		await page.fill('input[name="username"]', existingUsername);
		
		const checkButton = page.locator('button:has-text("Check User")');
		await checkButton.click();
		
		// Wait for API response
		await page.waitForTimeout(2000);
		
		// Should show password field for existing user
		const passwordField = page.locator('input[name="password"]');
		if (await passwordField.isVisible()) {
			// Enter password
			await page.fill('input[name="password"]', 'wrongpassword');
			
			const loginButton = page.locator('button:has-text("Sign In")');
			await loginButton.click();
			
			// Should show authentication error
			await expect(page.locator('[role="alert"]')).toBeVisible();
		}
	});

	test('2FA flow for users with 2FA enabled', async ({ page }) => {
		// This test assumes there's a user with 2FA enabled
		const user2FA = 'user2fa';
		
		await page.fill('input[name="username"]', user2FA);
		
		const checkButton = page.locator('button:has-text("Check User")');
		await checkButton.click();
		
		await page.waitForTimeout(2000);
		
		// If password field appears, enter password
		const passwordField = page.locator('input[name="password"]');
		if (await passwordField.isVisible()) {
			await page.fill('input[name="password"]', 'testpassword');
			
			// Check if 2FA field appears
			const totpField = page.locator('input[name="totpCode"]');
			if (await totpField.isVisible()) {
				// Try with invalid 2FA code
				await page.fill('input[name="totpCode"]', '123456');
				
				const loginButton = page.locator('button:has-text("Sign In")');
				await loginButton.click();
				
				// Should show 2FA error
				await expect(page.locator('[role="alert"]')).toBeVisible();
			}
		}
	});

	test('successful authentication redirects to dashboard', async ({ page }) => {
		// Mock successful authentication
		await page.route('**/authenticate-user', async route => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					status: 'success',
					user_id: 123,
					message: 'Authentication successful'
				})
			});
		});

		await page.route('**/check-user-status', async route => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					exists: true,
					has_2fa: false,
					expired: false
				})
			});
		});

		await page.fill('input[name="username"]', 'validuser');
		
		const checkButton = page.locator('button:has-text("Check User")');
		await checkButton.click();
		
		await page.waitForTimeout(1000);
		
		await page.fill('input[name="password"]', 'validpassword');
		
		const loginButton = page.locator('button:has-text("Sign In")');
		await loginButton.click();
		
		// Should redirect to dashboard
		await expect(page).toHaveURL(/\/dashboard/);
	});
});
