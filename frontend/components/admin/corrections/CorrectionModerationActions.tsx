"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { correctionsApi } from "@/lib/api/corrections";
import type { CorrectionSuggestionDto } from "@/lib/api/types";

/**
 * Approve/reject only — CorrectionSuggestion has no Archived/Converted
 * state (unlike CommunitySubmission), since a suggestion always resolves
 * to one of those two. Approving does NOT itself change the target
 * entity — the reviewer applies the change manually via that content
 * type's own admin edit form (mirrors CommunitySubmission's manual
 * Pending→Converted step), so the hint below says so explicitly.
 */
export function CorrectionModerationActions({ suggestion }: { suggestion: CorrectionSuggestionDto }) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState(suggestion.reviewerNote ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function run(action: () => Promise<unknown>) {
    setLoading(true);
    setError(false);
    try {
      await action();
      router.refresh();
      setRejecting(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-stone-light bg-paper p-4">
      <h2 className="text-sm font-semibold text-ink">Moderasiya əməliyyatları</h2>

      {suggestion.status === "Pending" ? (
        <p className="rounded-md bg-info-bg px-3 py-2 text-xs text-info">
          Təsdiqləmə yalnız təklifin statusunu dəyişir — əsas məlumatı özünüz {suggestion.targetTitle} üçün müvafiq
          redaktə formasından yeniləməlisiniz.
        </p>
      ) : null}

      {suggestion.reviewerNote ? (
        <p className="rounded-md bg-paper-soft px-3 py-2 text-xs text-ink-soft">Qeyd: {suggestion.reviewerNote}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {suggestion.status !== "Approved" ? (
          <Button
            type="button"
            size="sm"
            loading={loading}
            onClick={() => run(() => correctionsApi.updateStatus(suggestion.id, { status: "Approved" }))}
          >
            Təsdiqlə
          </Button>
        ) : null}
        {suggestion.status !== "Rejected" ? (
          <Button type="button" size="sm" variant="outline" onClick={() => setRejecting((v) => !v)}>
            Rədd et
          </Button>
        ) : null}
      </div>

      {rejecting ? (
        <div className="flex flex-col gap-2 border-t border-stone-light pt-3">
          <Textarea
            id="reviewer-note"
            placeholder="Qeyd (istəyə bağlı)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              loading={loading}
              onClick={() =>
                run(() => correctionsApi.updateStatus(suggestion.id, { status: "Rejected", reviewerNote: note }))
              }
            >
              Rəddi təsdiqlə
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setRejecting(false)}>
              Ləğv et
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-xs font-medium text-danger">Əməliyyat uğursuz oldu.</p> : null}
    </div>
  );
}
