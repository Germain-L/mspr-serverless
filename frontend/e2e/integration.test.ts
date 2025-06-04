import { expect, test } from '@playwright/test';

test.describe('API Integration Tests', () => {
	test('handles network errors gracefully', async ({ page }) => {
		// Block all API requests
		await page.route('**/check-user-status', async route => {
			await route.abort('failed');
		});
		
		await page.goto('/');
		await page.fill('input[name="username"]', 'testuser');
		
		const checkButton = page.locator('button:has-text("Check User")');
		await checkButton.click();
		
		// Should show network error message
		await expect(page.locator('[role="alert"]')).toBeVisible();
	});

	test('handles API timeout', async ({ page }) => {
		// Delay API response significantly
		await page.route('**/check-user-status', async route => {
			await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ exists: true, has_2fa: false, expired: false })
			});
		});
		
		await page.goto('/');
		await page.fill('input[name="username"]', 'testuser');
		
		const checkButton = page.locator('button:has-text("Check User")');
		await checkButton.click();
		
		// Should show loading state
		await expect(checkButton).toBeDisabled();
	});

	test('handles malformed API responses', async ({ page }) => {
		await page.route('**/check-user-status', async route => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: 'invalid json'
			});
		});
		
		await page.goto('/');
		await page.fill('input[name="username"]', 'testuser');
		
		const checkButton = page.locator('button:has-text("Check User")');
		await checkButton.click();
		
		// Should handle JSON parsing error
		await expect(page.locator('[role="alert"]')).toBeVisible();
	});

	test('handles HTTP error codes', async ({ page }) => {
		await page.route('**/check-user-status', async route => {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ error: 'Internal server error' })
			});
		});
		
		await page.goto('/');
		await page.fill('input[name="username"]', 'testuser');
		
		const checkButton = page.locator('button:has-text("Check User")');
		await checkButton.click();
		
		// Should show server error message
		await expect(page.locator('[role="alert"]')).toContainText('Internal server error');
	});
});

test.describe('Cross-browser Compatibility', () => {
	test('app works in different viewport sizes', async ({ page }) => {
		// Test mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');
		
		// Should be responsive
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.locator('input[name="username"]')).toBeVisible();
		
		// Test tablet viewport
		await page.setViewportSize({ width: 768, height: 1024 });
		await expect(page.locator('h1')).toBeVisible();
		
		// Test desktop viewport
		await page.setViewportSize({ width: 1920, height: 1080 });
		await expect(page.locator('h1')).toBeVisible();
	});

	test('keyboard navigation works', async ({ page }) => {
		await page.goto('/');
		
		// Tab to username field
		await page.keyboard.press('Tab');
		await expect(page.locator('input[name="username"]')).toBeFocused();
		
		// Type username
		await page.keyboard.type('testuser');
		
		// Tab to button and press Enter
		await page.keyboard.press('Tab');
		await page.keyboard.press('Enter');
		
		// Should trigger user check
		await page.waitForTimeout(1000);
	});
});

test.describe('Performance Tests', () => {
	test('page loads within acceptable time', async ({ page }) => {
		const startTime = Date.now();
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		const loadTime = Date.now() - startTime;
		
		// Should load within 3 seconds
		expect(loadTime).toBeLessThan(3000);
	});

	test('app remains responsive during API calls', async ({ page }) => {
		// Simulate slow API
		await page.route('**/check-user-status', async route => {
			await new Promise(resolve => setTimeout(resolve, 2000));
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ exists: true, has_2fa: false, expired: false })
			});
		});
		
		await page.goto('/');
		await page.fill('input[name="username"]', 'testuser');
		
		const checkButton = page.locator('button:has-text("Check User")');
		await checkButton.click();
		
		// UI should still be responsive (button should be disabled during request)
		await expect(checkButton).toBeDisabled();
		
		// Other elements should still be interactive
		await expect(page.locator('input[name="username"]')).toBeVisible();
	});
});
