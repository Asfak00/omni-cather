import { promises as fs } from "fs";
import path from "path";
import { dataDir } from "./paths";

/**
 * JSON persistence that works on any host:
 *  - reads/writes JSON files in a writable data directory
 *    (./data locally, /tmp on serverless — see paths.ts)
 *  - keeps an in-memory mirror so the app still works when the
 *    filesystem is read-only or cold (writes NEVER throw)
 *
 * On serverless hosts /tmp is per-instance and ephemeral — for
 * durable production storage set DATA_DIR to a mounted volume or
 * swap this module for a database / GHL custom objects. Settings
 * are additionally mirrored to a GHL Custom Value (lib/ghl/sync).
 */

const memory = new Map<string, unknown>();

export async function readStore<T>(name: string, fallback: T): Promise<T> {
  if (memory.has(name)) return memory.get(name) as T;
  try {
    const file = await fs.readFile(path.join(dataDir(), `${name}.json`), "utf-8");
    const value = JSON.parse(file) as T;
    memory.set(name, value);
    return value;
  } catch {
    return fallback;
  }
}

export async function writeStore<T>(name: string, value: T): Promise<void> {
  // memory first — the source of truth for this instance
  memory.set(name, value);
  try {
    const dir = dataDir();
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, `${name}.json`);
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf-8");
    await fs.rename(tmp, file);
  } catch {
    // read-only filesystem — memory mirror keeps the app working
  }
}
