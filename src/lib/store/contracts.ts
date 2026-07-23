import type { Contract } from "@/types";
import { readStore, writeStore } from "./file-store";
import { getRestaurantSettings } from "./settings";

const STORE = "contracts";

export async function listContracts(): Promise<Contract[]> {
  const existing = await readStore<Contract[] | null>(STORE, null);
  if (existing !== null) return existing;

  // First run (no data file yet) → seed realistic demo events so the
  // whole flow is testable immediately. Deleting all events later
  // leaves an empty list — demo data only returns via POST /api/demo.
  const { buildDemoContracts } = await import("./demo-data");
  const seeded = buildDemoContracts(await getRestaurantSettings());
  await writeStore(STORE, seeded);
  return seeded;
}

export async function getContract(id: string): Promise<Contract | null> {
  const contracts = await listContracts();
  return contracts.find((c) => c.id === id) ?? null;
}

export async function saveContract(contract: Contract): Promise<Contract> {
  const contracts = await listContracts();
  const idx = contracts.findIndex((c) => c.id === contract.id);
  const updated = { ...contract, updatedAt: new Date().toISOString() };
  if (idx >= 0) contracts[idx] = updated;
  else contracts.unshift(updated);
  await writeStore(STORE, contracts);
  return updated;
}

export async function deleteContract(id: string): Promise<boolean> {
  const contracts = await listContracts();
  const next = contracts.filter((c) => c.id !== id);
  if (next.length === contracts.length) return false;
  await writeStore(STORE, next);
  return true;
}
