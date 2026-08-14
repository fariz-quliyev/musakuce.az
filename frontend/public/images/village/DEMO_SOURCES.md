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
| `harvest-field-demo.jpg` | "Payız biçini" photo-grid item; reused for the "Kombayn xidməti" listing card | Damir K. | [pexels.com/photo/33447908](https://www.pexels.com/photo/tractor-harvesting-in-a-golden-wheat-field-33447908/) | Pexels License |
| `misty-river-demo.jpg` | "Səhər çənli Viləş çayı" photo-grid item | Carolin Wenske | [pexels.com/photo/32176277](https://www.pexels.com/photo/misty-morning-by-a-quiet-riverside-landscape-32176277/) | Pexels License |
| `historic-archway-demo.jpg` | "Məscid həyətində" photo-grid item | Ebahir | [pexels.com/photo/29409464](https://www.pexels.com/photo/historic-stone-archway-of-middle-eastern-mosque-29409464/) | Pexels License |
| `children-rural-demo.jpg` | "Uşaqlar məktəb həyətində" photo-grid item | Lan Yao | [pexels.com/photo/19579253](https://www.pexels.com/photo/kids-playing-on-the-playground-in-a-rural-area-19579253/) | Pexels License |
| `old-photos-demo.jpg` | "Bir foto — bir hekayə" featured story image; reused as the "yeni fotolar" bulletin thumbnail | Ayşenaz Bilgin | [pexels.com/photo/15305667](https://www.pexels.com/photo/old-sepia-toned-photographs-15305667/) | Pexels License |
| `elder-woman-demo.jpg` | "Zeynəb müəllimə" and "Səlimə nənə" (İnsanlarımız); "Səlimə nənə" (Kəndimizin səsi) | Molnár Tamás Photography | [pexels.com/photo/portrait-of-a-senior-woman-wearing-a-blue-headscarf-25745222](https://pexels.com/photo/portrait-of-a-senior-woman-wearing-a-blue-headscarf-25745222/) | Pexels License |
| `elder-man-demo.jpg` | "Kərim baba" (İnsanlarımız and Kəndimizin səsi) | Ahmet Özcan | [pexels.com/photo/34559139](https://www.pexels.com/photo/portrait-of-elderly-man-with-weathered-face-outdoors-34559139/) | Pexels License |
| `elder-man-2-demo.jpg` | "Hüseyn kişi" (Kəndimizin səsi) | Henk Schuurmans | [pexels.com/photo/15098402](https://www.pexels.com/photo/portrait-of-an-eldery-village-man-15098402/) | Pexels License |
| `cow-pasture-demo.jpg` | "Süd inəyi satılır" listing card | Rachel Claire | [pexels.com/photo/4577861](https://www.pexels.com/photo/cows-pasturing-on-field-in-countryside-4577861/) | Pexels License |

## Intentionally left as `PhotoPlaceholder`

- **VillageSquare → "Açar dəstəsi tapılıb"** (lost & found listing) — no
  generic stock photo was a good enough match; a placeholder is more
  honest than an arbitrary stand-in.
- **OurPeople → "Aqşin" (İdmançı)** — no suitable generic rural-athlete
  photo was found; kept as placeholder rather than force-fitting a
  mismatched image.
- **MapPreview illustration** — this is hand-drawn SVG art, not a photo
  placeholder, and was left untouched per the "keep layout/structure"
  instruction.

## Notes

- Images were downloaded once via direct Pexels CDN URLs
  (`images.pexels.com`) at large widths (1200–2400px) and are served
  through Next.js's built-in Image Optimization (`next/image`), which
  automatically re-encodes to WebP/AVIF and resizes per breakpoint at
  request time — no separate manual compression step was needed.
- If any of these are ever promoted beyond "temporary demo," re-confirm
  the Pexels License terms at that time and consider swapping in
  properly-credited, higher-resolution originals.
