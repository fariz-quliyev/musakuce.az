"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { PublicationStatus } from "@/lib/api/types";

/** Shared publish/unpublish/archive action bar — every simple CMS
 * resource (Events, LocalInfo, People, History, Photos, Videos) uses the
 * same three-state PublicationStatus model, so this one component
 * drives all of them. "Delete" is modeled as Archived, not a hard
 * delete, per the existing status model. */
export function PublicationStatusActions({
  status,
  onChangeStatus,
  size = "sm",
}: {
  status: PublicationStatus;
  onChangeStatus: (status: PublicationStatus) => Promise<unknown>;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function run(next: PublicationStatus) {
    setLoading(true);
    setError(false);
    try {
      await onChangeStatus(next);
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const publishHint = "Bu əməliyyat yalnız məzmunun statusunu dəyişir. Formadakı dəyişiklikləri, o cümlədən yeni şəkli, əvvəlcə «Yadda saxla» ilə saxlayın.";
  const archiveHint = "Bu əməliyyat yalnız məzmunun statusunu dəyişir. Formadakı saxlanılmamış dəyişikliklər yadda saxlanılmır.";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="group relative inline-block">
        {status !== "Published" ? (
          <Button type="button" size={size} loading={loading} onClick={() => run("Published")}>
            Dərc et
          </Button>
        ) : (
          <Button type="button" size={size} variant="outline" loading={loading} onClick={() => run("Draft")}>
            Dərci geri götür
          </Button>
        )}
        <StatusActionTooltip text={publishHint} />
      </span>
      <span className="group relative inline-block">
        {status !== "Archived" ? (
          <Button type="button" size={size} variant="ghost" loading={loading} onClick={() => run("Archived")}>
            Arxivləşdir
          </Button>
        ) : (
          <Button type="button" size={size} variant="ghost" loading={loading} onClick={() => run("Draft")}>
            Arxivdən çıxar
          </Button>
        )}
        <StatusActionTooltip text={archiveHint} />
      </span>
      {error ? <span className="text-xs font-medium text-danger">Uğursuz oldu</span> : null}
    </div>
  );
}

/** Hover- and keyboard-focus-revealed hint (`group-hover`/`group-focus-within`
 * on the wrapping span) — no JS state, no new dependency. Mobile has no
 * hover, so it simply never appears there; the button itself needs no
 * extra behavior for that. Not a reusable Tooltip component — inlined
 * here since these two status buttons are the only place that needs it. */
function StatusActionTooltip({ text }: { text: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-md bg-ink px-2.5 py-1.5 text-xs leading-snug text-paper opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
    >
      {text}
    </span>
  );
}
