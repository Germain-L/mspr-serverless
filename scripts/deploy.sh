#!/bin/bash

# Complete deployment script for MSPR Serverless with monitoring
# This script builds, pushes, and deploys the entire application stack

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="registry.germainleignel.com"
FRONTEND_IMAGE="$REGISTRY/library/frontend:latest"
NAMESPACE="cofrap"
HELM_RELEASE="mspr-serverless"
MONITORING_NAMESPACE="monitoring"

echo -e "${BLUE}🚀 Starting complete MSPR Serverless deployment...${NC}"
echo ""
echo -e "${YELLOW}📋 Prerequisites:${NC}"
echo "   - Docker logged in to registry.germainleignel.com"
echo "   - OpenFaaS gateway URL set: export OPENFAAS_URL=http://your-gateway:8080"
echo "   - OpenFaaS authentication: faas-cli login --gateway \$OPENFAAS_URL"
echo "   - kubectl configured for your cluster"
echo ""

# Function to print colored output
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
log_info "Checking prerequisites..."

# Check if docker is available
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed or not in PATH"
    exit 1
fi

# Check if faas-cli is available
if ! command -v faas-cli &> /dev/null; then
    log_error "faas-cli is not installed or not in PATH"
    exit 1
fi

# Check if helm is available
if ! command -v helm &> /dev/null; then
    log_error "Helm is not installed or not in PATH"
    exit 1
fi

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if OpenFaaS gateway is configured
log_info "Checking OpenFaaS configuration..."

# Try to get the gateway URL from faas-cli config or environment
if [ -z "$OPENFAAS_URL" ]; then
    # Try to detect gateway from faas-cli config
    DETECTED_GATEWAY=$(faas-cli version 2>/dev/null | grep -A1 "Gateway" | grep "uri:" | awk '{print $2}' || echo "")
    if [ -n "$DETECTED_GATEWAY" ]; then
        log_info "No OPENFAAS_URL set, but detected gateway from faas-cli: $DETECTED_GATEWAY"
        export OPENFAAS_URL="$DETECTED_GATEWAY"
    else
        log_error "OPENFAAS_URL environment variable is not set and no gateway detected."
        log_info "Please set it with: export OPENFAAS_URL=https://your-gateway-url"
        log_info "Or login to faas-cli first: faas-cli login --gateway https://your-gateway-url"
        exit 1
    fi
fi

log_info "Using OpenFaaS gateway: $OPENFAAS_URL"

# Check if OpenFaaS authentication is working
log_info "Testing OpenFaaS authentication..."
if ! faas-cli list --gateway "$OPENFAAS_URL" >/dev/null 2>&1; then
    log_error "OpenFaaS authentication failed or gateway unreachable."
    log_info "Please login first:"
    log_info "  faas-cli login --gateway $OPENFAAS_URL --username admin --password-stdin"
    log_info "  (Enter your OpenFaaS password when prompted)"
    exit 1
fi

log_success "OpenFaaS configuration validated"
log_success "All prerequisites are available"

# Step 1: Build and push frontend
log_info "Step 1: Building and pushing frontend image..."
cd frontend

if docker build -t $FRONTEND_IMAGE .; then
    log_success "Frontend image built successfully"
else
    log_error "Failed to build frontend image"
    exit 1
fi

if docker push $FRONTEND_IMAGE; then
    log_success "Frontend image pushed successfully"
else
    log_error "Failed to push frontend image"
    exit 1
fi

cd ..

# Step 2: Build, push and deploy OpenFaaS functions
log_info "Step 2: Building, pushing and deploying OpenFaaS functions..."
cd functions

log_info "Building functions..."
if faas-cli build -f stack.yaml; then
    log_success "Functions built successfully"
else
    log_error "Failed to build functions"
    exit 1
fi

log_info "Pushing functions..."
if faas-cli push -f stack.yaml; then
    log_success "Functions pushed successfully"
else
    log_error "Failed to push functions"
    exit 1
fi

log_info "Deploying functions to gateway: $OPENFAAS_URL..."
if faas-cli deploy -f stack.yaml --gateway "$OPENFAAS_URL"; then
    log_success "Functions deployed successfully"
else
    log_error "Failed to deploy functions"
    exit 1
fi

cd ..

# Step 3: Create monitoring namespace (Helm will create the main namespace)
log_info "Step 3: Creating monitoring namespace..."

if ! kubectl get namespace $MONITORING_NAMESPACE >/dev/null 2>&1; then
    log_warning "Monitoring namespace $MONITORING_NAMESPACE does not exist. Creating it..."
    kubectl create namespace $MONITORING_NAMESPACE
    log_success "Namespace $MONITORING_NAMESPACE created"
