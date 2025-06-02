# MSPR Serverless Helm Chart

This Helm chart deploys the MSPR Serverless application stack to a Kubernetes cluster.

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
| `namespace` | Kubernetes namespace | `mspr-serverless` |
| `postgresql.enabled` | Enable PostgreSQL | `true` |
| `postgresql.auth.database` | PostgreSQL database name | `mydatabase` |
| `postgresql.auth.username` | PostgreSQL username | `myuser` |
| `postgresql.auth.password` | PostgreSQL password | `mypassword` |
| `postgresql.persistence.size` | PostgreSQL PVC size | `8Gi` |
| `frontend.enabled` | Enable frontend deployment | `true` |
| `frontend.replicaCount` | Number of frontend replicas | `1` |
| `frontend.image.repository` | Frontend image repository | `your-frontend-image` |
| `frontend.image.tag` | Frontend image tag | `latest` |
| `frontend.ingress.enabled` | Enable ingress for frontend | `true` |
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
kubectl get pods -n mspr-serverless
```

## Accessing the Application

- Frontend: Access through the ingress hostname configured in `values.yaml`
- Adminer: Port-forward to the adminer service:
  ```bash
  kubectl port-forward svc/mspr-serverless-adminer 8080:8080 -n mspr-serverless
  ```
  Then open http://localhost:8080 in your browser.

## Persistence

The PostgreSQL data is stored in a PersistentVolumeClaim. The data is retained even if the pod is deleted.

## Custom Configuration

You can customize the deployment by creating a custom `values.yaml` file and using it during installation:

```bash
helm install mspr-serverless ./chart -f my-values.yaml
```
