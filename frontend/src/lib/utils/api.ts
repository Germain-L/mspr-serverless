import type { 
  AuthResponse, 
  CreateUserResponse, 
  CheckUserResponse, 
  Generate2FAResponse 
} from '$lib/types/auth';

// Use local API routes instead of external OpenFaaS
const API_BASE = '/api/auth';

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
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  static async createUser(username: string): Promise<CreateUserResponse> {
    return this.makeRequest<CreateUserResponse>('create-user', { username });
  }

  static async setup2FA(username: string): Promise<Generate2FAResponse> {
    return this.makeRequest<Generate2FAResponse>('setup-2fa', { username });
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
    return this.makeRequest<AuthResponse>('authenticate', payload);
  }

  static async checkUserStatus(username: string): Promise<CheckUserResponse> {
    return this.makeRequest<CheckUserResponse>('check-user', { username });
  }
}
