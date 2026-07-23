import { accessSync, constants, mkdirSync } from "fs";
import os from "os";
import path from "path";

/* ------------------------------------------------------------
 * Resolve a writable data directory that works everywhere:
 *  - DATA_DIR env var when provided (persistent-disk hosts)
 *  - ./data locally (dev / self-hosted Node servers)
 *  - the OS temp dir on serverless hosts (Netlify, Vercel,
 *    AWS Lambda) whose project filesystem is read-only
 * ------------------------------------------------------------ */

let resolved: string | null = null;

function isWritable(dir: string): boolean {
  try {
    mkdirSync(dir, { recursive: true });
    accessSync(dir, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export function dataDir(): string {
  if (resolved) return resolved;

  const candidates = [
    process.env.DATA_DIR,
    // serverless platforms: project dir is read-only, /tmp is writable
    process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL
      ? path.join(os.tmpdir(), "ghl-event-manager-data")
      : null,
    path.join(process.cwd(), "data"),
    path.join(os.tmpdir(), "ghl-event-manager-data"),
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    if (isWritable(dir)) {
      resolved = dir;
      return dir;
    }
  }

  // nothing writable — reads fall back to defaults, writes go to memory
  resolved = candidates[candidates.length - 1];
  return resolved;
}

export function uploadsDir(): string {
  return path.join(dataDir(), "uploads");
}
