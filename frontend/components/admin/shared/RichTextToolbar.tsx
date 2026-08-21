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
type RichTextToolbarProps = {
  editor: Editor;
  /** Opt-in: renders a "Şəkil əlavə et" button that calls this instead
   * of an editor command directly — image insertion needs an async
   * upload step first (owned by RichTextEditor), unlike every other
   * button here which just dispatches a synchronous editor.chain()
   * call. Omitted entirely by callers that don't pass `allowImages`. */
  onInsertImageClick?: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
};

export function RichTextToolbar({ editor, onInsertImageClick, isFullscreen, onToggleFullscreen }: RichTextToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Mətn formatlaşdırma"
      className="flex w-full min-w-0 shrink-0 items-center gap-0.5 overflow-x-auto rounded-t-md border border-b-0 border-stone-light bg-paper-soft px-2 py-1.5"
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
      <ToolbarButton
        label="Üstündən xətt"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <span className="line-through">S</span>
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
        label="Sola düzləndir"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="9" x2="12" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="13" x2="17" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="17" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        label="Mərkəzə düzləndir"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="5.5" y1="9" x2="14.5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="13" x2="17" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="5.5" y1="17" x2="14.5" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        label="Sağa düzləndir"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="13" x2="17" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="17" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        label="İki tərəfə düzləndir"
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="13" x2="17" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="17" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
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
      {onInsertImageClick ? (
        <>
          <ToolbarButton label="Şəkil əlavə et" onClick={onInsertImageClick}>
            <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <rect x="2.5" y="4" width="15" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="7" cy="8.5" r="1.4" stroke="currentColor" strokeWidth="1.3" />
              <path d="M3.5 14.5 8 10.5l2.5 2.3 3-3 3 3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ToolbarButton>
          {/* Seçili şəklin mətnə görə yerləşməsi — mətn şəklin ətrafından
              axsın deyə sol/sağ float, ya da normal (tam en) blok. Yalnız
              kursor/seçim bir şəkil node-unun üzərindəysə aktivdir, TextAlign
              düymələri kimi qarşılıqlı-eksklüziv 3-lük qrup. */}
          <ToolbarButton
            label="Şəkli sola yerləşdir (mətn sağdan axsın)"
            active={editor.isActive("image", { float: "left" })}
            disabled={!editor.isActive("image")}
            onClick={() => editor.chain().focus().updateAttributes("image", { float: "left" }).run()}
          >
            <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <rect x="2.5" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <line x1="10.5" y1="5.5" x2="17.5" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10.5" y1="8.5" x2="17.5" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2.5" y1="13.5" x2="17.5" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2.5" y1="16.5" x2="12.5" y2="16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            label="Şəkli sağa yerləşdir (mətn soldan axsın)"
            active={editor.isActive("image", { float: "right" })}
            disabled={!editor.isActive("image")}
            onClick={() => editor.chain().focus().updateAttributes("image", { float: "right" }).run()}
          >
            <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <rect x="11.5" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <line x1="2.5" y1="5.5" x2="9.5" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2.5" y1="8.5" x2="9.5" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2.5" y1="13.5" x2="17.5" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="7.5" y1="16.5" x2="17.5" y2="16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            label="Şəkli normal (tam en) göstər"
            active={editor.isActive("image", { float: null })}
            disabled={!editor.isActive("image")}
            onClick={() => editor.chain().focus().updateAttributes("image", { float: null }).run()}
          >
            <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <rect x="2.5" y="5" width="15" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <line x1="2.5" y1="15.5" x2="17.5" y2="15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </ToolbarButton>
        </>
      ) : null}

      <Divider />

      <ToolbarButton
        label="Cədvəl əlavə et"
        active={editor.isActive("table")}
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <rect x="2.5" y="3.5" width="15" height="13" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <line x1="2.5" y1="8" x2="17.5" y2="8" stroke="currentColor" strokeWidth="1.3" />
          <line x1="2.5" y1="12.3" x2="17.5" y2="12.3" stroke="currentColor" strokeWidth="1.3" />
          <line x1="10" y1="3.5" x2="10" y2="16.5" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </ToolbarButton>
      {editor.isActive("table") ? (
        <ToolbarButton label="Cədvəli sil" onClick={() => editor.chain().focus().deleteTable().run()}>
          <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <rect x="2.5" y="3.5" width="15" height="13" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <line x1="6.5" y1="7.5" x2="13.5" y2="12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="13.5" y1="7.5" x2="6.5" y2="12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </ToolbarButton>
      ) : null}

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

      <Divider />

      <ToolbarButton
        label={isFullscreen ? "Tam ekrandan çıx (Esc)" : "Tam ekran"}
        active={isFullscreen}
        onClick={onToggleFullscreen}
      >
        {isFullscreen ? (
          <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path d="M8 3.5H3.5V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 3.5h4.5V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 16.5H3.5V12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 16.5h4.5V12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path d="M3.5 8V3.5H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16.5 8V3.5H12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.5 12v4.5H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16.5 12v4.5H12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </ToolbarButton>
    </div>
  );
}
