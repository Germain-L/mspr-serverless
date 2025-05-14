#!/bin/bash

# Change to the directory containing this script
cd "$(dirname "$0")"

# Check if faas-cli is installed
if ! command -v faas-cli &> /dev/null; then
    echo "Error: faas-cli is not installed."
    echo "Install it with: curl -sSL https://cli.openfaas.com | sudo sh"
    exit 1
fi

# Check OpenFaaS gateway connection
echo "Checking OpenFaaS gateway connection..."
if ! faas-cli list --gateway http://127.0.0.1:8080 > /dev/null 2>&1; then
    echo "Error: Cannot connect to OpenFaaS gateway."
    echo "Make sure OpenFaaS is running and the gateway URL is correct in stack.yaml."
    exit 1
fi

# Build and deploy the functions
echo "Building and deploying functions..."
faas-cli up -f stack.yaml

echo "Deployment completed. Check the status with: faas-cli list" 