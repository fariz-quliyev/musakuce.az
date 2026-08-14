import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

/**
 * Display/heading typeface — warm editorial serif for the "Modern
 * Heritage" identity (hero headline, section headings, pull quotes).
 * `latin-ext` is required for Azerbaijani letters (ə, ğ, ı, ö, ş, ü, ç).
 */
export const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "SOFT", "WONK"],
});

/**
 * Body/UI typeface — friendly humanist sans for text, navigation, forms
 * and buttons. Chosen over a generic corporate/SaaS sans for warmth and
 * legibility (including for older residents on small screens).
 */
export const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});
