/**
 * Type definitions for API responses from OpenFaaS functions
 */

export interface ApiResponse<T> {
  statusCode: number;
  body: string; // JSON string that will be parsed
}

export interface ErrorResponse {
  error: string;
}

export interface PasswordResponse {
  status: string;
  message: string;
  user_id: number;
  password: string;
  qr_code: string; // Base64 encoded QR code image
}

export interface TwoFactorResponse {
  status: string;
  message: string;
  user_id: number;
  qr_code: string; // Base64 encoded QR code image
}

export interface AuthenticationResponse {
  status: string;
  message: string;
  user_id: number;
  username: string;
  expired: boolean;
}

export interface UserStatusResponse {
  status: string;
  message: string;
  user_id: number;
  username: string;
  expired: boolean;
}
