"use client";

import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/cn";

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function ToolbarButton({ label, active, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // onMouseDown (not onClick) so the editor's text selection isn't
      // lost to the button's own focus before the command runs.
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-md text-sm font-semibold text-ink-soft transition-colors",
        "hover:bg-paper-soft disabled:pointer-events-none disabled:opacity-40",
        active ? "bg-moss-light text-forest" : "",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div aria-hidden className="mx-1 h-5 w-px shrink-0 bg-stone-light" />;
}

/** Bold/italic/underline/H2/H3 use literal styled glyphs rather than
 * hand-drawn icon paths — clearer at 16px and instantly recognizable
 * (the same convention most minimal rich text toolbars use). Structural
 * icons (lists, link, quote, undo/redo) use small geometric SVGs. */
export function RichTextToolbar({ editor }: { editor: Editor }) {
  return (
    <div
      role="toolbar"
      aria-label="Mətn formatlaşdırma"
      className="flex w-full min-w-0 items-center gap-0.5 overflow-x-auto rounded-t-md border border-b-0 border-stone-light bg-paper-soft px-2 py-1.5"
    >
      <ToolbarButton
        label="Qalın (Ctrl+B)"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        B
      </ToolbarButton>
      <ToolbarButton
        label="Kursiv (Ctrl+I)"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        label="Altından xətt (Ctrl+U)"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <span className="underline">U</span>
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Başlıq 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        label="Başlıq 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Nöqtəli siyahı"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <circle cx="4" cy="6" r="1.3" fill="currentColor" />
          <circle cx="4" cy="10" r="1.3" fill="currentColor" />
          <circle cx="4" cy="14" r="1.3" fill="currentColor" />
          <line x1="8" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        label="Nömrələnmiş siyahı"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <text x="1.5" y="8" fontSize="5.5" fill="currentColor" stroke="none">1</text>
          <text x="1.5" y="12.3" fontSize="5.5" fill="currentColor" stroke="none">2</text>
          <text x="1.5" y="16.6" fontSize="5.5" fill="currentColor" stroke="none">3</text>
          <line x1="8" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Keçid əlavə et"
        active={editor.isActive("link")}
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href as string | undefined;
          // A single URL prompt is the standard, dependency-free way to
          // collect a link target; no dialog primitive exists yet in
          // this design system.
          const url = window.prompt("Keçidin URL-i:", previousUrl ?? "https://");
          if (url === null) return;
          if (url.trim() === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
        }}
      >
        <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <rect x="2.5" y="7" width="8" height="6" rx="3" transform="rotate(-35 6.5 10)" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9.5" y="7" width="8" height="6" rx="3" transform="rotate(-35 13.5 10)" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        label="Sitat"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <line x1="5" y1="4" x2="5" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="8.5" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8.5" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8.5" y1="14" x2="13" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Geri al (Ctrl+Z)"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <path d="M7 5 3.5 8.5 7 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.5 8.5h8a4.5 4.5 0 1 1 0 9H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        label="Təkrar et (Ctrl+Y)"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <path d="M13 5l3.5 3.5L13 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16.5 8.5h-8a4.5 4.5 0 1 0 0 9H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolbarButton>
    </div>
  );
}
