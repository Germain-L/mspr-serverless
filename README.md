# MSPR Serverless Application with Metrics

This project implements a comprehensive monitoring solution for a serverless application built with OpenFaaS and SvelteKit.

## 📊 Metrics Implementation

### ✅ Completed Features

#### 1. **OpenFaaS Function Metrics**
- **Prometheus Client Integration**: Added `prometheus-client==0.17.1` to all function requirements
- **Shared Metrics Module**: Created `shared_metrics.py` with common metrics for all functions
- **Request Tracking**: Automatic tracking of request count, duration, and active requests
- **Authentication Metrics**: Tracks authentication attempts, success/failure rates
- **2FA Metrics**: Monitors 2FA operations (setup, verification)
- **Database Metrics**: Tracks database operations, connection errors, query performance
- **Metrics Endpoints**: Each function exposes `/metrics` endpoint for Prometheus scraping

**Available Metrics:**
- `function_requests_total` - Total function invocations by function, method, status code
- `function_request_duration_seconds` - Request duration histograms
- `function_active_requests` - Active request gauge
- `function_db_operations_total` - Database operations by type and status
- `function_db_connection_errors_total` - Database connection errors
- `function_authentication_attempts_total` - Authentication attempts by result
- `function_2fa_operations_total` - 2FA operations by type and status

#### 2. **Frontend Metrics (SvelteKit)**
- **Prometheus Client**: Added `prom-client` npm package
- **HTTP Request Tracking**: Middleware in `hooks.server.ts` tracks all requests
- **Application Metrics**: Authentication, registration, 2FA, page views
- **Error Tracking**: API errors and failure rates
- **Metrics Endpoint**: `/metrics` route for Prometheus scraping

**Available Metrics:**
- `http_requests_total` - HTTP requests by method, route, status code
- `http_request_duration_seconds` - Request duration histograms
- `active_connections` - Active connection gauge
- `authentication_attempts_total` - Auth attempts by result
- `registration_attempts_total` - Registration attempts by result
- `two_factor_operations_total` - 2FA operations by type and result
- `page_views_total` - Page views by route
- `api_errors_total` - API errors by endpoint and type

#### 3. **Kubernetes Monitoring Resources**
- **ServiceMonitor**: Automatic service discovery for Prometheus scraping
- **PrometheusRule**: Comprehensive alerting rules for all components
- **Grafana Dashboard**: Pre-configured dashboard as ConfigMap

#### 4. **Alerting Rules**
- Frontend error rate and latency alerts
- Authentication failure spike detection
- Database connection and operation error alerts
- 2FA failure rate monitoring
- Function availability and performance alerts

#### 5. **Grafana Integration**
- **Dashboard ConfigMap**: Automatically deployed dashboard
- **Visual Metrics**: Request rates, error rates, response times
- **Component Health**: Status of all application components
- **Real-time Monitoring**: 30-second refresh intervals

### 🔧 Configuration

#### Helm Chart Values
```yaml
monitoring:
  enabled: true
  serviceMonitor:
    enabled: true
    interval: 30s
    scrapeTimeout: 10s
  prometheusRule:
    enabled: true
  grafana:
    dashboards:
      enabled: true
```

#### Prometheus Integration
- ServiceMonitor targets both frontend and OpenFaaS functions
- Automatic scraping of `/metrics` endpoints
- Configurable scrape intervals and timeouts

#### Grafana Dashboard
- Located at: `grafana/dashboards/mspr-serverless.json`
- Also available as Kubernetes ConfigMap for automatic provisioning
- Covers all application components with visual metrics

### 🚀 Deployment

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
     --create-namespace \
     --set monitoring.enabled=true
   ```

### 📈 Monitoring Endpoints

- **Frontend Metrics**: `https://your-frontend-domain/metrics`
- **Function Metrics**: `https://openfaas-gateway/function/{function-name}/metrics`
- **Grafana Dashboard**: Available in your Grafana instance with the label `grafana_dashboard: "1"`

### 🎯 Key Performance Indicators

1. **Availability**: Function uptime and response rates
2. **Performance**: Response times and throughput
3. **Security**: Authentication success rates and failure patterns
4. **Reliability**: Error rates and database connectivity
5. **User Experience**: Page load times and user journey metrics

### 📊 Sample Queries

**Authentication Success Rate**:
```promql
sum(rate(function_authentication_attempts_total{result="success"}[5m])) / 
sum(rate(function_authentication_attempts_total[5m]))
```

**Frontend Error Rate**:
```promql
sum(rate(http_requests_total{status_code=~"5.."}[5m])) / 
sum(rate(http_requests_total[5m]))
```

**Function Response Time P95**:
```promql
histogram_quantile(0.95, rate(function_request_duration_seconds_bucket[5m]))
```