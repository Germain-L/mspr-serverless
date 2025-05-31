export interface User {
  id: number;
  username: string;
  has_2fa: boolean;
  expired: boolean;
}

export interface AuthResponse {
  status: string;
  message: string;
  user_id?: number;
  has_2fa?: boolean;
  error?: string;
}

export interface CreateUserResponse {
  status: string;
  user_id: number;
  password: string;
  qr_code: string;
  error?: string;
}

export interface CheckUserResponse {
  exists: boolean;
  has_2fa: boolean;
  expired: boolean;
  error?: string;
}

export interface Generate2FAResponse {
  status: string;
  qr_code: string;
  secret?: string;
  error?: string;
}
