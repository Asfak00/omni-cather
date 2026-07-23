import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getContract, saveContract } from "@/lib/store/contracts";
import { uploadsDir } from "@/lib/store/paths";

type Params = { params: Promise<{ id: string; fileId: string }> };

/** GET → download / view the attached file */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id, fileId } = await params;
  const contract = await getContract(id);
  const meta = contract?.attachments?.find((a) => a.id === fileId);
  if (!contract || !meta) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  // fileId is server-generated (no path separators), so the join is safe
  const buf = await fs
    .readFile(path.join(uploadsDir(), id, fileId))
    .catch(() => null);
  if (!buf) {
    return NextResponse.json({ error: "File missing on disk" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": meta.type,
      "Content-Disposition": `inline; filename="${meta.name.replace(/"/g, "")}"`,
    },
  });
}

/** DELETE → remove the attachment */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id, fileId } = await params;
  const contract = await getContract(id);
  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }
  await fs.unlink(path.join(uploadsDir(), id, fileId)).catch(() => {});
  const updated = await saveContract({
    ...contract,
    attachments: (contract.attachments ?? []).filter((a) => a.id !== fileId),
  });
  return NextResponse.json({ contract: updated });
}
