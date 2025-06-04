import { expect, test } from '@playwright/test';

test.describe('Accessibility Tests', () => {
	test('login page has proper accessibility attributes', async ({ page }) => {
		await page.goto('/');
		
		// Check for proper heading hierarchy
		const h1 = page.locator('h1');
		await expect(h1).toBeVisible();
		
		const h2 = page.locator('h2');
		await expect(h2).toBeVisible();
		
		// Check form labels
		const usernameInput = page.locator('input[name="username"]');
		await expect(usernameInput).toBeVisible();
		
		// Check for form validation messages using ARIA
		await page.fill('input[name="username"]', '');
		const submitButton = page.locator('button[type="submit"]').first();
		if (await submitButton.isVisible()) {
			await submitButton.click();
			// Should have proper error announcement
			await expect(page.locator('[role="alert"]')).toBeVisible();
		}
	});

	test('dashboard has proper navigation structure', async ({ page }) => {
		// Mock auth state
		await page.addInitScript(() => {
			window.localStorage.setItem('auth', JSON.stringify({
				user: { id: 123, username: 'testuser', has_2fa: false, expired: false },
				isAuthenticated: true,
				loading: false,
				error: null
			}));
		});
		
		await page.goto('/dashboard');
		
		// Check for main landmarks
		await expect(page.locator('main')).toBeVisible();
		await expect(page.locator('header')).toBeVisible();
		
		// Check for proper heading structure
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.locator('h3')).toBeVisible();
	});

	test('forms have proper keyboard navigation', async ({ page }) => {
		await page.goto('/');
		
		// Tab through form elements
		await page.keyboard.press('Tab');
		await expect(page.locator('input[name="username"]')).toBeFocused();
		
		// Should be able to navigate to buttons
		await page.keyboard.press('Tab');
		const focusedElement = page.locator(':focus');
		await expect(focusedElement).toBeVisible();
	});

	test('error messages are announced properly', async ({ page }) => {
		await page.goto('/');
		
		// Trigger validation error
		const submitButton = page.locator('button:has-text("Check User")');
		if (await submitButton.isVisible()) {
			await submitButton.click();
			
			// Error should be in an alert region
			const alert = page.locator('[role="alert"]');
			await expect(alert).toBeVisible();
			await expect(alert).toHaveAttribute('role', 'alert');
		}
	});

	test('buttons have appropriate labels', async ({ page }) => {
		await page.goto('/');
		
		// All buttons should have accessible names
		const buttons = page.locator('button');
		const buttonCount = await buttons.count();
		
		for (let i = 0; i < buttonCount; i++) {
			const button = buttons.nth(i);
			const hasText = await button.textContent();
			const hasAriaLabel = await button.getAttribute('aria-label');
			
			// Button should have either text content or aria-label
			expect(hasText || hasAriaLabel).toBeTruthy();
		}
	});
});

test.describe('Security Tests', () => {
	test('no sensitive data exposed in client', async ({ page }) => {
		await page.goto('/');
		
		// Check that no sensitive data is exposed in the page source
		const content = await page.content();
		
		// Should not contain any obvious secrets
		expect(content).not.toContain('password');
		expect(content).not.toContain('secret');
		expect(content).not.toContain('token');
	});

	test('proper HTTPS usage', async ({ page }) => {
		await page.goto('/');
		
		// Check that we're using HTTPS in production
		const url = page.url();
		if (url.includes('cofrap.germainleignel.com')) {
			expect(url).toMatch(/^https:/);
		}
	});

	test('no console errors on normal usage', async ({ page }) => {
		const consoleErrors: string[] = [];
		
		page.on('console', msg => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});
		
		await page.goto('/');
		await page.fill('input[name="username"]', 'testuser');
		
		// Should not have console errors during normal usage
		expect(consoleErrors.length).toBe(0);
	});

	test('proper error handling without exposing internals', async ({ page }) => {
		// Mock server error
		await page.route('**/check-user-status', async route => {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ error: 'Database connection failed with credentials root:password123' })
			});
		});
		
		await page.goto('/');
		await page.fill('input[name="username"]', 'testuser');
		
		const checkButton = page.locator('button:has-text("Check User")');
		await checkButton.click();
		
		// Error message should be user-friendly, not expose internals
		const errorMessage = await page.locator('[role="alert"]').textContent();
		expect(errorMessage).not.toContain('root:password123');
		expect(errorMessage).not.toContain('Database connection failed');
	});
});
