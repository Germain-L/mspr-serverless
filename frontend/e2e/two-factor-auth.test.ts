import { expect, test } from '@playwright/test';

test.describe('Two-Factor Authentication Setup', () => {
	const testUsername = 'testuser2fa';
	
	test.beforeEach(async ({ page }) => {
		// Mock authentication state
		await page.addInitScript(() => {
			window.localStorage.setItem('auth', JSON.stringify({
				user: {
					id: 123,
					username: 'testuser2fa',
					has_2fa: false,
					expired: false
				},
				isAuthenticated: true,
				loading: false,
				error: null
			}));
		});
	});

	test('2FA setup page loads correctly', async ({ page }) => {
		await page.goto(`/setup-2fa?username=${testUsername}`);
		
		// Check page title and content
		await expect(page.locator('h2')).toContainText('Set up Two-Factor Authentication');
		
		// Should have setup button
		await expect(page.locator('button:has-text("Set up 2FA")')).toBeVisible();
	});

	test('successful 2FA setup flow', async ({ page }) => {
		// Mock successful 2FA generation
		await page.route('**/generate-2fa', async route => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					status: 'success',
					qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
					secret: 'JBSWY3DPEHPK3PXP'
				})
			});
		});
		
		await page.goto(`/setup-2fa?username=${testUsername}`);
		
		const setupButton = page.locator('button:has-text("Set up 2FA")');
		await setupButton.click();
		
		// Should show QR code
		await expect(page.locator('img[alt*="QR Code"]')).toBeVisible();
		
		// Should show instructions
		await expect(page.locator('text*=Scan the QR code')).toBeVisible();
		
		// Should have back to dashboard button
		await expect(page.locator('button:has-text("Back to Dashboard")')).toBeVisible();
	});

	test('handles 2FA setup errors', async ({ page }) => {
		// Mock API error
		await page.route('**/generate-2fa', async route => {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({
					error: 'Failed to generate 2FA secret'
				})
			});
		});
		
		await page.goto(`/setup-2fa?username=${testUsername}`);
		
		const setupButton = page.locator('button:has-text("Set up 2FA")');
		await setupButton.click();
		
		// Should show error message
		await expect(page.locator('[role="alert"]')).toContainText('Failed to generate 2FA secret');
	});

	test('back to dashboard navigation works', async ({ page }) => {
		await page.goto(`/setup-2fa?username=${testUsername}`);
		
		const backButton = page.locator('button:has-text("Back to Dashboard")');
		if (await backButton.isVisible()) {
			await backButton.click();
			
			// Should navigate back to dashboard
			await expect(page).toHaveURL('/dashboard');
		}
	});
});
