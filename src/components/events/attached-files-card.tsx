"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileText, Loader2, Paperclip, Trash2 } from "lucide-react";
import type { Contract } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

interface Props {
  contract: Contract;
  onContractUpdate: (contract: Contract) => void;
}

export function AttachedFilesCard({ contract, onContractUpdate }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const files = contract.attachments ?? [];

  async function upload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/contracts/${contract.id}/files`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error);
      }
      const data = await res.json();
      onContractUpdate(data.contract);
      toast.success(`“${file.name}” attached`);
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(fileId: string, name: string) {
    const res = await fetch(`/api/contracts/${contract.id}/files/${fileId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const data = await res.json();
      onContractUpdate(data.contract);
      toast.success(`“${name}” removed`);
    } else {
      toast.error("Failed to remove file");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h4 className="mb-2 font-semibold">Attached files</h4>

        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">No Files</p>
        ) : (
          <ul className="space-y-1.5">
            {files.map((f) => (
              <li key={f.id} className="flex items-center gap-2 text-sm">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <a
                  href={`/api/contracts/${contract.id}/files/${f.id}`}
                  target="_blank"
                  rel="noopener"
                  className="min-w-0 flex-1 truncate text-primary hover:underline"
                  title={f.name}
                >
                  {f.name}
                </a>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatSize(f.size)}
                </span>
                <button
                  type="button"
                  className="text-destructive/70 hover:text-destructive"
                  title="Remove file"
                  onClick={() => remove(f.id, f.name)}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Paperclip className="size-3.5" />
          )}
          Choose a File
        </Button>
      </CardContent>
    </Card>
  );
}
