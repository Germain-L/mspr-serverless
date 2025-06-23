#!/bin/bash

# Script to check the deployed version of the frontend
# Usage: ./check-version.sh [URL]

# Default URL - replace with your actual domain
DEFAULT_URL="https://cofrap.germainleignel.com"
URL="${1:-$DEFAULT_URL}"

echo "🔍 Checking version for: $URL"
echo "---"

# Check main version endpoint
echo "📊 Version API:"
curl -s "$URL/api/version" | jq '.' 2>/dev/null || {
    echo "❌ Failed to get version info from $URL/api/version"
    echo "   Trying direct curl..."
    curl -s "$URL/api/version"
}

echo ""
echo "---"

# Check status endpoint
echo "📊 Status API:"
curl -s "$URL/api/status" | jq '.version, .buildNumber, .buildDate, .environment' 2>/dev/null || {
    echo "❌ Failed to get status info from $URL/api/status"
}

echo ""
echo "---"
echo "✅ Version check complete"
