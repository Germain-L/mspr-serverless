import type { Handle } from '@sveltejs/kit';
import { httpRequestsTotal, httpRequestDuration, activeConnections } from '$lib/metrics';

export const handle: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const { request } = event;
	const method = request.method;
	const route = event.route?.id || 'unknown';

	// Increment active connections
	activeConnections.inc();

	try {
		const response = await resolve(event);
		
		// Track the request
		const duration = (Date.now() - start) / 1000;
		const statusCode = response.status.toString();
		
		httpRequestsTotal.inc({ method, route, status_code: statusCode });
		httpRequestDuration.observe({ method, route }, duration);
		
		return response;
	} catch (error) {
		// Track error
		httpRequestsTotal.inc({ method, route, status_code: '500' });
		throw error;
	} finally {
		// Decrement active connections
		activeConnections.dec();
	}
};
