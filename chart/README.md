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
| `monitoring.enabled` | Enable monitoring | `true` |
| `monitoring.serviceMonitor.enabled` | Enable ServiceMonitor creation | `true` |
| `monitoring.serviceMonitor.namespace` | ServiceMonitor namespace | `monitoring` |
| `monitoring.serviceMonitor.interval` | Scrape interval | `30s` |
| `monitoring.prometheusRule.enabled` | Enable PrometheusRule creation | `true` |
| `monitoring.postgres.exporter.enabled` | Enable PostgreSQL metrics exporter | `true` |
| `monitoring.grafana.dashboard.enabled` | Enable Grafana dashboard creation | `true` |
| `monitoring.grafana.dashboard.namespace` | Grafana dashboard namespace | `monitoring` |
| `monitoring.grafana.dashboard.title` | Dashboard title | `MSPR Serverless Application` |

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

## Monitoring

This chart includes monitoring configuration for Prometheus. When `monitoring.enabled` is set to `true`, it will create:

- **ServiceMonitor**: For scraping metrics from the frontend and PostgreSQL exporter
- **PrometheusRule**: For alerting rules covering application health, resource usage, and database performance
- **PostgreSQL Exporter**: A sidecar container that exports PostgreSQL metrics

### Prerequisites for Monitoring

- Prometheus Operator installed in your cluster
- `kube-prometheus-chart` or similar Prometheus stack deployed
- ServiceMonitor discovery configured to match the labels in `monitoring.serviceMonitor.labels`

### Metrics Endpoints

- Frontend metrics: `http://frontend-service/metrics`
- PostgreSQL metrics: Available via the postgres-exporter sidecar on port 9187

### Alerting Rules

The chart includes several alerting rules:
- **FrontendDown**: Alerts when the frontend service is unavailable
- **PostgreSQLDown**: Alerts when PostgreSQL is unavailable
- **HighCPUUsage**: Alerts when CPU usage exceeds 80%
- **HighMemoryUsage**: Alerts when memory usage exceeds 80%
- **PostgreSQLConnectionsHigh**: Alerts when PostgreSQL connections exceed threshold
- **PostgreSQLSlowQueries**: Alerts when query efficiency drops below 10%

### Example Monitoring Configuration

```yaml
monitoring:
  enabled: true
  serviceMonitor:
    enabled: true
    namespace: monitoring
    labels:
      prometheus: kube-prometheus
    interval: 30s
  prometheusRule:
    enabled: true
    namespace: monitoring
  postgres:
    exporter:
      enabled: true
  grafana:
    dashboard:
      enabled: true
      namespace: monitoring
      title: "MSPR Serverless Application"
```
