#!/bin/bash

# Environment setup script for MSPR Serverless

echo "🔧 MSPR Serverless Environment Setup"
echo "===================================="
echo ""

# Check if faas-cli is available
if ! command -v faas-cli &> /dev/null; then
    echo "❌ faas-cli is not installed. Please install it first:"
    echo "   curl -sL https://cli.openfaas.com | sudo sh"
    exit 1
fi

# Try to detect current gateway
CURRENT_GATEWAY=$(faas-cli version 2>/dev/null | grep -A1 "Gateway" | grep "uri:" | awk '{print $2}' || echo "")

if [ -n "$CURRENT_GATEWAY" ]; then
    echo "✅ Detected OpenFaaS gateway: $CURRENT_GATEWAY"
    echo ""
    echo "To use this gateway, run:"
    echo "  export OPENFAAS_URL=\"$CURRENT_GATEWAY\""
    echo ""
    echo "Setting OPENFAAS_URL for this session..."
    export OPENFAAS_URL="$CURRENT_GATEWAY"
    echo "✅ OPENFAAS_URL set to: $OPENFAAS_URL"
    echo ""
    
    # Test if we can list functions
    if faas-cli list >/dev/null 2>&1; then
        echo "✅ OpenFaaS authentication is working"
    else
        echo "⚠️  OpenFaaS authentication may be required"
        echo "   Run: faas-cli login --gateway $OPENFAAS_URL"
    fi
else
    echo "⚠️  No OpenFaaS gateway detected"
    echo ""
    echo "Please login to your OpenFaaS gateway first:"
    echo "  faas-cli login --gateway https://your-gateway-url"
    echo ""
    echo "Or set the gateway URL manually:"
    echo "  export OPENFAAS_URL=https://your-gateway-url"
fi

echo ""
echo "🚀 Ready to deploy! Run: ./deploy.sh"
