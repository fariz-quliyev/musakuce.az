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

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {status !== "Published" ? (
        <Button type="button" size={size} loading={loading} onClick={() => run("Published")}>
          Dərc et
        </Button>
      ) : (
        <Button type="button" size={size} variant="outline" loading={loading} onClick={() => run("Draft")}>
          Dərci geri götür
        </Button>
      )}
      {status !== "Archived" ? (
        <Button type="button" size={size} variant="ghost" loading={loading} onClick={() => run("Archived")}>
          Arxivləşdir
        </Button>
      ) : (
        <Button type="button" size={size} variant="ghost" loading={loading} onClick={() => run("Draft")}>
          Arxivdən çıxar
        </Button>
      )}
      {error ? <span className="text-xs font-medium text-danger">Uğursuz oldu</span> : null}
    </div>
  );
}
