/**
 * Utility functions for communicating with OpenFaaS functions
 * from within the SvelteKit server endpoints
 */

// Use environment variable for internal cluster communication
const OPENFAAS_GATEWAY = process.env.VITE_API_BASE || 'http://gateway.openfaas.svc.cluster.local:8080/function';

export interface OpenFaaSResponse<T = any> {
  status: string;
  message?: string;
  error?: string;
  [key: string]: any;
}

export class OpenFaaSClient {
  /**
   * Make a request to an OpenFaaS function
   */
  static async callFunction<T = any>(
    functionName: string, 
    payload: any
  ): Promise<OpenFaaSResponse<T>> {
    try {
      console.log(`Calling OpenFaaS function: ${functionName}`);
      console.log(`Gateway URL: ${OPENFAAS_GATEWAY}`);
      
      const response = await fetch(`${OPENFAAS_GATEWAY}/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenFaaS function ${functionName} error: ${response.status} - ${errorText}`);
        
        return {
          status: 'error',
          message: `Function error: ${response.status}`,
          error: errorText
        };
      }

      const result = await response.json();
      console.log(`OpenFaaS function ${functionName} completed successfully`);
      
      return result;
    } catch (error) {
      console.error(`Error calling OpenFaaS function ${functionName}:`, error);
      
      return {
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate common request parameters
   */
  static validateUsername(username: any): string | null {
    if (!username || typeof username !== 'string') {
      return 'Username is required and must be a string';
    }
    
    if (username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Username can only contain letters, numbers, hyphens, and underscores';
    }
    
    return null;
  }

  static validatePassword(password: any): string | null {
    if (!password || typeof password !== 'string') {
      return 'Password is required and must be a string';
    }
    
    return null;
  }
}

/**
 * Environment configuration
 */
export const config = {
  gateway: OPENFAAS_GATEWAY,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production'
};
