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

// Regression coverage for adding strikethrough/text-align/table support
// to the shared RichTextEditor (Education.content, and — since the
// allowlist is shared — Person.biography/HistoricalEvent.detailedText).

test("sanitizeRichText keeps <s> (strikethrough) intact", () => {
  const html = sanitizeRichText("<p><s>silinmiş</s> mətn</p>");
  assert.match(html, /<s>silinmiş<\/s>/);
});

test("sanitizeRichText keeps a table with header/body rows intact", () => {
  const html = sanitizeRichText(
    "<table><thead><tr><th>Ad</th></tr></thead><tbody><tr><td>Dəyər</td></tr></tbody></table>",
  );
  assert.match(html, /<table><thead><tr><th>Ad<\/th><\/tr><\/thead><tbody><tr><td>Dəyər<\/td><\/tr><\/tbody><\/table>/);
});

test("sanitizeRichText keeps a valid text-align style value", () => {
  for (const value of ["left", "center", "right", "justify"]) {
    const html = sanitizeRichText(`<p style="text-align: ${value}">mətn</p>`);
    assert.match(html, new RegExp(`style="text-align: ${value}"`));
  }
});

test("sanitizeRichText strips a style value that isn't exactly text-align", () => {
  const cases = [
    'color:red',
    'text-align: center; background: url(javascript:alert(1))',
    'expression(alert(1))',
    'behavior:url(xss.htc)',
    '-moz-binding:url(xss.xml)',
  ];
  for (const value of cases) {
    const html = sanitizeRichText(`<p style="${value}">mətn</p>`);
    assert.equal(html.includes("style"), false, `style="${value}" must be stripped`);
  }
});
