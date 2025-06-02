# MSPR Serverless Deployment Scripts

This directory contains all the deployment and management scripts for the MSPR Serverless project.

## Scripts Overview

### � `setup-env.sh`
**Environment setup script** - Automatically detects and configures OpenFaaS settings.

**What it does:**
- Detects current OpenFaaS gateway from faas-cli config
- Sets OPENFAAS_URL environment variable automatically
- Tests authentication status
- Provides guidance for manual setup if needed

**Usage:**
```bash
./scripts/setup-env.sh
```

### �🚀 `deploy.sh`
**Main deployment script** - Builds, pushes, and deploys the entire application stack.

**What it does:**
- Builds and pushes the frontend Docker image
- Builds, pushes, and deploys OpenFaaS functions
- Deploys the Helm chart with monitoring enabled
- Validates the deployment and tests monitoring endpoints

**Prerequisites:**
- Docker logged in to `registry.germainleignel.com`
- OpenFaaS gateway configured: `export OPENFAAS_URL=http://your-gateway:8080`
- OpenFaaS authentication: `faas-cli login --gateway $OPENFAAS_URL`
- kubectl configured for your cluster

**Usage:**
```bash
./scripts/deploy.sh
```

### 🧹 `cleanup.sh`
**Cleanup script** - Removes all deployed resources.

**What it does:**
- Removes OpenFaaS functions
- Uninstalls Helm release
- Removes monitoring resources (ServiceMonitor, PrometheusRule)
- Deletes the application namespace
- Optionally deletes monitoring namespace

**Usage:**
```bash
./scripts/cleanup.sh
```

### 🧪 `test-monitoring.sh`
**Monitoring test script** - Validates that monitoring endpoints are working.

**What it does:**
- Tests frontend `/metrics` endpoint
- Tests PostgreSQL exporter metrics
- Verifies ServiceMonitor and PrometheusRule creation
- Reports status of all monitoring components

**Usage:**
```bash
./scripts/test-monitoring.sh
```

### 🔧 `test-functions.py`
**Function integration test script** - Tests all OpenFaaS functions end-to-end.

**What it does:**
- Tests password generation and user creation
- Tests 2FA generation and QR code creation
- Tests user authentication with 2FA
- Tests user status checking and expiration
- Provides detailed test reports

**Prerequisites:**
- Python 3 with required packages: `pip install -r scripts/test_requirements.txt`
- OpenFaaS functions deployed and accessible

**Usage:**
```bash
cd scripts
pip install -r test_requirements.txt
python test-functions.py
```

## Quick Start

1. **Set up environment (automatic):**
   ```bash
   ./scripts/setup-env.sh
   ```

2. **Deploy everything:**
   ```bash
   ./scripts/deploy.sh
   ```

3. **Test monitoring (optional):**
   ```bash
   ./scripts/test-monitoring.sh
   ```

4. **Test functions (optional):**
   ```bash
   cd scripts
   pip install -r test_requirements.txt
   python test-functions.py
   ```

5. **Clean up when done:**
   ```bash
   ./scripts/cleanup.sh
   ```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENFAAS_URL` | OpenFaaS gateway URL | `http://gateway:8080` |

## Troubleshooting

### OpenFaaS Issues
- **Authentication failed**: Run `faas-cli login --gateway $OPENFAAS_URL`
- **Gateway unreachable**: Check `OPENFAAS_URL` and network connectivity
- **Functions not deploying**: Verify OpenFaaS is running and accessible

### Docker Issues
- **Image push failed**: Ensure you're logged in: `docker login registry.germainleignel.com`
- **Build failed**: Check Docker daemon is running

### Kubernetes Issues
- **Namespace conflicts**: Run cleanup script first
- **Monitoring not working**: Ensure `kube-prometheus-chart` is deployed

## Monitoring Integration

The deployment automatically sets up monitoring with:
- **ServiceMonitor**: Configures Prometheus to scrape metrics
- **PrometheusRule**: Sets up alerting rules
- **PostgreSQL Exporter**: Exports database metrics
- **Frontend Metrics**: Custom `/metrics` endpoint

Metrics are available at:
- Frontend: `http://frontend-service/metrics`
- PostgreSQL: `postgres-service:9187/metrics`
