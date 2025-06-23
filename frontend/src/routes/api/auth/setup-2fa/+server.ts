import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { OpenFaaSClient } from '$lib/server/openfaas';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Validate input
    const usernameError = OpenFaaSClient.validateUsername(body.username);
    if (usernameError) {
      return json(
        { status: 'error', message: usernameError },
        { status: 400 }
      );
    }

    console.log(`Proxying generate-2fa request for user: ${body.username}`);
    
    // Call OpenFaaS function via internal cluster DNS
    const result = await OpenFaaSClient.callFunction('generate-2fa', body);
    
    if (result.status === 'error') {
      return json(result, { status: 500 });
    }
    
    return json(result);
  } catch (error) {
    console.error('Error in generate-2fa proxy:', error);
    return json(
      { 
        status: 'error', 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};
