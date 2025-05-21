#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="cofrap-frontend"
IMAGE_TAG="latest"
REGISTRY="registry.germainleignel.com/library"
FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend"

# Build the frontend
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}Using existing node_modules${NC}"
else
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Build the application
echo -e "${YELLOW}Building frontend application...${NC}"
npm run build

# Build the Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t ${FULL_IMAGE_NAME} .

# Push the Docker image
echo -e "${YELLOW}Pushing Docker image to registry...${NC}"
docker push ${FULL_IMAGE_NAME}

echo -e "${GREEN}Frontend built and pushed successfully!${NC}"
echo "Image: ${FULL_IMAGE_NAME}"
