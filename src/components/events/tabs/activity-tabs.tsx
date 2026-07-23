"use client";

import * as React from "react";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import type { Contract, NoteItem, RestaurantSettings, TaskItem } from "@/types";
import { currency } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
          <Textarea
            rows={3}
            placeholder="Write an internal note about this event..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
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
                <p className="text-sm whitespace-pre-wrap">{note.body}</p>
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

export function LogTab({
  contract,
  settings,
}: {
  contract: Contract;
  settings: RestaurantSettings;
}) {
  const owner = settings.owners.find((o) => o.id === contract.ownerId);

  const entries: { at: string; text: string }[] = [
    {
      at: contract.createdAt,
      text: `Event created from GHL contact ${contract.contactSnapshot.name} by ${owner?.name ?? "Sub-account user"}`,
    },
    ...(contract.statusHistory ?? []).map((h) => ({
      at: h.at,
      text: `Status changed ${h.from ? `from ${h.from} ` : ""}to ${h.to} by ${h.by}`,
    })),
    ...(contract.payments ?? []).map((p) => ({
      at: p.date ? `${p.date}T12:00:00` : contract.updatedAt,
      text: `Payment of ${currency(p.amount)} recorded (${p.method ?? "unknown method"}) — ${p.status}`,
    })),
    ...(contract.messages ?? []).map((m) => ({
      at: m.at,
      text: `${m.channel === "guest" ? "Guest" : "Staff"} message “${m.subject}” sent by ${m.author}`,
    })),
    {
      at: contract.updatedAt,
      text: `Last updated`,
    },
  ].sort((a, b) => (a.at < b.at ? 1 : -1));

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-0 divide-y rounded-md border">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 text-sm">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
              <span className="flex-1">{entry.text}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {format(new Date(entry.at), "MMM d, yyyy h:mm a")}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
