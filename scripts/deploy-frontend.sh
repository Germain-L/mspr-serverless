#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="cofrap"
INGRESS_HOST="cofrap.germainleignel.com"  # Domain for the application

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed. Please install it first."
    exit 1
fi

# Set the current context
echo -e "${YELLOW}Using Kubernetes context:${NC}"
kubectl config current-context
echo ""

# Create namespace if it doesn't exist
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo -e "${YELLOW}Creating namespace $NAMESPACE...${NC}"
    kubectl create namespace $NAMESPACE
fi

# Update the ingress host in the deployment file
sed -i "s/cofrap.yourdomain.com/$INGRESS_HOST/g" ../kubernetes/frontend-deployment.yaml

# Apply the Kubernetes manifests
echo -e "${YELLOW}Deploying frontend to Kubernetes...${NC}"
kubectl apply -f ../kubernetes/frontend-deployment.yaml -n $NAMESPACE

# Wait for the deployment to be ready
echo -e "\n${YELLOW}Waiting for deployment to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/cofrap-frontend -n $NAMESPACE

# Get the service URL
echo -e "\n${GREEN}Frontend deployed successfully!${NC}"
echo -e "\n${YELLOW}Access the application at:${NC}"
echo -e "http://$INGRESS_HOST"

# Show the status of the deployment
echo -e "\n${YELLOW}Deployment status:${NC}"
kubectl get all -l app=cofrap -n $NAMESPACE
