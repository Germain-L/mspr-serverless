import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const OPENFAAS_GATEWAY = env.OPENFAAS_GATEWAY_INTERNAL || 'http://gateway.openfaas.svc.cluster.local:8080';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    
    const response = await fetch(`${OPENFAAS_GATEWAY}/function/check-user-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`OpenFaaS responded with ${response.status}`);
    }
    
    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Check user error:', error);
    return json(
      { error: 'Failed to check user status' },
      { status: 500 }
    );
  }
};
