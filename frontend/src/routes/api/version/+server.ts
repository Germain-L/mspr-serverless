import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { versionInfo, getVersionString, getFullVersionInfo } from '$lib/version';

export const GET: RequestHandler = async () => {
  return json({
    ...versionInfo,
    versionString: getVersionString(),
    fullVersionInfo: getFullVersionInfo(),
    timestamp: new Date().toISOString()
  });
};
