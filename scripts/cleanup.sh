#!/bin/bash

# Cleanup script for MSPR Serverless deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="cofrap"
HELM_RELEASE="mspr-serverless"
MONITORING_NAMESPACE="monitoring"

echo -e "${BLUE}🧹 Starting MSPR Serverless cleanup...${NC}"

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

# Step 1: Remove OpenFaaS functions
log_info "Step 1: Removing OpenFaaS functions..."

# Check if OpenFaaS is configured
if [ -n "$OPENFAAS_URL" ] && faas-cli auth --gateway "$OPENFAAS_URL" >/dev/null 2>&1; then
    cd functions
    if faas-cli remove -f stack.yaml --gateway "$OPENFAAS_URL"; then
        log_success "OpenFaaS functions removed"
    else
        log_warning "Failed to remove some OpenFaaS functions (they might not exist)"
    fi
    cd ..
else
    log_warning "OpenFaaS not configured or authentication failed. Skipping function removal."
    log_info "To manually remove functions later:"
    log_info "  export OPENFAAS_URL=http://your-gateway:8080"
    log_info "  faas-cli login --gateway \$OPENFAAS_URL"
    log_info "  cd functions && faas-cli remove -f stack.yaml --gateway \$OPENFAAS_URL"
fi

# Step 2: Uninstall Helm release
log_info "Step 2: Uninstalling Helm release..."
if helm uninstall $HELM_RELEASE -n $NAMESPACE 2>/dev/null; then
    log_success "Helm release $HELM_RELEASE uninstalled"
else
    log_warning "Helm release $HELM_RELEASE was not found"
fi

# Step 3: Remove monitoring resources
log_info "Step 3: Removing monitoring resources..."
kubectl delete servicemonitor mspr-serverless -n $MONITORING_NAMESPACE 2>/dev/null || log_warning "ServiceMonitor not found"
kubectl delete prometheusrule mspr-serverless -n $MONITORING_NAMESPACE 2>/dev/null || log_warning "PrometheusRule not found"

# Step 4: Delete namespace
log_info "Step 4: Deleting namespace..."
if kubectl delete namespace $NAMESPACE 2>/dev/null; then
    log_success "Namespace $NAMESPACE deleted"
else
    log_warning "Namespace $NAMESPACE was not found"
fi

# Optional: Remove monitoring namespace if empty
read -p "Do you want to delete the monitoring namespace '$MONITORING_NAMESPACE'? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if kubectl delete namespace $MONITORING_NAMESPACE 2>/dev/null; then
        log_success "Monitoring namespace $MONITORING_NAMESPACE deleted"
    else
        log_warning "Monitoring namespace $MONITORING_NAMESPACE was not found or couldn't be deleted"
    fi
fi

echo ""
log_success "Cleanup completed!"
echo ""
echo "🔍 ${BLUE}To verify cleanup:${NC}"
echo "   Check namespaces: kubectl get namespaces"
echo "   Check functions: faas-cli list"
echo "   Check helm releases: helm list --all-namespaces"
