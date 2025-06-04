import { expect, test } from '@playwright/test';

test.describe('Dashboard', () => {
	test.beforeEach(async ({ page }) => {
		// Mock authentication state
		await page.addInitScript(() => {
			// Mock localStorage or sessionStorage if used by auth store
			window.localStorage.setItem('auth', JSON.stringify({
				user: {
					id: 123,
					username: 'testuser',
					has_2fa: false,
					expired: false
				},
				isAuthenticated: true,
				loading: false,
				error: null
			}));
		});
	});

	test('displays dashboard for authenticated user', async ({ page }) => {
		await page.goto('/dashboard');
		
		// Check welcome message
		await expect(page.locator('h1')).toContainText('Welcome back!');
		
		// Check account information section
		await expect(page.locator('text=Account Information')).toBeVisible();
		await expect(page.locator('text=testuser')).toBeVisible();
		await expect(page.locator('text=123')).toBeVisible();
		
		// Check security section
		await expect(page.locator('text=Security Settings')).toBeVisible();
	});

	test('shows 2FA setup prompt for users without 2FA', async ({ page }) => {
		await page.goto('/dashboard');
		
		// Should show 2FA setup recommendation
		await expect(page.locator('text*=Consider enabling Two-Factor Authentication')).toBeVisible();
		await expect(page.locator('button:has-text("Set up 2FA")')).toBeVisible();
	});

	test('shows 2FA enabled status for users with 2FA', async ({ page }) => {
		// Override auth state to include 2FA
		await page.addInitScript(() => {
			window.localStorage.setItem('auth', JSON.stringify({
				user: {
					id: 123,
					username: 'testuser',
					has_2fa: true,
					expired: false
				},
				isAuthenticated: true,
				loading: false,
				error: null
			}));
		});
		
		await page.goto('/dashboard');
		
		// Should show 2FA enabled status
		await expect(page.locator('text*=Your account is secured with Two-Factor Authentication')).toBeVisible();
	});

	test('logout functionality works', async ({ page }) => {
		await page.goto('/dashboard');
		
		// Click logout in header
		const logoutButton = page.locator('button:has-text("Logout")').first();
		await logoutButton.click();
		
		// Should redirect to login page
		await expect(page).toHaveURL('/');
		await expect(page.locator('h2')).toContainText('Sign in to your account');
	});

	test('logout from dashboard actions works', async ({ page }) => {
		await page.goto('/dashboard');
		
		// Click logout in actions section
		const logoutButton = page.locator('button:has-text("Sign Out")');
		await logoutButton.click();
		
		// Should redirect to login page
		await expect(page).toHaveURL('/');
	});

	test('2FA setup navigation works', async ({ page }) => {
		await page.goto('/dashboard');
		
		const setup2FAButton = page.locator('button:has-text("Set up 2FA")');
		if (await setup2FAButton.isVisible()) {
			await setup2FAButton.click();
			
			// Should navigate to 2FA setup page
			await expect(page).toHaveURL(/\/setup-2fa/);
		}
	});
});

test.describe('Dashboard - Unauthenticated Access', () => {
	test('redirects to login when not authenticated', async ({ page }) => {
		// Don't set authentication state
		await page.goto('/dashboard');
		
		// Should redirect to login
		await expect(page).toHaveURL('/');
		await expect(page.locator('h2')).toContainText('Sign in to your account');
	});
});
