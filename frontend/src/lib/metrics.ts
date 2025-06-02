import { register, Counter, Histogram, Gauge } from 'prom-client';

// Create metrics
export const httpRequestsTotal = new Counter({
	name: 'http_requests_total',
	help: 'Total number of HTTP requests',
	labelNames: ['method', 'route', 'status_code']
});

export const httpRequestDuration = new Histogram({
	name: 'http_request_duration_seconds',
	help: 'Duration of HTTP requests in seconds',
	labelNames: ['method', 'route'],
	buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

export const activeConnections = new Gauge({
	name: 'active_connections',
	help: 'Number of active connections'
});

export const authenticationAttempts = new Counter({
	name: 'authentication_attempts_total',
	help: 'Total number of authentication attempts',
	labelNames: ['result']
});

export const registrationAttempts = new Counter({
	name: 'registration_attempts_total',
	help: 'Total number of user registration attempts',
	labelNames: ['result']
});

export const twoFactorOperations = new Counter({
	name: 'two_factor_operations_total',
	help: 'Total number of 2FA operations',
	labelNames: ['operation', 'result']
});

export const pageViews = new Counter({
	name: 'page_views_total',
	help: 'Total number of page views',
	labelNames: ['route']
});

export const apiErrors = new Counter({
	name: 'api_errors_total',
	help: 'Total number of API errors',
	labelNames: ['endpoint', 'error_type']
});

// Utility functions
export function trackPageView(route: string) {
	pageViews.inc({ route });
}

export function trackAuthentication(success: boolean) {
	authenticationAttempts.inc({ result: success ? 'success' : 'failure' });
}

export function trackRegistration(success: boolean) {
	registrationAttempts.inc({ result: success ? 'success' : 'failure' });
}

export function track2FAOperation(operation: string, success: boolean) {
	twoFactorOperations.inc({ 
		operation, 
		result: success ? 'success' : 'failure' 
	});
}

export function trackApiError(endpoint: string, errorType: string) {
	apiErrors.inc({ endpoint, error_type: errorType });
}

export function getMetrics() {
	return register.metrics();
}
