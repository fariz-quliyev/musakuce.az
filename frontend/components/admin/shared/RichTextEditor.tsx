"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { cn } from "@/lib/cn";
import { toEditableHtml } from "@/lib/richText";
import { mediaApi } from "@/lib/api/media";
import { RichTextToolbar } from "./RichTextToolbar";

type Props = {
  id: string;
  name: string;
  /** Raw stored value — either HTML from a previous editor save, or
   * legacy plain text from before this field had an editor. */
  initialContent: string;
  error?: string;
  hint?: string;
  /** Mirrors the field's emptiness up to the parent form, the same way
   * `ImageUploadField`'s `onUploaded` already lifts its own result —
   * `<textarea required>` can't apply to a contenteditable, so the
   * parent does its own pre-submit check with this instead. Only worth
   * wiring up for fields the parent actually treats as required. */
  onEmptyChange?: (isEmpty: boolean) => void;
  /** Opt-in: adds a "Şəkil əlavə et" toolbar button that uploads an
   * image (same `mediaApi.uploadAdmin` pipeline as `ImageUploadField`)
   * and inserts it at the cursor. Defaults to `false` so the other
   * caller of this shared editor (HistoricalEvent.detailedText) is
   * completely unaffected — inline images were only requested for
   * Person.biography. */
  allowImages?: boolean;
};

/** Builds the contenteditable's own DOM attributes — pulled out of the
 * `useEditor` call so the exact same class logic can be reapplied via
 * `editor.setOptions()` when fullscreen toggles, without recreating the
 * editor (see the effect below). Tiptap's `attributes` map is
 * `{[name]: string}` — plain DOM attribute strings, not React props, so
 * aria-invalid/aria-describedby are built directly here rather than
 * reusing FormField's `fieldA11yProps` (which returns a boolean for
 * aria-invalid, valid for JSX but not for this raw string map). */
