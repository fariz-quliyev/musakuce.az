# Temporary visual-demo photography — sources & license record

> **These photographs are temporary visual-demo assets and do not
> represent actual Musaküçə locations or people.** They were chosen only
> to evaluate how the Phase 3 homepage looks with real photography
> instead of `PhotoPlaceholder` blocks, per an explicit request that
> Musaküçə-specific imagery was *not* required for this pass. None of
> them should be read as, or carried forward into, real production
> content — see `SOURCES.md` in this same folder for the (separate,
> unsuccessful) research into genuine, clearly-licensed Musaküçə
> photography.

All images below are sourced from **Pexels**, whose platform-wide
[Pexels License](https://www.pexels.com/license/) permits free use
(including modification and commercial use) without requiring
attribution. Attribution is nonetheless recorded below as good practice
and so a real photographer credit can be swapped in cleanly if any of
these images were ever kept beyond this demo.

Every source photo was individually checked to confirm it does **not**
depict a specific famous/identifiable landmark, and does not depict a
named village other than Musaküçə being implied as Musaküçə (several
candidates were rejected during sourcing for exactly this reason — e.g.
a photo of Rooms Hotel Kazbegi / Gergeti Trinity Church in Georgia was
found and explicitly excluded).

## File manifest

| File | Used for | Photographer | Source page | License |
|---|---|---|---|---|
| `hero-demo.jpg` | Hero background; also reused (smaller crop) in the "Musaküçə haqqında" intro photo and the "Bu gün kənddə" featured card | Thomas P | [pexels.com/photo/30075079](https://www.pexels.com/photo/scenic-countryside-landscape-with-farmhouses-30075079/) | Pexels License |
| `old-photos-demo.jpg` | "yeni fotolar" bulletin thumbnail in the "Bu gün kənddə" list | Ayşenaz Bilgin | [pexels.com/photo/15305667](https://www.pexels.com/photo/old-sepia-toned-photographs-15305667/) | Pexels License |

### Removed

Eight further demo photos (`harvest-field`, `misty-river`,
`historic-archway`, `children-rural`, `elder-woman`, `elder-man`,
`elder-man-2`, `cow-pasture`) were deleted once the listings, photo-grid,
people and voices sections moved to the real API — the only code that
referenced them was the mock fixture block removed from
`lib/mock-content.ts`.

## Intentionally left as `PhotoPlaceholder`

- **MapPreview illustration** — this is hand-drawn SVG art, not a photo
  placeholder, and was left untouched per the "keep layout/structure"
  instruction.
- Records served by the API that have no uploaded image fall back to
  `PhotoPlaceholder` at render time; that is the intended behaviour and
  needs no demo stand-in.

## Notes

- Images were downloaded once via direct Pexels CDN URLs
  (`images.pexels.com`) at large widths (1200–2400px) and are served
  through Next.js's built-in Image Optimization (`next/image`), which
  automatically re-encodes to WebP/AVIF and resizes per breakpoint at
  request time — no separate manual compression step was needed.
- If any of these are ever promoted beyond "temporary demo," re-confirm
  the Pexels License terms at that time and consider swapping in
  properly-credited, higher-resolution originals.
