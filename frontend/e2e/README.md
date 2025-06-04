# E2E Tests for COFRAP Authentication App

This directory contains comprehensive end-to-end tests for the COFRAP authentication application using Playwright.

## Test Files Overview

### Core Functionality Tests
- **`demo.test.ts`** - Basic smoke tests and page loading validation
- **`authentication.test.ts`** - User login and authentication flows
- **`registration.test.ts`** - New user registration process
- **`dashboard.test.ts`** - Dashboard functionality and navigation
- **`two-factor-auth.test.ts`** - 2FA setup and verification

### Advanced Tests
- **`integration.test.ts`** - API integration, cross-browser, and performance tests
- **`accessibility-security.test.ts`** - Accessibility compliance and security checks

### Utilities
- **`test-helpers.ts`** - Reusable test utilities, mocks, and selectors

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Interactive Mode
```bash
npm run test:e2e:ui
```

### Headed Mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### Specific Test Categories
```bash
npm run test:e2e:auth        # Authentication tests only
npm run test:e2e:dashboard   # Dashboard tests only
npm run test:e2e:registration # Registration tests only
```

### Specific Browsers
```bash
npm run test:e2e:chrome      # Chrome only
npm run test:e2e:firefox     # Firefox only
npm run test:e2e:webkit      # Safari/WebKit only
```

### View Test Reports
```bash
npm run test:e2e:report
```

## Test Configuration

The tests are configured to run against `https://cofrap.germainleignel.com` by default. The configuration includes:

- **Multiple browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Screenshots** on failure
- **Video recording** on failure
- **Trace collection** for debugging
- **Responsive testing** across different viewport sizes

## Test Scenarios Covered

### Authentication Flow
- ✅ Username validation
- ✅ User existence checking
- ✅ Password authentication
- ✅ 2FA authentication
- ✅ Login success/failure handling
- ✅ Session management

### Registration Flow
- ✅ New user creation
- ✅ Password generation
- ✅ QR code display
- ✅ Error handling
- ✅ Navigation flow

### Dashboard
- ✅ Authenticated access
- ✅ User information display
- ✅ 2FA status
- ✅ Logout functionality
- ✅ Navigation protection

### Security & Accessibility
- ✅ Proper error handling
- ✅ No sensitive data exposure
- ✅ HTTPS enforcement
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ Proper ARIA attributes

### Cross-browser & Performance
- ✅ Multiple browser engines
- ✅ Responsive design
- ✅ Loading time validation
- ✅ API error handling
- ✅ Network failure resilience

## Mock API Responses

The tests use Playwright's route mocking to simulate API responses:

```typescript
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
```

## Test Helper Usage

Use the `AuthTestHelper` class for common operations:

```typescript
import { AuthTestHelper } from './test-helpers';

test('example test', async ({ page }) => {
  const auth = new AuthTestHelper(page);
  
  await auth.mockAuthenticatedUser();
  await auth.fillLoginForm('testuser', 'password');
  await auth.expectRedirectToDashboard();
});
```

## Debugging Failed Tests

1. **Check screenshots**: Screenshots are automatically captured on failure
2. **View traces**: Use `npx playwright show-trace trace.zip` for detailed debugging
3. **Run in headed mode**: See the browser interactions with `--headed`
4. **Use debug mode**: Step through tests with `--debug`

## Environment Variables

- `CI=true` - Enables CI-specific configuration
- `VITE_API_BASE` - Override API base URL for testing

## Continuous Integration

These tests are designed to run in CI environments with:
- Retry logic for flaky tests
- Parallel execution
- HTML reporting
- Artifact collection

## Adding New Tests

1. Create test files in the `e2e/` directory
2. Follow the existing naming convention: `feature.test.ts`
3. Use the test helpers from `test-helpers.ts`
4. Include proper test descriptions and grouping
5. Add appropriate mocks for API interactions

## Best Practices

- **Use data-testid attributes** for reliable element selection
- **Mock external dependencies** to avoid flaky tests
- **Test user journeys** rather than individual components
- **Include both happy path and error scenarios**
- **Verify accessibility** in all tests
- **Test across different devices and browsers**
