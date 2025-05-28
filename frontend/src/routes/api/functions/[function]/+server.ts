import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// The base URL for OpenFaaS functions
// In a production environment, this would be configured based on your deployment
const OPENFAAS_BASE_URL = 'http://gateway.openfaas.svc.cluster.local:8080/function';

// Handle POST requests to /api/functions/:function
export async function POST({ params, request }: RequestEvent) {
  const functionName = params.function;
  
  try {
    // Get the request body
    const body = await request.json();
    
    // Forward the request to the OpenFaaS function
    const response = await fetch(`${OPENFAAS_BASE_URL}/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    // Get the response from the OpenFaaS function
    const data = await response.json();
    
    // Return the response
    return json(data);
  } catch (error) {
    console.error(`Error calling OpenFaaS function ${functionName}:`, error);
    
    // Return an error response
    return json(
      { error: 'Failed to call OpenFaaS function' }, 
      { status: 500 }
    );
  }
}
