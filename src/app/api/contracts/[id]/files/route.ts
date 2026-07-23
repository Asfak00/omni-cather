import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getContract, saveContract } from "@/lib/store/contracts";
import { uploadsDir } from "@/lib/store/paths";
import type { AttachedFile } from "@/types";

const MAX_SIZE = 15 * 1024 * 1024; // 15 MB

/** POST multipart form-data { file } → attach a file to the event */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contract = await getContract(id);
  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File exceeds 15 MB" }, { status: 413 });
  }

  const fileId = `file_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const dir = path.join(uploadsDir(), id);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, fileId),
      Buffer.from(await file.arrayBuffer())
    );
  } catch {
    return NextResponse.json(
      { error: "File storage is unavailable on this host" },
      { status: 507 }
    );
  }

  const attachment: AttachedFile = {
    id: fileId,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    at: new Date().toISOString(),
  };
  const updated = await saveContract({
    ...contract,
    attachments: [...(contract.attachments ?? []), attachment],
  });

  return NextResponse.json({ contract: updated, attachment }, { status: 201 });
}
