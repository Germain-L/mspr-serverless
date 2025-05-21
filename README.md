# COFRAP User Management System - Serverless Implementation

This project implements a secure user management system using OpenFaaS on K3s for COFRAP. The system provides automated user account creation with strong password generation and 2FA functionality.

## Project Structure

```
mspr-serverless/
├── functions/               # OpenFaaS functions
│   ├── generate-password/   # Password generation function
│   ├── generate-2fa/        # 2FA setup function
│   └── authenticate/        # Authentication function
├── frontend/               # Web interface
│   ├── public/             # Static files
│   ├── src/                # Source files
│   ├── package.json        # Dependencies
│   └── Dockerfile          # Docker configuration
├── kubernetes/             # K8s manifests
├── docs/                   # Documentation
└── scripts/                # Utility scripts
    ├── build-frontend.sh   # Build and push frontend image
    ├── deploy-functions.sh # Deploy OpenFaaS functions
    └── deploy-frontend.sh  # Deploy frontend to K3s
```

## Prerequisites

- K3s cluster with OpenFaaS CE installed
- Container registry access (registry.germainleignel.com)
- OpenFaaS CLI (`faas-cli`)
- `kubectl` configured to access your cluster
- `docker` for building container images
- `node.js` and `npm` for frontend development

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/mspr-serverless.git
cd mspr-serverless
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# OpenFaaS
OPENFAAS_URL=http://your-openfaas-gateway:8080
OPENFAAS_PASSWORD=your_openfaas_password

# Registry
REGISTRY=registry.germainleignel.com/library

# Kubernetes
KUBE_NAMESPACE=cofrap
INGRESS_HOST=cofrap.germainleignel.com
```

### 3. Deploy OpenFaaS Functions

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy functions
./scripts/deploy-functions.sh
```

### 4. Build and Deploy Frontend

```bash
# Build frontend Docker image
./scripts/build-frontend.sh

# Deploy frontend to K3s
./scripts/deploy-frontend.sh
```

## Development

### Adding a New Function

1. Create a new function using the OpenFaaS CLI:
   ```bash
   cd functions
   faas-cli new function-name --lang python3
   ```

2. Update the `stack.yml` file with the correct image name and any required environment variables.

3. Add your function logic in the `handler.py` file.

4. Deploy the function:
   ```bash
   cd functions/function-name
   ../../scripts/deploy-functions.sh
   ```

### Testing Functions Locally

You can test functions locally using the OpenFaaS CLI:

```bash
# Build and run locally
faas-cli build -f functions/function-name/stack.yml
faas-cli local-run -f functions/function-name/stack.yml

# Test with curl
curl -X POST http://localhost:8080/function/function-name -d '{"key": "value"}'
```

### Frontend Development

For frontend development, you can use the development server:

```bash
cd frontend
npm install
npm start
```

This will start a development server at `http://localhost:3000` with hot reloading.

## API Documentation

### Generate Password

**Endpoint:** `POST /function/generate-password`

**Request Body:**
```json
{
  "username": "testuser"
}
```

**Response:**
```json
{
  "username": "testuser",
  "password": "generated-password",
  "qr_code": "base64-encoded-qr-code",
  "generated_at": "2025-05-21T10:00:00Z",
  "expires_at": "2025-11-17T10:00:00Z"
}
```

### Generate 2FA

**Endpoint:** `POST /function/generate-2fa`

**Request Body:**
```json
{
  "username": "testuser"
}
```

**Response:**
```json
{
  "username": "testuser",
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_code": "base64-encoded-qr-code",
  "generated_at": "2025-05-21T10:00:00Z",
  "expires_at": "2025-11-17T10:00:00Z"
}
```

### Authenticate

**Endpoint:** `POST /function/authenticate`

**Request Body:**
```json
{
  "username": "testuser",
  "password": "user-password",
  "two_fa_token": "123456"
}
```

**Response (Success):**
```json
{
  "message": "Authentication successful",
  "username": "testuser",
  "session_token": "dummy-session-token",
  "expires_in": 3600
}
```

**Response (Error):**
```json
{
  "error": "Invalid credentials",
  "requires_password_reset": false,
  "account_locked": false,
  "attempts_remaining": 2
}
```

## Deployment Architecture

The application is deployed using the following architecture:

1. **K3s Cluster**: Lightweight Kubernetes cluster running the application
2. **OpenFaaS**: Serverless framework for running functions
3. **Frontend**: React application served by Nginx
4. **Database**: (Optional) PostgreSQL database for persistent storage

## Security Considerations

- All sensitive data is encrypted at rest and in transit
- Passwords are never stored in plain text
- 2FA is required for all user authentication
- Rate limiting is implemented to prevent brute force attacks
- All API endpoints are protected with HTTPS

## Monitoring and Logging

- OpenFaaS provides built-in monitoring and logging
- Kubernetes logs can be accessed using `kubectl logs`
- Prometheus and Grafana can be added for advanced monitoring

## Troubleshooting

### Function Deployment Issues

- Check OpenFaaS logs: `faas-cli logs function-name`
- Verify the function is running: `faas-cli describe function-name`
- Check Kubernetes pods: `kubectl get pods -n openfaas-fn`

### Frontend Issues

- Check browser console for errors
- Verify the frontend service is running: `kubectl get svc cofrap-frontend`
- Check pod logs: `kubectl logs -l app=cofrap -c frontend`

### Network Issues

- Verify network policies allow traffic between services
- Check ingress configuration: `kubectl get ingress`
- Test service connectivity: `kubectl run -i --tty --rm debug --image=busybox -- sh`

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
