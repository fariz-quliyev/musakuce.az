"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { historyApi } from "@/lib/api/history";
import type { HistoricalEventDto, PublicationStatus } from "@/lib/api/types";

/**
 * History keeps its own action bar instead of delegating wholesale to
 * PublicationStatusActions (shared by Events/LocalInfo/Photos/Videos too)
 * — only History's Published-row "Dərci geri götür" button is replaced
 * with a hard-delete "Sil", so editing the shared component in place
 * would have leaked that change into the other four resource types.
 * Publish and Archive otherwise behave exactly as PublicationStatusActions
 * already does.
 */
export function HistoryRowActions({ event }: { event: HistoricalEventDto }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(next: PublicationStatus) {
    setLoading(true);
    setError(null);
    try {
      await historyApi.updateStatus(event.id, { publicationStatus: next });
      router.refresh();
    } catch {
      setError("Uğursuz oldu");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Bu timeline qeydini silmək istədiyinizə əminsiniz?\n\n"${event.title}"`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await historyApi.remove(event.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 403 ? "Bu əməliyyat üçün icazəniz yoxdur." : "Silmək mümkün olmadı.");
      setLoading(false);
    }
  }

  const publishHint = "Bu əməliyyat yalnız məzmunun statusunu dəyişir. Formadakı dəyişiklikləri, o cümlədən yeni şəkli, əvvəlcə «Yadda saxla» ilə saxlayın.";
  const archiveHint = "Bu əməliyyat yalnız məzmunun statusunu dəyişir. Formadakı saxlanılmamış dəyişikliklər yadda saxlanılmır.";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="group relative inline-block">
        {event.publicationStatus !== "Published" ? (
          <Button type="button" size="sm" loading={loading} onClick={() => changeStatus("Published")}>
            Dərc et
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-danger text-danger hover:bg-danger-bg"
            loading={loading}
            onClick={handleDelete}
          >
            Sil
          </Button>
        )}
        <StatusActionTooltip text={event.publicationStatus === "Published" ? "Bu əməliyyat timeline qeydini həmişəlik silir. Təsdiq tələb olunur." : publishHint} />
      </span>
      <span className="group relative inline-block">
        {event.publicationStatus !== "Archived" ? (
          <Button type="button" size="sm" variant="ghost" loading={loading} onClick={() => changeStatus("Archived")}>
            Arxivləşdir
          </Button>
        ) : (
          <Button type="button" size="sm" variant="ghost" loading={loading} onClick={() => changeStatus("Draft")}>
            Arxivdən çıxar
          </Button>
        )}
        <StatusActionTooltip text={archiveHint} />
      </span>
      {error ? <span className="text-xs font-medium text-danger">{error}</span> : null}
    </div>
  );
}

/** Same hover/focus-revealed hint pattern as PublicationStatusActions'
 * own (unexported) StatusActionTooltip — duplicated rather than shared
 * since it's a few lines of markup, not worth exporting across files for. */
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
