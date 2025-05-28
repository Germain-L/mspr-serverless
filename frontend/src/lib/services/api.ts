import type { 
  PasswordResponse, 
  TwoFactorResponse, 
  AuthenticationResponse, 
  UserStatusResponse,
  ErrorResponse
} from '$lib/types/api';

/**
 * Base URL for OpenFaaS functions
 * This should be configured based on your deployment environment
 */
const API_BASE = '/api/functions';

/**
 * Generic function to call OpenFaaS functions
 */
async function callFunction<T>(functionName: string, data: Record<string, any>): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      const errorData = responseData as ErrorResponse;
      throw new Error(errorData.error || 'API request failed');
    }
    
    return responseData as T;
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    throw error;
  }
}

/**
 * Authentication service for user login/verification
 */
export const authService = {
  authenticate: (username: string, password: string, tfaCode: string): Promise<AuthenticationResponse> => 
    callFunction<AuthenticationResponse>('authenticate-user', { 
      username, 
      password, 
      code: tfaCode 
    }),
    
  checkStatus: (username: string): Promise<UserStatusResponse> => 
    callFunction<UserStatusResponse>('check-user-status', { 
      username 
    })
};

/**
 * Password service for generating new passwords
 */
export const passwordService = {
  generate: (username: string): Promise<PasswordResponse> => 
    callFunction<PasswordResponse>('generate-password', { 
      username 
    })
};

/**
 * Two-factor authentication service
 */
export const twoFactorService = {
  generate: (username: string): Promise<TwoFactorResponse> => 
    callFunction<TwoFactorResponse>('generate-2fa', { 
      username 
    })
};
