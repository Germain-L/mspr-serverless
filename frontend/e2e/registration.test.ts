import { expect, test } from '@playwright/test';

test.describe('Registration Flow', () => {
	const testUsername = `newuser_${Date.now()}`;
	
	test('complete user registration process', async ({ page }) => {
		// Navigate to registration page directly
		await page.goto(`/register?username=${testUsername}`);
		
		// Check page loaded correctly
		await expect(page.locator('h2')).toContainText('Create New Account');
		await expect(page.locator('input[name="username"]')).toHaveValue(testUsername);
		
		// Mock successful user creation
		await page.route('**/generate-password', async route => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					status: 'success',
					user_id: 123,
					password: 'generated-password-123',
					qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
				})
			});
		});
		
		// Click create account button
		const createButton = page.locator('button:has-text("Create Account")');
		await createButton.click();
		
		// Wait for success state
		await expect(page.locator('[role="alert"]:has-text("Account created successfully")')).toBeVisible();
		
		// Check that password is displayed
		await expect(page.locator('text=generated-password-123')).toBeVisible();
		
		// Check that QR code is displayed
		await expect(page.locator('img[alt*="QR Code"]')).toBeVisible();
		
		// Check action buttons are present
		await expect(page.locator('button:has-text("Set up Two-Factor Authentication")')).toBeVisible();
		await expect(page.locator('button:has-text("Go to Login")')).toBeVisible();
	});

	test('handles registration errors gracefully', async ({ page }) => {
		await page.goto(`/register?username=${testUsername}`);
		
		// Mock API error
		await page.route('**/generate-password', async route => {
			await route.fulfill({
				status: 400,
				contentType: 'application/json',
				body: JSON.stringify({
					error: 'Username already exists'
				})
			});
		});
		
		const createButton = page.locator('button:has-text("Create Account")');
		await createButton.click();
		
		// Should show error message
		await expect(page.locator('[role="alert"]')).toContainText('Username already exists');
	});

	test('validation prevents registration with invalid username', async ({ page }) => {
		await page.goto('/register');
		
		// Try with too short username
		await page.fill('input[name="username"]', 'ab');
		
		const createButton = page.locator('button:has-text("Create Account")');
		await createButton.click();
		
		// Should show validation error
		await expect(page.locator('text*=Username must be at least 3 characters')).toBeVisible();
	});

	test('back to login button works', async ({ page }) => {
		await page.goto('/register');
		
		const backButton = page.locator('button:has-text("Back to Login")');
		await backButton.click();
		
		// Should navigate back to home page
		await expect(page).toHaveURL('/');
		await expect(page.locator('h2')).toContainText('Sign in to your account');
	});
});