function buildEditorAttributes(id: string, isFullscreen: boolean, error?: string, hint?: string) {
  return {
    class: cn(
      isFullscreen ? "h-full overflow-y-auto" : "min-h-[400px] max-h-[500px] overflow-y-auto",
      "rounded-b-md border border-stone-light bg-paper-soft px-3.5 py-2.5",
      "text-sm text-ink focus:outline-none",
      "[&_p]:my-2 first:[&_p]:mt-0 last:[&_p]:mb-0",
      "[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink",
      "[&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink",
      "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5",
      "[&_a]:text-forest [&_a]:underline [&_a]:underline-offset-2",
      "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-stone [&_blockquote]:pl-3 [&_blockquote]:text-ink-soft [&_blockquote]:italic",
      "[&_img]:my-2 [&_img]:max-h-[420px] [&_img]:max-w-full [&_img]:w-auto [&_img]:h-auto [&_img]:rounded-md",
      "[&_table]:my-2 [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse",
      "[&_th]:border [&_th]:border-stone-light [&_th]:bg-paper [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold",
      "[&_td]:border [&_td]:border-stone-light [&_td]:px-2 [&_td]:py-1 [&_td]:align-top",
    ),
    id,
    ...(error ? { "aria-invalid": "true" } : {}),
    ...(hint || error ? { "aria-describedby": [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") } : {}),
  };
}

/** Shared rich text editor (Tiptap) for any long-form text field backed
 * by a plain string column — originally built for Person.biography,
 * reused as-is for HistoricalEvent.detailedText. Storage stays exactly
 * what it already was for each field — the same string column/API
 * field, now holding sanitized HTML instead of plain text; see
 * `lib/richText.ts` for the legacy-content upgrade path and each public
 * page's sanitize-before-render step. A hidden `<input>` mirrors the
 * editor's HTML so the surrounding `<form>`'s existing
 * `FormData`-based submit needs no changes at all. */
export function RichTextEditor({ id, name, initialContent, error, hint, onEmptyChange, allowImages }: Props) {
  const [initialHtml] = useState(() => toEditableHtml(initialContent));
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageStatus, setImageStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [imageError, setImageError] = useState<string | null>(null);
  // Held in state (not just mirrored onto a ref-mutated hidden input) so
  // it survives the parent form re-rendering for unrelated reasons
  // (e.g. a publish-status picker, an upload-disable flag elsewhere in
  // the form) — an <input type="hidden"> whose value is set only
  // imperatively via a ref, with `defaultValue` for the initial render,
  // gets reset back to that defaultValue by React on the component's
  // next re-render (confirmed: hidden inputs don't get the same "dirty
  // value" exemption typed inputs do). A genuinely controlled `value`
  // doesn't have that problem — React reapplies the current state on
  // every render, which is exactly what's needed here.
  const [html, setHtml] = useState(initialHtml);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editor = useEditor({
    // Tiptap SSRs a first pass that must match the client hydration
    // exactly; Next.js can't guarantee that for a contenteditable tree,
    // so this is the documented Tiptap+Next.js setting — editor is null
    // until just after mount instead.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      TextAlign.configure({ types: ["paragraph", "heading"] }),
      // resizable: false — no drag handles/inline mode, keeps this from
      // ever growing wider than the editor and needing extra mobile-
      // overflow handling (same reasoning as Image below).
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      // Block-level, default config — no resize handles/inline mode,
      // since nothing in the spec asked for manual resizing and the
      // [&_img] rule below already keeps it from ever overflowing.
      ...(allowImages ? [Image] : []),
    ],
    content: initialHtml,
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML());
      onEmptyChange?.(editor.isEmpty);
    },
    editorProps: {
      attributes: buildEditorAttributes(id, false, error, hint),
    },
  });

  // Fullscreen toggles the editor's own height (min-h-[400px]
  // max-h-[500px] normally, fills the viewport instead) — done via
  // editor.setOptions() rather than recreating the editor (e.g. keying
  // EditorContent on isFullscreen), which would drop selection/undo
  // history. `class` is the only attribute that actually changes here;
  // rebuilding the full attributes object keeps id/aria-* stable too.
  useEffect(() => {
    editor?.setOptions({ editorProps: { attributes: buildEditorAttributes(id, isFullscreen, error, hint) } });
  }, [editor, isFullscreen, id, error, hint]);

  useEffect(() => {
    if (!isFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsFullscreen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  async function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Without this, re-selecting the exact same file right after an
    // earlier insert wouldn't fire another change event.
    event.target.value = "";
    if (!file || !editor) return;

    setImageStatus("uploading");
    setImageError(null);
    try {
      const media = await mediaApi.uploadAdmin(file);
      // Same window.prompt pattern the link button above already uses —
      // no dialog primitive exists in this design system yet. Alt text
      // is optional, so Cancel (null) just means "no alt", not "abort".
      const alt = window.prompt("Şəkil üçün alt mətn (istəyə bağlı):", "") ?? "";
      editor.chain().focus().setImage({ src: media.url, alt }).run();
      setImageStatus("idle");
    } catch (err) {
      setImageStatus("error");
      setImageError(err instanceof Error ? err.message : "Şəkil yüklənə bilmədi.");
    }
  }

  return (
    // min-w-0: this sits inside FormField's flex column, where a flex
    // item's default min-width is its content's natural (unwrapped)
    // width — without this, the toolbar's own overflow-x-auto never
    // gets a chance to activate; the whole page grows to fit it instead
    // (confirmed by removing the toolbar and watching the page-level
    // horizontal overflow disappear).
    <div
      className={cn(
        "min-w-0",
        // Fullscreen: same fixed full-viewport overlay pattern as
        // PersonAlbumLightbox (z-50, well above the sticky save bar's
        // z-10) — content grows to fill it via the flex column below.
        isFullscreen ? "fixed inset-0 z-50 flex flex-col gap-0 bg-paper p-4 sm:p-6" : null,
      )}
    >
      {editor ? (
        <RichTextToolbar
          editor={editor}
          onInsertImageClick={allowImages ? () => imageInputRef.current?.click() : undefined}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen((v) => !v)}
        />
      ) : null}
      {allowImages ? (
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleImageFileChange}
          className="hidden"
        />
      ) : null}
      {imageStatus === "uploading" ? <p className="mt-1 text-xs text-ink-faint">Şəkil yüklənir…</p> : null}
      {imageStatus === "error" ? <p className="mt-1 text-xs font-medium text-danger">{imageError}</p> : null}
      <EditorContent editor={editor} className={isFullscreen ? "min-h-0 flex-1" : undefined} />
      {/* readOnly: this is never user-edited directly (only via the
          editor above, through setHtml), so there's no missing-onChange
          concern — readOnly just tells React not to warn about it. */}
      <input type="hidden" id={`${id}-value`} name={name} value={html} readOnly />
    </div>
  );
}
