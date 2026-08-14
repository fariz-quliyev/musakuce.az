import { test } from "node:test";
import assert from "node:assert/strict";
import { articleJsonLd, breadcrumbJsonLd, jsonLdScript, websiteJsonLd } from "./structuredData.ts";

// P0-1 regression coverage — docs/FINAL_PRE_DEPLOYMENT_AUDIT.md P0-1.
//
// `<script type="application/ld+json">…</script>` content is parsed by the
// HTML tokenizer as raw text up to the first literal `</script`
// (case-insensitive), independent of JSON syntax. `JSON.stringify` alone
// does not escape that sequence, so DB-sourced text (a listing title, a
// memorial name, …) containing `</script><script>alert(1)</script>` can
// close the tag early and inject real, executing markup. `jsonLdScript`
// is the fix: every `<`, `>`, `&` is escaped to its `\uXXXX` JSON form
// before the string reaches the DOM.

const XSS_PAYLOAD = "</script><script>alert(1)</script>";

test("jsonLdScript strips every literal angle bracket from the output", () => {
  const html = jsonLdScript({ title: XSS_PAYLOAD });
  assert.equal(html.includes("<"), false, "output must contain no literal '<'");
  assert.equal(html.includes(">"), false, "output must contain no literal '>'");
});

test("jsonLdScript neutralizes the exact </script> breakout sequence when embedded in a real <script> tag", () => {
  const html = jsonLdScript({ title: XSS_PAYLOAD });
  const fullDocumentFragment = `<script type="application/ld+json">${html}</script>`;

  // Simulate what an HTML tokenizer does: scan for the first case-
  // insensitive `</script` sequence. If the fix works, the ONLY match is
  // the genuine closing tag appended at the very end of the fragment —
  // not anything from the attacker-controlled title.
  const firstMatch = fullDocumentFragment.search(/<\/script/i);
  const genuineClosingTagIndex = fullDocumentFragment.lastIndexOf("</script>");

  assert.notEqual(firstMatch, -1, "sanity check: the genuine closing tag must still exist");
  assert.equal(
    firstMatch,
    genuineClosingTagIndex,
    "the payload's </script> must not be reachable before the real closing tag",
  );
});

test("jsonLdScript output round-trips through JSON.parse back to the original (unescaped) value — semantics preserved, DB content unaltered", () => {
  const html = jsonLdScript({ title: XSS_PAYLOAD });
  const parsed = JSON.parse(html) as { title: string };
  assert.equal(parsed.title, XSS_PAYLOAD, "JSON.parse must recover the exact original string");
});

test("jsonLdScript leaves ordinary Azerbaijani text semantically untouched (no global sanitization)", () => {
  const legit = "Musaküçə kənd məscidinin tikintisi — \"1902–1903\" & digər tarixi məlumatlar";
  const html = jsonLdScript({ description: legit });
  const parsed = JSON.parse(html) as { description: string };
  assert.equal(parsed.description, legit, "legitimate text must be preserved exactly after round-trip");
});

test("jsonLdScript neutralizes a payload inside a real breadcrumbJsonLd structure (mirrors actual page usage)", () => {
  const crumbs = breadcrumbJsonLd([
    { name: "Ana səhifə", path: "/" },
    { name: "Elanlar", path: "/elanlar" },
    { name: XSS_PAYLOAD, path: "/elanlar/mock-1" },
  ]);
  const html = jsonLdScript(crumbs);
  const fullDocumentFragment = `<script type="application/ld+json">${html}</script>`;

  assert.equal(html.includes("<"), false);
  const firstMatch = fullDocumentFragment.search(/<\/script/i);
  const genuineClosingTagIndex = fullDocumentFragment.lastIndexOf("</script>");
  assert.equal(firstMatch, genuineClosingTagIndex);

  // Structure/semantics intact: the malicious string is still present,
  // verbatim, as ordinary JSON-LD data once parsed — not stripped.
  const parsed = JSON.parse(html) as { itemListElement: { name: string }[] };
  assert.equal(parsed.itemListElement[2].name, XSS_PAYLOAD);
});

test("jsonLdScript neutralizes a payload inside a real articleJsonLd structure", () => {
  const article = articleJsonLd({
    headline: XSS_PAYLOAD,
    description: "Təsvir",
    url: "/medeniyyet/mock-1",
  });
  const html = jsonLdScript(article);
  assert.equal(html.includes("</script"), false);
  assert.equal(html.includes("<script"), false);
});

test("jsonLdScript produces valid JSON for the real site-wide websiteJsonLd payload (no false-positive breakage on ordinary data)", () => {
  const html = jsonLdScript(websiteJsonLd());
  assert.doesNotThrow(() => JSON.parse(html));
  const parsed = JSON.parse(html) as Record<string, unknown>;
  assert.equal(parsed["@type"], "WebSite");
});

test("legacy JSON.stringify (pre-fix behavior) is demonstrably unsafe — documents why the fix is necessary", () => {
  const unsafeHtml = JSON.stringify({ title: XSS_PAYLOAD });
  const fullDocumentFragment = `<script type="application/ld+json">${unsafeHtml}</script>`;
  const firstMatch = fullDocumentFragment.search(/<\/script/i);
  const genuineClosingTagIndex = fullDocumentFragment.lastIndexOf("</script>");
  // The payload's own </script> is reachable BEFORE the real closing tag —
  // this is the exact vulnerability P0-1 fixes.
  assert.notEqual(firstMatch, genuineClosingTagIndex);
});
