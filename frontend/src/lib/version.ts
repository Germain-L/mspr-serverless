// Auto-generated version file
// This file is updated during build process

export const version = '1.0.0';
export const buildDate = '2025-06-23T08:57:58Z';
export const gitCommit = 'e109092';
export const buildNumber = 'e109092-20250623-085758';

export const versionInfo = {
  version,
  buildDate,
  gitCommit,
  buildNumber,
  environment: process.env.NODE_ENV || 'development'
};

export function getVersionString(): string {
  return `v${version} (${buildNumber})`;
}

export function getFullVersionInfo(): string {
  return `Version ${version}, Build ${buildNumber}, ${buildDate.split('T')[0]}`;
}
