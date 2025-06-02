# MSPR Serverless Application

This project implements a serverless application built with OpenFaaS and SvelteKit.

## Project Structure

- `frontend/` - SvelteKit frontend application
- `functions/` - OpenFaaS serverless functions
  - `authenticate-user/` - User authentication with 2FA support
  - `check-user-status/` - Check user status and expiration
  - `generate-2fa/` - Generate 2FA secrets and QR codes
  - `generate-password/` - Generate secure passwords and create users
- `chart/` - Helm chart for Kubernetes deployment

## Features

- User authentication with bcrypt password hashing
- Two-factor authentication (2FA) using TOTP
- Account expiration management
- PostgreSQL database integration
- Kubernetes deployment with Helm

## Deployment

1. **Build and Deploy Functions**:
   ```bash
   cd functions
   faas-cli build -f stack.yaml
   faas-cli deploy -f stack.yaml
   ```

2. **Deploy Frontend**:
   ```bash
   cd frontend
   npm run build
   # Deploy using your container registry
   ```

3. **Apply Kubernetes Resources**:
   ```bash
   helm upgrade --install mspr-serverless ./chart \
     --namespace cofrap \
     --create-namespace
   ```