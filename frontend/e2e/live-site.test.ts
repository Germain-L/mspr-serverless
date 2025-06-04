import { expect, test } from '@playwright/test';
import { AuthTestHelper } from './test-helpers';

test.describe('Live Site Tests - cofrap.germainleignel.com', () => {
	test('homepage loads correctly on live site', async ({ page }) => {
		await page.goto('https://cofrap.germainleignel.com');
		
		// Check that the main elements are present
		await expect(page.locator('h1')).toContainText('COFRAP Authentication');
		await expect(page.locator('h2')).toContainText('Sign in to your account');
		await expect(page.locator('input[name="username"]')).toBeVisible();
		
		// Take a screenshot for visual comparison
		await page.screenshot({ path: 'test-results/homepage-live.png', fullPage: true });
	});

	test('real API integration - check non-existent user', async ({ page }) => {
		await page.goto('https://cofrap.germainleignel.com');
		
		// Use a unique username that definitely doesn't exist
		const uniqueUsername = `nonexistent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		await page.fill('input[name="username"]', uniqueUsername);
		
		const checkButton = page.locator('button:has-text("Check User")');
		await checkButton.click();
		
		// Wait for API response
		await page.waitForTimeout(3000);
		
		// Should show option to create account for non-existent user
		const createAccountButton = page.locator('button:has-text("Create Account")');
		await expect(createAccountButton).toBeVisible();
	});

	test('form validation works on live site', async ({ page }) => {
		await page.goto('https://cofrap.germainleignel.com');
		
		// Test empty username validation
		const checkButton = page.locator('button:has-text("Check User")');
		await checkButton.click();
		
		// Should show validation error
		await expect(page.locator('text=Please enter a username')).toBeVisible();
		
		// Test short username validation
		await page.fill('input[name="username"]', 'ab');
		await checkButton.click();
		
		await expect(page.locator('text*=Username must be at least 3 characters')).toBeVisible();
	});

	test('network error handling on live site', async ({ page }) => {
		await page.goto('https://cofrap.germainleignel.com');
		
		// Block API requests to simulate network issues
		await page.route('**/check-user-status', route => route.abort('failed'));
		
		await page.fill('input[name="username"]', 'testuser');
		
		const checkButton = page.locator('button:has-text("Check User")');
		await checkButton.click();
		
		// Should handle network error gracefully
		await expect(page.locator('[role="alert"]')).toBeVisible();
	});

	test('responsive design on mobile viewport', async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('https://cofrap.germainleignel.com');
		
		// Should be fully responsive
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.locator('input[name="username"]')).toBeVisible();
		
		// Form should be usable on mobile
		await page.fill('input[name="username"]', 'mobiletest');
		await expect(page.locator('input[name="username"]')).toHaveValue('mobiletest');
		
		// Take mobile screenshot
		await page.screenshot({ path: 'test-results/mobile-view.png', fullPage: true });
	});

	test('performance check - page load time', async ({ page }) => {
		const startTime = Date.now();
		
		await page.goto('https://cofrap.germainleignel.com');
		await page.waitForLoadState('networkidle');
		
		const loadTime = Date.now() - startTime;
		console.log(`Page load time: ${loadTime}ms`);
		
		// Page should load within reasonable time (adjust as needed)
		expect(loadTime).toBeLessThan(5000); // 5 seconds max
	});

	test('HTTPS security check', async ({ page }) => {
		await page.goto('https://cofrap.germainleignel.com');
		
		// Verify we're using HTTPS
		expect(page.url()).toMatch(/^https:/);
		
		// Check for secure context (if using HTTPS features)
		const isSecureContext = await page.evaluate(() => window.isSecureContext);
		expect(isSecureContext).toBe(true);
	});

	// Test with a real scenario - attempting to create an account
	test('account creation flow - real API', async ({ page }) => {
		const helper = new AuthTestHelper(page);
		
		await page.goto('https://cofrap.germainleignel.com');
		
		// Use a unique username
		const testUsername = `e2etest_${Date.now()}`;
		
		await page.fill('input[name="username"]', testUsername);
		
		const checkButton = page.locator('button:has-text("Check User")');
		await checkButton.click();
		
		// Wait for API response
		await page.waitForTimeout(2000);
		
		// Should show create account option for new user
		const createAccountButton = page.locator('button:has-text("Create Account")');
		if (await createAccountButton.isVisible()) {
			await createAccountButton.click();
			
			// Should navigate to registration page
			await expect(page).toHaveURL(/\/register/);
			await expect(page.locator('input[name="username"]')).toHaveValue(testUsername);
			
			// Could proceed with actual account creation if needed
			// (be careful with this in automated tests)
		}
	});
});
