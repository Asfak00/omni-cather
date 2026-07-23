"use client";

import * as React from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Outdent,
  Indent,
  RemoveFormatting,
  Underline,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------
 * RichTextEditor — TinyMCE-style toolbar over a contentEditable
 * area. Stores HTML. Used for every long-text field in the app
 * (instructions, notes, terms, messages...). PDFs strip the
 * HTML back to plain text.
 * ------------------------------------------------------------ */

const FONT_SIZES = ["8pt", "10pt", "11pt", "12pt", "14pt", "18pt", "24pt"];
const FORMATS: { label: string; block: string }[] = [
  { label: "Paragraph", block: "p" },
  { label: "Heading 1", block: "h1" },
  { label: "Heading 2", block: "h2" },
  { label: "Heading 3", block: "h3" },
  { label: "Heading 4", block: "h4" },
  { label: "Preformatted", block: "pre" },
];

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** rough visible height in text rows */
  rows?: number;
  /**
   * inline mode: looks like a plain input until focused — then the
   * formatting toolbar appears (used for line item descriptions).
   */
  inline?: boolean;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  rows = 4,
  inline = false,
  className,
}: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const lastHtml = React.useRef<string>("");
  const [focused, setFocused] = React.useState(false);
  const showToolbar = !inline || focused;

  // Sync external value → editor (without clobbering the caret while typing)
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (value !== lastHtml.current && el.innerHTML !== value) {
      el.innerHTML = value || "";
      lastHtml.current = value || "";
    }
  }, [value]);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    lastHtml.current = el.innerHTML;
    onChange(el.innerHTML);
  };

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const addLink = () => {
    const url = window.prompt("Link URL", "https://");
    if (url) exec("createLink", url);
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className
      )}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        // keep the toolbar open while focus stays inside the editor
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setFocused(false);
        }
      }}
    >
      {/* toolbar */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5",
          !showToolbar && "hidden"
        )}
      >
        <ToolbarButton title="Bold" onClick={() => exec("bold")}>
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => exec("italic")}>
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Underline" onClick={() => exec("underline")}>
          <Underline className="size-4" />
        </ToolbarButton>

        <Divider />

        <select
          className="h-7 cursor-pointer rounded border-0 bg-transparent px-1 text-xs text-muted-foreground outline-none hover:bg-muted"
          defaultValue="p"
          title="Formats"
          onChange={(e) => exec("formatBlock", e.target.value)}
        >
          {FORMATS.map((f) => (
            <option key={f.block} value={f.block}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          className="h-7 w-16 cursor-pointer rounded border-0 bg-transparent px-1 text-xs text-muted-foreground outline-none hover:bg-muted"
          defaultValue="11pt"
          title="Font size"
          onChange={(e) => {
            const idx = FONT_SIZES.indexOf(e.target.value);
            exec("fontSize", String(Math.min(7, Math.max(1, idx + 1))));
          }}
        >
          {FONT_SIZES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <Divider />

        <ToolbarButton title="Bulleted list" onClick={() => exec("insertUnorderedList")}>
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" onClick={() => exec("insertOrderedList")}>
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Decrease indent" onClick={() => exec("outdent")}>
          <Outdent className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Increase indent" onClick={() => exec("indent")}>
          <Indent className="size-4" />
        </ToolbarButton>

        <Divider />

        <label
          className="flex h-7 cursor-pointer items-center gap-0.5 rounded px-1 hover:bg-muted"
          title="Text color"
        >
          <span className="text-xs font-bold underline decoration-2">A</span>
          <input
            type="color"
            className="size-0 opacity-0"
            onChange={(e) => exec("foreColor", e.target.value)}
          />
        </label>
        <label
          className="flex h-7 cursor-pointer items-center gap-0.5 rounded px-1 hover:bg-muted"
          title="Highlight color"
        >
          <span className="rounded bg-yellow-200 px-0.5 text-xs font-bold text-foreground">
            A
          </span>
          <input
            type="color"
            className="size-0 opacity-0"
            onChange={(e) => exec("hiliteColor", e.target.value)}
          />
        </label>

        <Divider />

        <ToolbarButton title="Align left" onClick={() => exec("justifyLeft")}>
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Align center" onClick={() => exec("justifyCenter")}>
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Align right" onClick={() => exec("justifyRight")}>
          <AlignRight className="size-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Insert link" onClick={addLink}>
          <Link2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Remove link" onClick={() => exec("unlink")}>
          <Link2Off className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Clear formatting" onClick={() => exec("removeFormat")}>
          <RemoveFormatting className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Horizontal line"
          onClick={() => exec("insertHorizontalRule")}
        >
          <Minus className="size-4" />
        </ToolbarButton>
      </div>

      {/* editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className={cn(
          "prose-sm w-full max-w-none px-3 text-sm outline-none",
          inline ? "py-2" : "py-2.5",
          "[&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
        )}
        style={{ minHeight: inline ? "2.5rem" : `${rows * 1.6}rem` }}
        onInput={emit}
        onBlur={emit}
      />
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" />;
}

function ToolbarButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      // preserve the text selection inside the editor
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-7 min-w-7 cursor-pointer items-center justify-center rounded px-1 text-foreground/70 hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}
