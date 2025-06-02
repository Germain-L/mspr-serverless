import type { 
  AuthResponse, 
  CreateUserResponse, 
  CheckUserResponse, 
  Generate2FAResponse 
} from '$lib/types/auth';

// Get API base URL from environment variables, with fallback
const API_BASE = import.meta.env.VITE_API_BASE || 'https://openfaas.germainleignel.com/function';

export class AuthAPI {
  private static async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    try {
      console.log(`Making API request to: ${API_BASE}/${endpoint}`);
      
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
        // Add CORS mode for cross-origin requests
        mode: 'cors'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status}: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      // Provide more detailed error information
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Could not connect to ${API_BASE}/${endpoint}. Please check if the API server is running.`);
      }
      throw error;
    }
  }

  static async createUser(username: string): Promise<CreateUserResponse> {
    return this.makeRequest<CreateUserResponse>('generate-password', { username });
  }

  static async setup2FA(username: string): Promise<Generate2FAResponse> {
    return this.makeRequest<Generate2FAResponse>('generate-2fa', { username });
  }

  static async authenticate(
    username: string, 
    password: string, 
    totp_code?: string
  ): Promise<AuthResponse> {
    const payload: any = { username, password };
    if (totp_code) {
      payload.totp_code = totp_code;
    }
    return this.makeRequest<AuthResponse>('authenticate-user', payload);
  }

  static async checkUserStatus(username: string): Promise<CheckUserResponse> {
    return this.makeRequest<CheckUserResponse>('check-user-status', { username });
  }
}
