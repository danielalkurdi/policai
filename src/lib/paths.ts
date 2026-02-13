import path from 'path';
import fs from 'fs/promises';

/**
 * On Vercel serverless, process.cwd() returns /var/task which is read-only.
 * Only /tmp is writable. This module provides helpers to resolve
 * writable file paths that work both locally and on Vercel.
 */

const isVercel = !!process.env.VERCEL;

/** Directory for writable data files (pipeline state, policies, pending content) */
export function getWritableDataDir(...segments: string[]): string {
  if (isVercel) {
    return path.join('/tmp', 'data', ...segments);
  }
  return path.join(process.cwd(), 'data', ...segments);
}

/** Directory for writable public data files (policies JSON, pending content) */
export function getWritablePublicDataDir(...segments: string[]): string {
  if (isVercel) {
    return path.join('/tmp', 'public', 'data', ...segments);
  }
  return path.join(process.cwd(), 'public', 'data', ...segments);
}

/** Read-only path to bundled public data (available at build time) */
function getBundledPublicDataPath(...segments: string[]): string {
  return path.join(process.cwd(), 'public', 'data', ...segments);
}

/**
 * Get a writable public data file path, seeding from the bundled copy
 * on first access (Vercel only). This ensures the /tmp copy starts
 * with the data that was present at build time.
 */
export async function getSeededPublicDataFile(filename: string): Promise<string> {
  const writablePath = getWritablePublicDataDir(filename);

  if (isVercel) {
    try {
      await fs.access(writablePath);
    } catch {
      // File doesn't exist in /tmp yet — seed it from the bundled copy
      const bundledPath = getBundledPublicDataPath(filename);
      await fs.mkdir(path.dirname(writablePath), { recursive: true });
      try {
        await fs.copyFile(bundledPath, writablePath);
      } catch {
        // Bundled file doesn't exist either — create empty JSON array
        await fs.writeFile(writablePath, '[]', 'utf-8');
      }
    }
  }

  return writablePath;
}
