# OpenFaaS Functions Documentation

This documentation provides comprehensive information on how to access and use the OpenFaaS functions in this project, both through external ingress and internal Kubernetes DNS.

## Overview

The project contains 4 OpenFaaS functions deployed to the cluster:
- `generate-password`: Creates new users with secure passwords
- `generate-2fa`: Sets up 2FA (TOTP) for users
- `authenticate-user`: Authenticates users with password and 2FA
- `check-user-status`: Checks user account status

## Function Details

### 1. generate-password
**Purpose**: Creates a new user with a randomly generated secure password

**Request**:
```json
{
  "username": "example_user"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "User created successfully",
  "user_id": 123,
  "password": "SecurePassword123!",
  "qr_code": "base64_encoded_qr_code"
}
```

### 2. generate-2fa
**Purpose**: Generates and configures TOTP-based 2FA for a user

**Request**:
```json
{
  "username": "example_user"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "2FA secret generated and saved",
  "secret": "BASE32_SECRET",
  "qr_code": "base64_encoded_qr_code"
}
```

### 3. authenticate-user
**Purpose**: Authenticates a user with password and optional 2FA

**Request**:
```json
{
  "username": "example_user",
  "password": "SecurePassword123!",
  "totp_code": "123456"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Authentication successful",
  "authenticated": true
}
```

### 4. check-user-status
**Purpose**: Checks if a user exists and their account status

**Request**:
```json
{
  "username": "example_user"
}
```

**Response**:
```json
{
  "status": "success",
  "exists": true,
  "expired": false,
  "has_2fa": true
}
```

## Access Methods

### 1. External Access via Ingress

The OpenFaaS gateway is accessible externally at: `https://openfaas.germainleignel.com`

#### Using curl:

```bash
# Generate password for new user
curl -X POST https://openfaas.germainleignel.com/function/generate-password \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe"}'

# Generate 2FA for user
curl -X POST https://openfaas.germainleignel.com/function/generate-2fa \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe"}'

# Authenticate user
curl -X POST https://openfaas.germainleignel.com/function/authenticate-user \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "password": "SecurePassword123!", "totp_code": "123456"}'

# Check user status
curl -X POST https://openfaas.germainleignel.com/function/check-user-status \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe"}'
```

#### Using Python requests:

```python
import requests
import json

# Base URL for OpenFaaS gateway
BASE_URL = "https://openfaas.germainleignel.com/function"

# Generate password
response = requests.post(
    f"{BASE_URL}/generate-password",
    headers={"Content-Type": "application/json"},
    json={"username": "john_doe"}
)
print(response.json())

# Generate 2FA
response = requests.post(
    f"{BASE_URL}/generate-2fa",
    headers={"Content-Type": "application/json"},
    json={"username": "john_doe"}
)
print(response.json())

# Authenticate user
response = requests.post(
    f"{BASE_URL}/authenticate-user",
    headers={"Content-Type": "application/json"},
    json={
        "username": "john_doe",
        "password": "SecurePassword123!",
        "totp_code": "123456"
    }
)
print(response.json())

# Check user status
response = requests.post(
    f"{BASE_URL}/check-user-status",
    headers={"Content-Type": "application/json"},
    json={"username": "john_doe"}
)
print(response.json())
```

#### Using JavaScript/fetch:

```javascript
const baseUrl = 'https://openfaas.germainleignel.com/function';

// Generate password
const generatePassword = async (username) => {
  const response = await fetch(`${baseUrl}/generate-password`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username})
  });
  return response.json();
};

// Generate 2FA
const generate2FA = async (username) => {
  const response = await fetch(`${baseUrl}/generate-2fa`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username})
  });
  return response.json();
};

// Authenticate user
const authenticateUser = async (username, password, totpCode) => {
  const response = await fetch(`${baseUrl}/authenticate-user`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      username,
      password,
      totp_code: totpCode
    })
  });
  return response.json();
};

// Check user status
const checkUserStatus = async (username) => {
  const response = await fetch(`${baseUrl}/check-user-status`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username})
  });
  return response.json();
};
```

### 2. Internal Access via Kubernetes DNS

When accessing functions from within the Kubernetes cluster, you can use the internal service DNS names.

#### Service Discovery

OpenFaaS functions are typically accessible via the OpenFaaS gateway service in the `openfaas` namespace:

- **Service Name**: `gateway.openfaas.svc.cluster.local`
- **Port**: `8080` (HTTP)

#### Internal curl examples:

```bash
# From within a pod in the cluster
# Generate password
curl -X POST http://gateway.openfaas.svc.cluster.local:8080/function/generate-password \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe"}'

# Generate 2FA
curl -X POST http://gateway.openfaas.svc.cluster.local:8080/function/generate-2fa \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe"}'

# Authenticate user
curl -X POST http://gateway.openfaas.svc.cluster.local:8080/function/authenticate-user \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "password": "SecurePassword123!", "totp_code": "123456"}'

# Check user status
curl -X POST http://gateway.openfaas.svc.cluster.local:8080/function/check-user-status \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe"}'
```

