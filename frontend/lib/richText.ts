import DOMPurify from "isomorphic-dompurify";

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
 * through the API, not just the editor). */
const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "h2", "h3", "ul", "ol", "li", "a", "blockquote"];
const ALLOWED_ATTR = ["href", "target", "rel"];

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
