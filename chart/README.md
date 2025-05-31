# MSPR Serverless Helm Chart

This Helm chart deploys the MSPR Serverless application stack to a Kubernetes cluster.

## Architecture

The application uses a modern serverless architecture with the following components:

- **Frontend**: SvelteKit application with server-side API routes
- **Functions**: OpenFaaS functions for authentication and user management
- **Database**: PostgreSQL for data persistence
- **Admin**: Adminer for database administration

### API Flow

```
Browser → SvelteKit Frontend → SvelteKit API Routes → OpenFaaS Functions → PostgreSQL
```

The frontend now acts as a proxy to OpenFaaS functions, providing better security by:
- Keeping OpenFaaS functions internal to the cluster
- Eliminating CORS issues
- Centralizing error handling and logging
- Enabling server-side authentication and rate limiting

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- PV provisioner support in the underlying infrastructure

## Installing the Chart

To install the chart with the release name `mspr-serverless`:

```bash
helm install mspr-serverless ./chart
```

## Uninstalling the Chart

To uninstall/delete the `mspr-serverless` deployment:

```bash
helm uninstall mspr-serverless
```

## Configuration

The following table lists the configurable parameters of the MSPR Serverless chart and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `namespace` | Kubernetes namespace | `cofrap` |
| `openfaas.gatewayInternal` | OpenFaaS gateway internal endpoint | `http://gateway.openfaas.svc.cluster.local:8080` |
| `postgresql.enabled` | Enable PostgreSQL | `true` |
| `postgresql.auth.database` | PostgreSQL database name | `cofrap` |
| `postgresql.auth.username` | PostgreSQL username | `postgres` |
| `postgresql.auth.password` | PostgreSQL password | `password` |
| `postgresql.persistence.size` | PostgreSQL PVC size | `5Gi` |
| `postgresql.persistence.storageClass` | PostgreSQL storage class | `longhorn` |
| `frontend.enabled` | Enable frontend deployment | `true` |
| `frontend.replicaCount` | Number of frontend replicas | `1` |
| `frontend.image.repository` | Frontend image repository | `registry.germainleignel.com/library/frontend` |
| `frontend.image.tag` | Frontend image tag | `latest` |
| `frontend.containerPort` | Frontend container port | `3000` |
| `frontend.ingress.enabled` | Enable ingress for frontend | `true` |
| `frontend.ingress.className` | Ingress class name | `traefik` |
| `adminer.enabled` | Enable Adminer | `true` |
| `migrations.enabled` | Enable database migrations | `true` |

## Upgrading

To upgrade the installation with the release name `mspr-serverless`:

```bash
helm upgrade mspr-serverless ./chart
```

## Testing the Installation

You can test the installation by checking the status of the pods:

```bash
kubectl get pods -n cofrap
```

### Test the API Flow

1. Check that the frontend is running:
   ```bash
   kubectl logs -l app=frontend -n cofrap
   ```

2. Test the API endpoints:
   ```bash
   # Test user creation (replace with your domain)
   curl -X POST https://cofrap.germainleignel.com/api/auth/check-user \
     -H "Content-Type: application/json" \
     -d '{"username": "testuser"}'
   ```

## Accessing the Application

- **Frontend**: Access through the ingress hostname configured in `values.yaml` (default: https://cofrap.germainleignel.com)
- **Adminer**: Port-forward to the adminer service:
  ```bash
  kubectl port-forward svc/adminer 8080:8080 -n cofrap
  ```
  Then open http://localhost:8080 in your browser.

## OpenFaaS Integration

This chart assumes OpenFaaS is already deployed in your cluster. The frontend communicates with OpenFaaS functions through the internal gateway endpoint.

### Required OpenFaaS Functions

Deploy the following functions using the `functions/stack.yaml`:

- `authenticate-user`: User authentication with optional 2FA
- `check-user-status`: Check if user exists and has 2FA enabled
- `generate-password`: Create new user with generated password
- `generate-2fa`: Setup 2FA for existing user

```bash
# Deploy OpenFaaS functions
cd functions
faas-cli deploy -f stack.yaml
```

## Persistence

The PostgreSQL data is stored in a PersistentVolumeClaim. The data is retained even if the pod is deleted.

## Custom Configuration

You can customize the deployment by creating a custom `values.yaml` file and using it during installation:

```bash
helm install mspr-serverless ./chart -f my-values.yaml
```

### Development Configuration

For local development, use the provided development values:

```bash
helm install mspr-serverless ./chart -f values-dev.yaml
```

This configuration:
- Uses local OpenFaaS gateway endpoint
- Disables ingress and uses NodePort for frontend access
- Uses smaller persistent volumes
- Uses development-friendly settings
