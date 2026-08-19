import DOMPurify from "isomorphic-dompurify";

// DOMPurify's default config allows data: URIs specifically on <img src>
// (its built-in DATA_URI_TAGS set includes "img") — there's no config
// key to remove that, only ADD_DATA_URI_TAGS to add more tags on top of
// it. Every inline image here always comes from mediaApi.uploadAdmin (a
// real https:// R2 URL); a data: URI never has a legitimate reason to
// appear, so this hook closes that one gap without loosening anything
// else. isomorphic-dompurify is only ever imported here (grepped), so
// this module-level hook can't affect any other sanitize() call in the
// app. Registered once at module load — addHook is not idempotent, so
// this must not run inside sanitizeRichText itself.
DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
  if (data.attrName === "src" && node.nodeName === "IMG" && data.attrValue.trim().toLowerCase().startsWith("data:")) {
    data.keepAttr = false;
  }
});

const HTML_TAG_PATTERN = /<[a-z][\s\S]*>/i;

/** True once a long-form text field (Person.biography, HistoricalEvent.
 * detailedText, ...) has been saved at least once by the shared
 * `RichTextEditor` — its content always starts with a real HTML tag. A
 * legacy plain-text value (saved by the old `<textarea>` each of these
 * fields started out as) never does, short of an admin having typed a
 * literal "<" themselves, which degrades gracefully (rendered as text
 * either way, never executed). */
export function isHtmlContent(text: string): boolean {
  return HTML_TAG_PATTERN.test(text);
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Upgrades legacy plain text into the same paragraph/line-break HTML
 * shape the editor itself would produce — blank lines become paragraph
 * breaks, single newlines become <br>, matching how these fields used
 * to render as plain text with `whitespace-pre-line`. This is what
 * makes the editor (and the public pages) backward compatible with
 * every value written before it existed, with no backend change or
 * migration. */
export function plainTextToEditorHtml(text: string): string {
  if (text.trim() === "") return "";
  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/** Single entry point the editor (on load) and the public pages (on
 * render) both use, so a value looks identical in either place
 * regardless of whether it predates the rich text editor. */
export function toEditableHtml(value: string): string {
  return isHtmlContent(value) ? value : plainTextToEditorHtml(value);
}

/** Exactly the formats the admin toolbar can produce — nothing else is
 * ever allowed through, regardless of what a stored value actually
 * contains (defense in depth: also covers content written directly
 * through the API, not just the editor). `img`/`src`/`alt` cover the
 * editor's inline-image button (Person.biography only). Deliberately
 * NOT setting DOMPurify's `ALLOWED_URI_REGEXP`/`ALLOW_UNKNOWN_PROTOCOLS`/
 * `ADD_DATA_URI_TAGS` — its built-in default URI regex already excludes
 * `javascript:`/`data:`/`vbscript:` for every URI-bearing attribute
 * here (href and now src alike), and the CSP `img-src` directive
 * (proxy.ts) already restricts which hosts the browser will load
 * images from at all. Loosening either would be exactly the kind of
 * unnecessary policy expansion to avoid — this allowlist stays a pure
 * allowlist, so `onerror`/`onload`/`style`/etc. are stripped from any
 * tag (img included) the same way they always were. */
const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "h2", "h3", "ul", "ol", "li", "a", "blockquote", "img"];
const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt"];

/** The only way any `RichTextEditor`-backed field may reach
 * `dangerouslySetInnerHTML` — never render a raw stored value (or the
 * editor's own output) directly. */
export function sanitizeRichText(value: string): string {
  return DOMPurify.sanitize(toEditableHtml(value), { ALLOWED_TAGS, ALLOWED_ATTR });
}

/** Strips tags entirely for contexts that need real plain text — meta
 * descriptions, JSON-LD — where leaking `<strong>` etc. into a search
 * snippet would look broken rather than merely unstyled. */
export function richTextToPlainText(value: string): string {
  return sanitizeRichText(value)
    .replace(/<\/(p|li|h2|h3|blockquote)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}
