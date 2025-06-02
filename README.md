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
- `scripts/` - Deployment and management scripts

## Features

- User authentication with bcrypt password hashing
- Two-factor authentication (2FA) using TOTP
- Account expiration management
- PostgreSQL database integration
- Kubernetes deployment with Helm
- Prometheus monitoring with custom metrics and alerting

## Quick Start

### Prerequisites
```bash
# Login to Docker registry
docker login registry.germainleignel.com

# Login to OpenFaaS (if not already done)
faas-cli login --gateway https://your-openfaas-gateway
```

### Automated Setup
```bash
# Set up environment automatically
./scripts/setup-env.sh

# Deploy the complete application stack
./deploy.sh
```

### Test Monitoring (Optional)
```bash
# Verify monitoring endpoints
./scripts/test-monitoring.sh
```

### Cleanup
```bash
# Remove all deployed resources
./scripts/cleanup.sh
```

## Manual Deployment

If you prefer to deploy components individually:

## Manual Deployment

If you prefer to deploy components individually:

1. **Build and Deploy Functions**:
   ```bash
   cd functions
   faas-cli build -f stack.yaml
   faas-cli push -f stack.yaml
   faas-cli deploy -f stack.yaml --gateway $OPENFAAS_URL
   ```

2. **Build and Push Frontend**:
   ```bash
   cd frontend
   docker build -t registry.germainleignel.com/library/frontend:latest .
   docker push registry.germainleignel.com/library/frontend:latest
   ```

3. **Deploy with Helm**:
   ```bash
   helm upgrade --install mspr-serverless ./chart \
     --namespace cofrap \
     --create-namespace \
     --set monitoring.enabled=true
   ```

## Monitoring

The application includes comprehensive monitoring with:
- **Prometheus metrics** from frontend and PostgreSQL
- **Custom alerting rules** for application health
- **ServiceMonitor and PrometheusRule** for Prometheus Operator
- **PostgreSQL exporter** for database metrics

See `scripts/README.md` for detailed information about deployment scripts and monitoring setup.