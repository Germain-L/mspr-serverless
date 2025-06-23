#!/bin/bash

# Build script that updates version information before building
# This ensures the latest build info is included in the deployment

set -e

echo "🔧 Updating version information..."

# Get current version from package.json
VERSION=$(node -p "require('./package.json').version")

# Get git commit hash (short)
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Get current timestamp
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Generate build number (you can customize this logic)
BUILD_NUMBER="${GIT_COMMIT}-$(date +%Y%m%d-%H%M%S)"

echo "📦 Version: $VERSION"
echo "🔍 Git Commit: $GIT_COMMIT"
echo "⏰ Build Date: $BUILD_DATE"
echo "🏗️  Build Number: $BUILD_NUMBER"

# Update the version file with current build info
cat > src/lib/version.ts << EOF
// Auto-generated version file
// This file is updated during build process

export const version = '$VERSION';
export const buildDate = '$BUILD_DATE';
export const gitCommit = '$GIT_COMMIT';
export const buildNumber = '$BUILD_NUMBER';

export const versionInfo = {
  version,
  buildDate,
  gitCommit,
  buildNumber,
  environment: process.env.NODE_ENV || 'development'
};

export function getVersionString(): string {
  return \`v\${version} (\${buildNumber})\`;
}

export function getFullVersionInfo(): string {
  return \`Version \${version}, Build \${buildNumber}, \${buildDate.split('T')[0]}\`;
}
EOF

echo "✅ Version information updated"

# Set environment variables for the build
export GIT_COMMIT
export BUILD_NUMBER
export BUILD_DATE

# Run the actual build
echo "🚀 Starting build..."
npm run build

echo "✅ Build completed with version $VERSION ($BUILD_NUMBER)"
