#!/bin/bash

# Quick deployment script - wrapper for scripts/deploy.sh

echo "🚀 MSPR Serverless Quick Deploy"
echo "==============================="
echo ""
echo "This is a wrapper script. The actual deployment scripts are in the scripts/ directory."
echo ""
echo "For detailed information, see: scripts/README.md"
echo ""

# Check if scripts/deploy.sh exists
if [ -f "./scripts/deploy.sh" ]; then
    echo "Running: ./scripts/deploy.sh"
    echo ""
    exec ./scripts/deploy.sh "$@"
else
    echo "❌ Error: ./scripts/deploy.sh not found"
    echo "Please run this script from the project root directory."
    exit 1
fi
