#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to deploy a single function
deploy_function() {
    local function_dir=$1
    local function_name=$(basename $function_dir)
    local namespace="${NAMESPACE:-cofrap}"
    
    echo -e "${YELLOW}Deploying $function_name to namespace $namespace...${NC}"
    
    # Navigate to function directory
    pushd "$function_dir" > /dev/null
    
    # Update the stack.yml with the correct namespace
    sed -i "s/namespace:.*/namespace: $namespace/" stack.yml
    
    # Build the function
    echo "Building $function_name..."
    faas-cli build -f stack.yml
    
    # Push the image to the registry
    echo "Pushing $function_name to registry..."
    faas-cli push -f stack.yml
    
    # Deploy the function with namespace
    echo "Deploying $function_name to namespace $namespace..."
    faas-cli deploy -f stack.yml --namespace $namespace
    
    # Return to the original directory
    popd > /dev/null
    
    echo -e "${GREEN}Successfully deployed $function_name!${NC}"
    echo "----------------------------------------"
}

# Check if faas-cli is installed
if ! command -v faas-cli &> /dev/null; then
    echo "Error: faas-cli is not installed. Please install it first."
    echo "Visit https://github.com/openfaas/faas-cli for installation instructions."
    exit 1
fi

# Login to OpenFaaS gateway
echo -e "${YELLOW}Logging in to OpenFaaS gateway...${NC}
faas-cli login --password $OPENFAAS_PASSWORD

# Deploy each function
deploy_function "functions/generate-password"
deploy_function "functions/generate-2fa"
deploy_function "functions/authenticate"

echo -e "${GREEN}All functions deployed successfully!${NC}"
echo "OpenFaaS Gateway: $OPENFAAS_URL"

# List deployed functions
echo -e "\n${YELLOW}Listing deployed functions:${NC}"
faas-cli list
