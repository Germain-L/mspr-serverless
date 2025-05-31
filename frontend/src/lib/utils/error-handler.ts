export function handleApiError(error: any): string {
  // Handle string errors directly
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle error objects with an error property
  if (error?.error) {
    const errorMsg = error.error;
    
    if (errorMsg.includes('Invalid username or password')) {
      return 'Invalid credentials. Please check your username and password.';
    }
    if (errorMsg.includes('Account has expired')) {
      return 'Your account has expired. Please contact support or create a new account.';
    }
    if (errorMsg.includes('TOTP code is required')) {
      return 'Please enter your 2FA authentication code.';
    }
    if (errorMsg.includes('Invalid TOTP code')) {
      return 'Invalid 2FA code. Please check your authenticator app and try again.';
    }
    if (errorMsg.includes('User already exists')) {
      return 'Username already exists. Please choose a different username.';
    }
    if (errorMsg.includes('User does not exist')) {
      return 'User not found. Please check your username or create a new account.';
    }
    
    return errorMsg;
  }
  
  // Handle generic Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

export function isValidUsername(username: string): boolean {
  return username.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(username);
}

export function isValidTOTP(code: string): boolean {
  return /^\d{6}$/.test(code);
}
