import { NextRequest, NextResponse } from "next/server";
import { deleteContract, getContract, saveContract } from "@/lib/store/contracts";
import type { Contract } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const contract = await getContract(id);
  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }
  return NextResponse.json({ contract });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = await getContract(id);
  if (!existing) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }
  const body = (await req.json().catch(() => null)) as Partial<Contract> | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  // never allow identity fields to be overwritten
  const contract = await saveContract({
    ...existing,
    ...body,
    id: existing.id,
    orderNumber: existing.orderNumber,
    eventId: existing.eventId,
    contactId: existing.contactId,
    createdAt: existing.createdAt,
  });
  return NextResponse.json({ contract });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ok = await deleteContract(id);
  if (!ok) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
