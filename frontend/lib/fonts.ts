import { Noto_Sans } from "next/font/google";

/**
 * Single typeface for the whole site — Noto Sans, standing in for the
 * reference site's Open Sans (riseleyparishcouncil.gov.uk sets
 * `"Open Sans", sans-serif` on every text element: 400 body, 600
 * headings, 700 navigation).
 *
 * Open Sans itself can't be used: its current release (3.003 — the same
 * files Google Fonts serves and Riseley self-hosts) has no capital schwa
 * Ə (U+018F), confirmed in its cmap and in the browser, so "Əziz" would
 * render its first letter from a fallback face. Noto Sans and Open Sans
 * are close in metrics and visual character — measured: x-height .536
 * vs .535, cap height .714 for both, ascender 1.069 and descender −.293
 * for both (so the same baseline and line box), Noto ~1% wider — and
 * Noto Sans was chosen because it covers the full Azerbaijani alphabet:
 * Ə ə Ş ş Ğ ğ Ç ç Ö ö Ü ü İ ı. Coverage was checked in the files
 * themselves and by rendering in the browser.
 *
 * Variable font, so no `weight` list: one file per subset carries the
 * whole weight axis, including the four the codebase uses — 400 (body),
 * 500 (font-medium), 600 (font-semibold, headings — Riseley's heading
 * weight), 700 (font-bold). Google serves the same variable file even
 * when discrete weights are requested, so listing them would only add
 * @font-face rules. Both subsets are needed: Ç Ö Ü ı live in `latin`,
 * Ə ə Ş ş Ğ ğ İ in `latin-ext`.
 *
 * Exposed as one variable; globals.css points both the --font-display
 * and --font-body tokens at it, so a separate heading face stays a
 * one-line change there.
 */
export const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});