else
    log_info "Monitoring namespace $MONITORING_NAMESPACE already exists"
fi

# Step 4: Deploy Helm chart with monitoring
log_info "Step 4: Deploying Helm chart with monitoring enabled..."

# First validate the chart
log_info "Validating Helm chart..."
if helm lint ./chart; then
    log_success "Helm chart validation passed"
else
    log_error "Helm chart validation failed"
    exit 1
fi

# Deploy the chart
log_info "Installing/upgrading Helm release: $HELM_RELEASE"
if helm upgrade --install $HELM_RELEASE ./chart \
  --namespace $NAMESPACE \
  --set frontend.image.repository=$REGISTRY/library/frontend \
  --set frontend.image.tag=latest \
  --set monitoring.enabled=true \
  --set monitoring.serviceMonitor.enabled=true \
  --set monitoring.serviceMonitor.namespace=$MONITORING_NAMESPACE \
  --set monitoring.prometheusRule.enabled=true \
  --set monitoring.prometheusRule.namespace=$MONITORING_NAMESPACE \
  --set monitoring.postgres.exporter.enabled=true \
  --wait \
  --timeout=10m; then
    log_success "Helm chart deployed successfully"
else
    log_error "Failed to deploy Helm chart"
    exit 1
fi

# Step 5: Wait for pods to be ready
log_info "Step 5: Waiting for pods to be ready..."

log_info "Waiting for frontend pods..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=frontend -n $NAMESPACE --timeout=300s

log_info "Waiting for PostgreSQL pods..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=postgresql -n $NAMESPACE --timeout=300s

log_success "All pods are ready"

# Step 6: Verify deployment
log_info "Step 6: Verifying deployment..."

# Check pods
echo ""
log_info "Pods in namespace $NAMESPACE:"
kubectl get pods -n $NAMESPACE

# Check services
echo ""
log_info "Services in namespace $NAMESPACE:"
kubectl get services -n $NAMESPACE

# Check ingress
echo ""
log_info "Ingress in namespace $NAMESPACE:"
kubectl get ingress -n $NAMESPACE

# Check monitoring resources
echo ""
log_info "Monitoring resources:"
kubectl get servicemonitor -n $MONITORING_NAMESPACE | grep mspr-serverless || log_warning "ServiceMonitor not found"
kubectl get prometheusrule -n $MONITORING_NAMESPACE | grep mspr-serverless || log_warning "PrometheusRule not found"

# Step 7: Test monitoring endpoints
log_info "Step 7: Testing monitoring endpoints..."

# Test frontend metrics
FRONTEND_POD=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/component=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$FRONTEND_POD" ]; then
    log_info "Testing frontend metrics endpoint..."
    if kubectl exec -n $NAMESPACE $FRONTEND_POD -- curl -s http://localhost:3000/metrics >/dev/null 2>&1; then
        log_success "Frontend metrics endpoint is working"
    else
        log_warning "Frontend metrics endpoint test failed"
    fi
else
    log_warning "Frontend pod not found for testing"
fi

# Test PostgreSQL exporter
POSTGRES_POD=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/component=postgresql -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POSTGRES_POD" ]; then
    log_info "Testing PostgreSQL exporter..."
    if kubectl exec -n $NAMESPACE $POSTGRES_POD -c postgres-exporter -- curl -s http://localhost:9187/metrics >/dev/null 2>&1; then
        log_success "PostgreSQL exporter is working"
    else
        log_warning "PostgreSQL exporter test failed"
    fi
else
    log_warning "PostgreSQL pod not found for testing"
fi

# Final summary
echo ""
echo "🎉 ${GREEN}Deployment completed successfully!${NC}"
echo ""
echo "📊 ${BLUE}Application URLs:${NC}"
echo "   Frontend: https://cofrap.germainleignel.com"
echo "   Adminer: kubectl port-forward svc/adminer 8080:8080 -n $NAMESPACE"
echo ""
echo "📈 ${BLUE}Monitoring:${NC}"
echo "   ServiceMonitor: $MONITORING_NAMESPACE/mspr-serverless"
echo "   PrometheusRule: $MONITORING_NAMESPACE/mspr-serverless"
echo "   Frontend metrics: /metrics endpoint"
echo "   PostgreSQL metrics: postgres-exporter sidecar"
echo ""
echo "🔍 ${BLUE}Useful commands:${NC}"
echo "   Check pods: kubectl get pods -n $NAMESPACE"
echo "   Check logs: kubectl logs -f deployment/frontend -n $NAMESPACE"
echo "   Check functions: faas-cli list"
echo "   Port-forward adminer: kubectl port-forward svc/adminer 8080:8080 -n $NAMESPACE"
echo ""
log_success "MSPR Serverless deployment with monitoring is complete!"