#### Internal Python example:

```python
import requests
import json

# Internal base URL for OpenFaaS gateway
INTERNAL_BASE_URL = "http://gateway.openfaas.svc.cluster.local:8080/function"

def call_function_internal(function_name, payload):
    """Call an OpenFaaS function from within the cluster"""
    response = requests.post(
        f"{INTERNAL_BASE_URL}/{function_name}",
        headers={"Content-Type": "application/json"},
        json=payload,
        timeout=30
    )
    return response.json()

# Usage examples
user_data = call_function_internal("generate-password", {"username": "john_doe"})
totp_data = call_function_internal("generate-2fa", {"username": "john_doe"})
auth_result = call_function_internal("authenticate-user", {
    "username": "john_doe",
    "password": user_data["password"],
    "totp_code": "123456"
})
status = call_function_internal("check-user-status", {"username": "john_doe"})
```

#### Accessing from Frontend Application

Your frontend application (deployed at `cofrap.germainleignel.com`) can access the functions via the external URL in production:

```javascript
// In your Svelte frontend
const API_BASE_URL = 'https://openfaas.germainleignel.com/function';

export const userService = {
  async createUser(username) {
    const response = await fetch(`${API_BASE_URL}/generate-password`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username})
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  async setup2FA(username) {
    const response = await fetch(`${API_BASE_URL}/generate-2fa`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username})
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  async authenticate(username, password, totpCode) {
    const response = await fetch(`${API_BASE_URL}/authenticate-user`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username,
        password,
        totp_code: totpCode
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  async checkStatus(username) {
    const response = await fetch(`${API_BASE_URL}/check-user-status`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username})
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};
```

## Environment Configuration

### Required Environment Variables

The functions require the following environment variables to be set:

```bash
# Database connection
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=5432

# Encryption key for 2FA secrets (functions that use 2FA)
ENCRYPTION_KEY=bA8tcGhp8hZsSSqIEv1hGUvrfUuiyB8XMCICfSmrV3k=
```

### Function-specific Environment Variables

- **generate-2fa**: Requires `ENCRYPTION_KEY`
- **authenticate-user**: Requires `ENCRYPTION_KEY`
- **generate-password**: Only requires database environment variables
- **check-user-status**: Only requires database environment variables

## Monitoring and Metrics

The `authenticate-user` function includes a metrics endpoint accessible at:
- **External**: `https://openfaas.germainleignel.com/function/authenticate-user/metrics`
- **Internal**: `http://authenticate-user.openfaas-fn.svc.cluster.local:8080/metrics`

## Security Considerations

1. **HTTPS**: All external access should use HTTPS
2. **Authentication**: Consider implementing API authentication for production use
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Input Validation**: All functions include basic input validation
5. **Encryption**: 2FA secrets are encrypted before storage using Fernet encryption

## Error Handling

All functions return standardized error responses:

```json
{
  "status": "error",
  "message": "Detailed error message",
  "error_code": "ERROR_TYPE"
}
```

Common error codes:
- `INVALID_INPUT`: Invalid or missing request parameters
- `USER_NOT_FOUND`: User does not exist
- `USER_EXISTS`: User already exists (for create operations)
- `AUTHENTICATION_FAILED`: Invalid credentials
- `DATABASE_ERROR`: Database connection or query error
- `ACCOUNT_EXPIRED`: User account has expired

## Testing

You can test the functions using the provided test files:

```bash
# Run tests for individual functions
cd functions/generate-password && python -m pytest handler_test.py
cd functions/generate-2fa && python -m pytest handler_test.py
cd functions/authenticate-user && python -m pytest handler_test.py
cd functions/check-user-status && python -m pytest handler_test.py
```

## Deployment

Functions are deployed using the OpenFaaS CLI:

```bash
# Deploy all functions
faas-cli deploy -f functions/stack.yaml

# Deploy individual function
faas-cli deploy -f functions/stack.yaml --filter generate-password
```

## Troubleshooting

### Common Issues

1. **Connection Timeouts**: Check if OpenFaaS gateway is accessible
2. **Database Errors**: Verify database connection parameters
3. **404 Errors**: Ensure function names are correct and functions are deployed
4. **500 Errors**: Check function logs for detailed error information

### Checking Function Logs

```bash
# View function logs
faas-cli logs generate-password
faas-cli logs generate-2fa
faas-cli logs authenticate-user
faas-cli logs check-user-status
```

### Function Health Checks

```bash
# Check if functions are running
faas-cli list

# Get function details
faas-cli describe generate-password
```
