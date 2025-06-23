#!/bin/sh

# Docker-compatible build script for Alpine Linux
# This script updates version information before building

set -e

echo "🔧 Updating version information..."

# Get current version from package.json
VERSION=$(node -p "require('./package.json').version")

# Get git commit hash (short) - handle case where git might not be available
if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "docker")
else
    GIT_COMMIT="docker"
fi

# Get current timestamp
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Generate build number
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

# Run the actual build
echo "🚀 Starting build..."
npm run build

echo "✅ Build completed with version $VERSION ($BUILD_NUMBER)"
