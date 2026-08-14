# Musaküçə photography — source research log (temporary)

**Status: no photographs were downloaded or added.** This directory exists
per the requested structure but is currently empty of real images. Every
homepage slot still uses `PhotoPlaceholder`, per the explicit fallback
instruction for this task ("if a suitable real photograph cannot be
verified, keep PhotoPlaceholder for that slot rather than inventing one").

This file is a temporary research record, not production content — delete
or fold it into a real media-sourcing doc once the CMS/media pipeline
exists.

## Why nothing was used

Real, specifically-Musaküçə photographs **do exist online** and were
found (see table below) — but every one of them is published with no
license grant (default "bütün hüquqlar qorunur" / all rights reserved, no
Creative Commons or public-domain statement). Downloading and
redistributing them here would not have "a clear basis for use," which
the task explicitly required. Wikimedia Commons — the one source that
would have provided clearly-reusable images — has **zero** files tagged
for Musaküçə; the only Masallı-district village photos it holds are for
*other* villages (Qasımlı, Mahmudavar), which were correctly excluded
rather than substituted, per the "don't use another village's photo"
instruction.

## Sources checked

| Source | What it has | License / rights status | Verdict |
|---|---|---|---|
| [Wikimedia Commons — MediaSearch "Musaküçə"](https://commons.wikimedia.org/w/index.php?search=Musak%C3%BCc%C9%99&title=Special:MediaSearch&type=image) | Zero results | N/A | Nothing to use |
| [English Wikipedia — Musaküçə](https://en.wikipedia.org/wiki/Musak%C3%BCc%C9%99) | Map/flag icons only, no photos | N/A | Nothing to use |
| [Azerbaijani Wikipedia — Musaküçə](https://az.wikipedia.org/wiki/Musak%C3%BC%C3%A7%C9%99) | Map/flag icons only, no photos | N/A | Nothing to use |
| [Sirat.az — Musaküçə kənd məscidi (2021)](https://sirat.az/2021/10/12/masalli-rayonu-musakuc%C9%99-k%C9%99nd-m%C9%99scidi/) | ~10 real photos of the 1903 mosque (exterior, portico, interior, minbar) | "© Sirat. Bütün hüquqlar qorunur" — all rights reserved, no reuse grant | **Rejected — real, on-topic, but not licensed** |
| [Masallı Rayon İcra Hakimiyyəti — official Musaküçə page](http://masalli-ih.gov.az/az/page/musakuce.html) | 7 real photos embedded in the official village history page | No license/reuse statement found; Azerbaijani state-body works are not blanket public domain | **Rejected — real, on-topic, but not licensed** |
| [Cenub.az — "Masallı ensiklopediyası": Musaküçə İnzibati Ərazi dairəsi](https://cenub.az/12189-musakuc-nzibati-razi-dairsi.html) | ~11 real photos: mosque, Çapayev kolkhoz, 1928 first school graduating class, 1980s teachers, 19th-c. mill, WWII memorial, post office, clinic | "Copyright © 2013–2021 Bütün hüquqlar qorunur" — all rights reserved | **Rejected — the richest match to the spec's History/School/Heroes content, but not licensed** |
| [Masallıda.az — Musaküçə inzibati ərazi vahidi](https://masallida.az/119-musakuc-inzibati-razi-vahidi.html) | No photos of the village itself | "Bütün Hüquqlar Qorunur" | Nothing to use |
| Musaküçə Bələdiyyəsi Facebook page (found via search, not accessed) | Likely real municipality photos | Platform ToS prohibits scraping/redistribution regardless of underlying rights | Not accessed — not a valid source for this use |
| ["Musakuce dron çəkilişi Masallı" — YouTube](https://www.youtube.com/watch?v=jnKlbYfLiZM) | Drone footage, apparently of the real village | Standard YouTube license (all rights reserved) unless the uploader marked it CC-BY, which was not confirmed | **Not used as a still image** — extracting/downloading a frame would violate both copyright and YouTube's terms. See recommendation below for a compliant way to use this instead. |
| [Radio Azadlıq — "Həsir toxuyan qadınlar" (video)](https://www.azadliq.org/a/25296939.html) | Video about həsirçilik (mat-weaving) in Musaküçə | RFE/RL editorial content, rights reserved | Not used |
| [kataloq.gomap.az — Musaküçə settlement listing](https://kataloq.gomap.az/az/all-poi/settlements/settlement/679a1a1ec43d4a64b0d36dbe149ddaaf) | Directory listing | Not evaluated for imagery — low priority, directory-style site | Not used |

## Recommendation for real project use

1. **Ask for permission directly.** Sirat.az and Cenub.az each have exactly
   the kind of photography the spec calls for (mosque, 1928 school
   graduating class, 1980s teachers, WWII memorial). A short outreach
   email/message asking to reuse specific named photos with credit would
   likely resolve this quickly and is the fastest path to real imagery.
2. **The official Masallı İH page** is a good candidate for a similar
   permission request, or as a pointer to whoever manages it locally.
3. **Use the site's own contribution feature for the rest.** This is
   exactly the gap `CommunitySubmission` ("Musaküçənin yaddaşına sən də
   əlavə et") is designed to close — villagers submitting their own
   photos with explicit publish permission sidesteps the third-party
   copyright problem entirely, and is the most sustainable long-term
   source for this project.
4. **The YouTube drone footage** is a strong candidate for the *Video
   archive* feature once built (Phase 8) via an official YouTube embed
   (spec §16 already anticipates YouTube/Vimeo embeds) — embedding
   doesn't require downloading or redistributing the file, only asking
   the uploader for confirmation it's their own footage before featuring
   it.
