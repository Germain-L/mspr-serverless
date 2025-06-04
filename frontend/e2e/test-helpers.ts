import { Page, expect } from '@playwright/test';

export class AuthTestHelper {
	constructor(private page: Page) {}

	async mockAuthenticatedUser(user = {
		id: 123,
		username: 'testuser',
		has_2fa: false,
		expired: false
	}) {
		await this.page.addInitScript((userData) => {
			window.localStorage.setItem('auth', JSON.stringify({
				user: userData,
				isAuthenticated: true,
				loading: false,
				error: null
			}));
		}, user);
	}

	async mockUnauthenticatedUser() {
		await this.page.addInitScript(() => {
			window.localStorage.removeItem('auth');
		});
	}

	async mockSuccessfulAuth() {
		await this.page.route('**/authenticate-user', async route => {
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
	}

	async mockFailedAuth(error = 'Invalid credentials') {
		await this.page.route('**/authenticate-user', async route => {
			await route.fulfill({
				status: 401,
				contentType: 'application/json',
				body: JSON.stringify({
					status: 'error',
					error: error
				})
			});
		});
	}

	async mockUserExists(exists = true, has2fa = false, expired = false) {
		await this.page.route('**/check-user-status', async route => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					exists,
					has_2fa: has2fa,
					expired
				})
			});
		});
	}

	async mockUserCreation(success = true, password = 'generated-password-123') {
		await this.page.route('**/generate-password', async route => {
			if (success) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						status: 'success',
						user_id: 123,
						password,
						qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
					})
				});
			} else {
				await route.fulfill({
					status: 400,
					contentType: 'application/json',
					body: JSON.stringify({
						error: 'Username already exists'
					})
				});
			}
		});
	}

	async mock2FASetup(success = true) {
		await this.page.route('**/generate-2fa', async route => {
			if (success) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						status: 'success',
						qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
						secret: 'JBSWY3DPEHPK3PXP'
					})
				});
			} else {
				await route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify({
						error: 'Failed to generate 2FA secret'
					})
				});
			}
		});
	}

	async fillLoginForm(username: string, password?: string, totpCode?: string) {
		await this.page.fill('input[name="username"]', username);
		
		if (password) {
			await this.page.fill('input[name="password"]', password);
		}
		
		if (totpCode) {
			await this.page.fill('input[name="totpCode"]', totpCode);
		}
	}

	async expectErrorMessage(message?: string) {
		const alert = this.page.locator('[role="alert"]');
		await expect(alert).toBeVisible();
		
		if (message) {
			await expect(alert).toContainText(message);
		}
	}

	async expectSuccessMessage(message?: string) {
		const alert = this.page.locator('[role="alert"]');
		await expect(alert).toBeVisible();
		
		if (message) {
			await expect(alert).toContainText(message);
		}
	}

	async expectRedirectToDashboard() {
		await expect(this.page).toHaveURL(/\/dashboard/);
		await expect(this.page.locator('h1')).toContainText('Welcome back!');
	}

	async expectRedirectToLogin() {
		await expect(this.page).toHaveURL('/');
		await expect(this.page.locator('h2')).toContainText('Sign in to your account');
	}
}

export const testUsers = {
	valid: {
		username: 'testuser',
		password: 'validpassword',
		id: 123
	},
	with2FA: {
		username: 'user2fa',
		password: 'password123',
		totpCode: '123456',
		id: 124
	},
	expired: {
		username: 'expireduser',
		password: 'oldpassword',
		id: 125
	},
	nonExistent: {
		username: 'newuser_' + Date.now(),
		password: 'newpassword'
	}
};

export const selectors = {
	// Forms
	usernameInput: 'input[name="username"]',
	passwordInput: 'input[name="password"]',
	totpInput: 'input[name="totpCode"]',
	
	// Buttons
	checkUserButton: 'button:has-text("Check User")',
	signInButton: 'button:has-text("Sign In")',
	createAccountButton: 'button:has-text("Create Account")',
	logoutButton: 'button:has-text("Logout")',
	setup2FAButton: 'button:has-text("Set up 2FA")',
	
	// Messages
	errorAlert: '[role="alert"]:not(.alert-success)',
	successAlert: '[role="alert"].alert-success, [role="alert"]:has-text("success")',
	
	// Navigation
	dashboardHeading: 'h1:has-text("Welcome back!")',
	loginHeading: 'h2:has-text("Sign in to your account")',
	
	// Components
	qrCode: 'img[alt*="QR Code"]',
	passwordDisplay: '[data-testid="generated-password"]'
};
