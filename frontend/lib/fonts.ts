import { Poppins } from "next/font/google";

/**
 * Single typeface for the whole site — Poppins, matching the reference
 * the client asked for (e-social.gov.az sets `Poppins, sans-serif` on
 * body, headings and navigation alike; 721 of its elements compute to
 * it, everything else there is icon fonts).
 *
 * Azerbaijani coverage was verified rather than assumed: measured in the
 * browser against real loaded Poppins, every letter the site needs
 * (ə Ə ğ Ğ ı İ ö Ö ü Ü ş Ş ç Ç) renders from Poppins itself instead of
 * falling through to a fallback — schwa in particular, which many Latin
 * faces omit and which would have broken most Azerbaijani words.
 *
 * Poppins is not a variable font, so weights are enumerated and each one
 * is a separate download: 400 (body), 500 (font-medium, ~151 uses), 600
 * (font-semibold, ~86), 700 (font-bold, ~7). Nothing in the codebase
 * uses the lighter or heavier ends, so they are left out.
 *
 * Exposed as one variable; globals.css points both the --font-display
 * and --font-body tokens at it. That keeps the display/body distinction
 * in the design system — if a separate heading face is ever wanted
 * again, it is one line there rather than a sweep through components.
 */
export const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
