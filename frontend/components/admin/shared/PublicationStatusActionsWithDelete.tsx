"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import type { PublicationStatus } from "@/lib/api/types";

/**
 * Shared publish/archive/delete action bar for admin list rows — the
 * "Sil" variant of PublicationStatusActions.tsx (which still renders
 * "Dərci geri götür" for the resources that haven't switched to hard
 * delete). Extracted after HistoryRowActions.tsx implemented this exact
 * pattern first (Published-row unpublish button replaced with a
 * confirmed hard delete, Archive left untouched) — reused here instead
 * of copy-pasting the same bar into every one of the 9 other content
 * types that needed the same change.
 */
export function PublicationStatusActionsWithDelete({
  status,
  title,
  deleteConfirmLabel = "Bu qeydi",
  onChangeStatus,
  onDelete,
  size = "sm",
}: {
  status: PublicationStatus;
  /** Shown in the delete confirmation dialog so the admin can verify
   * which record they're about to remove. */
  title: string;
  /** Leading phrase of the confirmation question, e.g. "Bu foto qeydini" —
   * defaults to the generic "Bu qeydi". */
  deleteConfirmLabel?: string;
  onChangeStatus: (status: PublicationStatus) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(next: PublicationStatus) {
    setLoading(true);
    setError(null);
    try {
      await onChangeStatus(next);
      router.refresh();
    } catch {
      setError("Uğursuz oldu");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`${deleteConfirmLabel} silmək istədiyinizə əminsiniz?\n\n"${title}"`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onDelete();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 403 ? "Bu əməliyyat üçün icazəniz yoxdur." : "Silmək mümkün olmadı.");
      setLoading(false);
    }
  }

  const publishHint = "Bu əməliyyat yalnız məzmunun statusunu dəyişir. Formadakı dəyişiklikləri, o cümlədən yeni şəkli, əvvəlcə «Yadda saxla» ilə saxlayın.";
  const archiveHint = "Bu əməliyyat yalnız məzmunun statusunu dəyişir. Formadakı saxlanılmamış dəyişikliklər yadda saxlanılmır.";
  const deleteHint = "Bu əməliyyat qeydi həmişəlik silir. Təsdiq tələb olunur.";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="group relative inline-block">
        {status !== "Published" ? (
          <Button type="button" size={size} loading={loading} onClick={() => changeStatus("Published")}>
            Dərc et
          </Button>
        ) : (
          <Button
            type="button"
            size={size}
            variant="outline"
            className="border-danger text-danger hover:bg-danger-bg"
            loading={loading}
            onClick={handleDelete}
          >
            Sil
          </Button>
        )}
        <StatusActionTooltip text={status === "Published" ? deleteHint : publishHint} />
      </span>
      <span className="group relative inline-block">
        {status !== "Archived" ? (
          <Button type="button" size={size} variant="ghost" loading={loading} onClick={() => changeStatus("Archived")}>
            Arxivləşdir
          </Button>
        ) : (
          <Button type="button" size={size} variant="ghost" loading={loading} onClick={() => changeStatus("Draft")}>
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
