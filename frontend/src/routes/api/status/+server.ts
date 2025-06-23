import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { config } from '$lib/server/openfaas';
import { versionInfo } from '$lib/version';

export const GET: RequestHandler = async () => {
  try {
    const status = {
      service: 'SvelteKit Auth Proxy',
      ...versionInfo,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        gateway: config.gateway,
        isDevelopment: config.isDevelopment,
        isProduction: config.isProduction
      },
      endpoints: [
        '/api/auth/create-user',
        '/api/auth/setup-2fa', 
        '/api/auth/authenticate',
        '/api/auth/check-user'
      ]
    };

    return json(status);
  } catch (error) {
    return json(
      { 
        service: 'SvelteKit Auth Proxy',
        status: 'error',
        version: versionInfo.version,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};
