import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeRichText } from "./richText.ts";

// Regression coverage for adding <img>/src/alt to the RichTextEditor's
// sanitization allowlist (Person.biography inline images) — every case
// here must still hold after that change, since the same allowlist is
// shared with HistoricalEvent.detailedText too.

test("sanitizeRichText strips <img src=\"javascript:...\">", () => {
  const html = sanitizeRichText('<p>text</p><img src="javascript:alert(1)" alt="x">');
  assert.equal(html.includes("javascript:"), false, "javascript: URI must not survive sanitization");
});

test("sanitizeRichText strips <img src=\"data:...\">", () => {
  const html = sanitizeRichText('<img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==" alt="x">');
  assert.equal(html.includes("data:"), false, "data: URI must not survive sanitization");
});

test("sanitizeRichText strips onerror/onload from <img>", () => {
  const html = sanitizeRichText('<img src="https://media.musakuce.az/photo.webp" onerror="alert(1)" onload="alert(2)">');
  assert.equal(html.includes("onerror"), false);
  assert.equal(html.includes("onload"), false);
});

test("sanitizeRichText keeps a legitimate <img src alt> intact", () => {
  const html = sanitizeRichText('<p>Before</p><img src="https://media.musakuce.az/photos/2026/08/x/display.webp" alt="Kənd mənzərəsi"><p>After</p>');
  assert.match(html, /<img src="https:\/\/media\.musakuce\.az\/photos\/2026\/08\/x\/display\.webp" alt="Kənd mənzərəsi">/);
});

test("sanitizeRichText still strips <script> tags (regression)", () => {
  const html = sanitizeRichText('<p>text</p><script>alert(1)</script>');
  assert.equal(html.includes("<script"), false);
  assert.equal(html.includes("alert(1)"), false);
});

test("sanitizeRichText still strips disallowed tags/attrs on non-img elements (regression)", () => {
  const html = sanitizeRichText('<div onclick="alert(1)"><p style="color:red">text</p></div>');
  assert.equal(html.includes("<div"), false);
  assert.equal(html.includes("onclick"), false);
  assert.equal(html.includes("style"), false);
  assert.match(html, /^<p>text<\/p>$/);
});

test("sanitizeRichText keeps existing link sanitization behavior intact (regression)", () => {
  const html = sanitizeRichText('<a href="javascript:alert(1)">click</a><a href="https://example.com" target="_blank" rel="noopener">ok</a>');
  assert.equal(html.includes("javascript:"), false);
  assert.match(html, /<a href="https:\/\/example\.com" target="_blank" rel="noopener">ok<\/a>/);
});
