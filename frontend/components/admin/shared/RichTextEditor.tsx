"use client";

import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { cn } from "@/lib/cn";
import { toEditableHtml } from "@/lib/richText";
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
};

/** Shared rich text editor (Tiptap) for any long-form text field backed
 * by a plain string column — originally built for Person.biography,
 * reused as-is for HistoricalEvent.detailedText. Storage stays exactly
 * what it already was for each field — the same string column/API
 * field, now holding sanitized HTML instead of plain text; see
 * `lib/richText.ts` for the legacy-content upgrade path and each public
 * page's sanitize-before-render step. A hidden `<input>` mirrors the
 * editor's HTML so the surrounding `<form>`'s existing
 * `FormData`-based submit needs no changes at all. */
export function RichTextEditor({ id, name, initialContent, error, hint, onEmptyChange }: Props) {
  const [initialHtml] = useState(() => toEditableHtml(initialContent));
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

  const editor = useEditor({
    // Tiptap SSRs a first pass that must match the client hydration
    // exactly; Next.js can't guarantee that for a contenteditable tree,
    // so this is the documented Tiptap+Next.js setting — editor is null
    // until just after mount instead.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Only the formats the toolbar actually exposes — keeps the
        // editor's behavior matched to the spec's exact format list.
        strike: false,
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
    ],
    content: initialHtml,
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML());
      onEmptyChange?.(editor.isEmpty);
    },
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[400px] max-h-[500px] overflow-y-auto rounded-b-md border border-stone-light bg-paper-soft px-3.5 py-2.5",
          "text-sm text-ink focus:outline-none",
          "[&_p]:my-2 first:[&_p]:mt-0 last:[&_p]:mb-0",
          "[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink",
          "[&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5",
          "[&_a]:text-forest [&_a]:underline [&_a]:underline-offset-2",
          "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-stone [&_blockquote]:pl-3 [&_blockquote]:text-ink-soft [&_blockquote]:italic",
        ),
        id,
        // Tiptap's `attributes` map is `{[name]: string}` — plain DOM
        // attribute strings, not React props, so aria-invalid/
        // aria-describedby are built directly here rather than reusing
        // FormField's `fieldA11yProps` (which returns a boolean for
        // aria-invalid, valid for JSX but not for this raw string map).
        ...(error ? { "aria-invalid": "true" } : {}),
        ...(hint || error ? { "aria-describedby": [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") } : {}),
      },
    },
  });

  return (
    // min-w-0: this sits inside FormField's flex column, where a flex
    // item's default min-width is its content's natural (unwrapped)
    // width — without this, the toolbar's own overflow-x-auto never
    // gets a chance to activate; the whole page grows to fit it instead
    // (confirmed by removing the toolbar and watching the page-level
    // horizontal overflow disappear).
    <div className="min-w-0">
      {editor ? <RichTextToolbar editor={editor} /> : null}
      <EditorContent editor={editor} />
      {/* readOnly: this is never user-edited directly (only via the
          editor above, through setHtml), so there's no missing-onChange
          concern — readOnly just tells React not to warn about it. */}
      <input type="hidden" id={`${id}-value`} name={name} value={html} readOnly />
    </div>
  );
}
