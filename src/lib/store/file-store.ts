import { promises as fs } from "fs";
import path from "path";

/**
 * Minimal JSON file store used as the app's persistence layer.
 * In production this can be swapped for GHL custom objects /
 * custom values or any database — all access goes through
 * readStore / writeStore so the swap is a one-file change.
 */
const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readStore<T>(name: string, fallback: T): Promise<T> {
  try {
    const file = await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf-8");
    return JSON.parse(file) as T;
  } catch {
    return fallback;
  }
}

export async function writeStore<T>(name: string, value: T): Promise<void> {
  await ensureDir();
  const file = path.join(DATA_DIR, `${name}.json`);
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf-8");
  await fs.rename(tmp, file);
}
