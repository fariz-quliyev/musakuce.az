"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { searchApi } from "@/lib/api/search";
import type { SearchResponse, SearchResultItem } from "@/lib/api/types";

const GROUPS: { key: keyof SearchResponse; label: string; href: string; itemHref?: (id: string) => string }[] = [
  { key: "people", label: "İnsanlar", href: "/insanlarimiz" },
  { key: "history", label: "Tarix", href: "/tariximiz" },
  { key: "photos", label: "Fotolar", href: "/fotoalbom" },
  { key: "videos", label: "Videolar", href: "/videolar" },
  { key: "places", label: "Yerlər", href: "/xerite" },
  { key: "events", label: "Tədbirlər", href: "/teqvim" },
  { key: "localInfo", label: "Faydalı məlumatlar", href: "/faydali-melumatlar" },
  { key: "education", label: "Təhsil", href: "/tehsil", itemHref: (id) => `/tehsil/${id}` },
  { key: "memorial", label: "Xatirə", href: "/xatire", itemHref: (id) => `/xatire/${id}` },
  { key: "culturalHeritage", label: "Mədəni irs", href: "/medeniyyet", itemHref: (id) => `/medeniyyet/${id}` },
  { key: "interviews", label: "Kəndimizin səsi", href: "/kendimizin-sesi", itemHref: (id) => `/kendimizin-sesi/${id}` },
];

function ResultGroup({
  label,
  href,
  itemHref,
  items,
}: {
  label: string;
  href: string;
  itemHref?: (id: string) => string;
  items: SearchResultItem[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-soft">
          {label} <span className="text-ink-faint">({items.length})</span>
        </h3>
        <Link href={href} className="text-sm font-medium text-forest hover:underline">
          Arxivə bax →
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={itemHref ? itemHref(item.id) : href}
              className="block rounded-lg border border-stone-light bg-paper p-4 transition-shadow hover:shadow-md"
            >
              <p className="font-medium text-ink">{item.title}</p>
              {item.snippet ? <p className="mt-1 text-sm text-ink-soft">{item.snippet}</p> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Unified site search (Phase 12 §13) — covers every content type the
 * backend indexes: archive content (people, history, photos, videos,
 * places) and village content (events, local info, memorial, cultural
 * heritage, interviews). Listings are intentionally still excluded —
 * they have their own in-section filters and are time-sensitive/
 * moderated in a way that doesn't fit a general archive search. */
export function SearchPageClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function runSearch(q: string) {
    if (!q.trim()) return;
    setStatus("loading");
    try {
      const response = await searchApi.search(q.trim());
      setResults(response);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch(query);
  }

  const totalResults = results ? GROUPS.reduce((sum, group) => sum + results[group.key].length, 0) : 0;

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Vahid məlumat mərkəzi"
        title="Axtarış"
        description="İnsanlar, tarix, foto/video arxivi, yerlər və kənd məzmunu üzrə axtarış edin."
        className="mb-8"
      />

      <form onSubmit={handleSubmit} className="mb-10 flex max-w-xl gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ad, hadisə və ya foto axtarın…"
          aria-label="Axtarış"
        />
        <Button type="submit" variant="primary" loading={status === "loading"}>
          Axtar
        </Button>
      </form>

      {status === "idle" ? (
        <EmptyState
          title="Axtarışa başlayın"
          description="Yuxarıdakı sahəyə ad, hadisə və ya foto başlığı yazın."
        />
      ) : null}

      {status === "loading" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : null}

      {status === "error" ? (
        <EmptyState
          tone="error"
          title="Axtarış mümkün olmadı"
          description="Backend ilə əlaqə yaratmaq mümkün olmadı. Bir az sonra yenidən cəhd edin."
          action={
            <Button size="sm" onClick={() => runSearch(query)}>
              Yenidən cəhd et
            </Button>
          }
        />
      ) : null}

      {status === "done" && totalResults === 0 ? (
        <EmptyState title="Nəticə tapılmadı" description="Başqa açar sözlə yenidən cəhd edin." />
      ) : null}

      {status === "done" && totalResults > 0 ? (
        <>
          <p className="mb-6 text-sm text-ink-faint">{totalResults} nəticə tapıldı</p>
          {GROUPS.map((group) => (
            <ResultGroup key={group.key} label={group.label} href={group.href} itemHref={group.itemHref} items={results![group.key]} />
          ))}
        </>
      ) : null}
    </Container>
  );
}
