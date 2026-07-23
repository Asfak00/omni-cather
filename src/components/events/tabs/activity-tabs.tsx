"use client";

import * as React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import type { Contract, NoteItem, RestaurantSettings, TaskItem } from "@/types";
import { currency } from "@/lib/calculations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

function randomId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

interface TabProps {
  contract: Contract;
  onPatch: (patch: Partial<Contract>) => Promise<void>;
}

/* ---------------- Tasks ---------------- */

export function TasksTab({ contract, onPatch }: TabProps) {
  const [title, setTitle] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const tasks = contract.tasks ?? [];

  async function addTask() {
    if (!title.trim()) return;
    const task: TaskItem = {
      id: randomId("task"),
      title: title.trim(),
      done: false,
      dueDate: dueDate || undefined,
    };
    await onPatch({ tasks: [...tasks, task] });
    setTitle("");
    setDueDate("");
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <div className="min-w-56 flex-1">
            <Input
              placeholder="Add a task... (e.g. Confirm final guest count)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
          </div>
          <div className="w-44">
            <DatePicker value={dueDate} onChange={setDueDate} placeholder="Due date" clearable />
          </div>
          <Button onClick={addTask} disabled={!title.trim()}>
            <Plus className="size-4" /> Add Task
          </Button>
        </div>

        {tasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No tasks yet.
          </p>
        ) : (
          <div className="divide-y rounded-md border">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                <Checkbox
                  checked={task.done}
                  onCheckedChange={(v) =>
                    onPatch({
                      tasks: tasks.map((t) =>
                        t.id === task.id ? { ...t, done: v === true } : t
                      ),
                    })
                  }
                />
                <span
                  className={cn(
                    "flex-1 text-sm",
                    task.done && "text-muted-foreground line-through"
                  )}
                >
                  {task.title}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-muted-foreground">
                    Due {format(new Date(`${task.dueDate}T00:00:00`), "M/d/yyyy")}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive"
                  onClick={() =>
                    onPatch({ tasks: tasks.filter((t) => t.id !== task.id) })
                  }
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- Notes ---------------- */

export function NotesTab({
  contract,
  settings,
  onPatch,
}: TabProps & { settings: RestaurantSettings }) {
  const [body, setBody] = React.useState("");
  const notes = contract.notes ?? [];
  const owner = settings.owners.find((o) => o.id === contract.ownerId);

  async function addNote() {
    if (!body.trim()) return;
    const note: NoteItem = {
      id: randomId("note"),
      body: body.trim(),
      author: owner?.name ?? "Sub-account user",
      at: new Date().toISOString(),
    };
    await onPatch({ notes: [...notes, note] });
    setBody("");
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 space-y-2">
          <RichTextEditor
            rows={3}
            placeholder="Write an internal note about this event..."
            value={body}
            onChange={setBody}
          />
          <Button size="sm" onClick={addNote} disabled={!body.trim()}>
            <Plus className="size-4" /> Add Note
          </Button>
        </div>

        {notes.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No notes yet.
          </p>
        ) : (
          <div className="space-y-3">
            {[...notes].reverse().map((note) => (
              <div key={note.id} className="rounded-md border px-4 py-3">
                <div
                  className="text-sm [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: note.body }}
                />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {note.author} ·{" "}
                    {format(new Date(note.at), "MMM d, yyyy h:mm a")}
                  </span>
                  <button
                    type="button"
                    className="text-destructive hover:underline"
                    onClick={() =>
                      onPatch({ notes: notes.filter((n) => n.id !== note.id) })
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- Log ---------------- */

const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export function LogTab({
  contract,
  settings,
  ghlNotes,
}: {
  contract: Contract;
  settings: RestaurantSettings;
  ghlNotes?: { id: string; body: string; dateAdded: string }[];
}) {
  const owner = settings.owners.find((o) => o.id === contract.ownerId);

  const entries: { at: string; kind: string; text: string; by: string }[] = [
    {
      at: contract.createdAt,
      kind: "LEAD",
      text: `${contract.contactSnapshot.name} was converted into event ${contract.eventName}, account ${contract.contactSnapshot.companyName ?? "—"}, and contact ${contract.contactSnapshot.name}`,
      by: owner?.name ?? "You",
    },
    {
      at: contract.createdAt,
      kind: "EVENT",
      text: `Contract & Event Order: ${contract.orderNumber} was created under event ${contract.eventName}`,
      by: owner?.name ?? "You",
    },
    ...(contract.statusHistory ?? []).map((h) => ({
      at: h.at,
      kind: "EVENT",
      text: `${contract.eventName} - status was changed ${h.from ? `from ${title(h.from)} ` : ""}to ${title(h.to)}`,
      by: h.by,
    })),
    ...(contract.payments ?? [])
      .filter((p) => !p.deleted)
      .map((p) => ({
        at: p.date ? `${p.date}T12:00:00` : contract.updatedAt,
        kind: "EVENT",
        text: `A payment of ${currency(p.amount)} was created for event ${contract.eventName}`,
        by: owner?.name ?? "You",
      })),
    ...(contract.messages ?? [])
      .filter((m) => !m.draft)
      .map((m) => ({
        at: m.at,
        kind: "EVENT",
        text:
          m.sharedDocs?.length
            ? `Document ${m.sharedDocs.join(", ")} was shared from event ${contract.eventName}`
            : `${m.channel === "guest" ? "Guest" : "Staff"} message “${m.subject}” was sent from event ${contract.eventName}`,
        by: m.author,
      })),
    ...(ghlNotes ?? []).map((n) => ({
      at: n.dateAdded,
      kind: "GHL",
      text: `GHL contact note: ${n.body.replace(/<[^>]+>/g, " ").slice(0, 160)}`,
      by: "GHL",
    })),
  ].sort((a, b) => (a.at < b.at ? 1 : -1));

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="divide-y rounded-md border">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-start gap-4 px-4 py-3">
              <Badge
                className={cn(
                  "mt-0.5 w-14 justify-center bg-teal-100 text-[9px] font-bold text-teal-800",
                  entry.kind === "GHL" && "bg-indigo-100 text-indigo-800"
                )}
              >
                {entry.kind}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary">{entry.text}</p>
                <p className="text-xs text-muted-foreground">
                  By {entry.by}{" "}
                  <span>
                    at {format(new Date(entry.at), "M/d/yyyy")} (
                    {formatDistanceToNow(new Date(entry.at), { addSuffix: true })})
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
