"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { submissionsApi } from "@/lib/api/submissions";
import type { SubmissionDto } from "@/lib/api/types";

export function SubmissionModerationActions({ submission }: { submission: SubmissionDto }) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState(submission.reviewerNote ?? "");
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

      {submission.reviewerNote ? (
        <p className="rounded-md bg-paper-soft px-3 py-2 text-xs text-ink-soft">Qeyd: {submission.reviewerNote}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {submission.status !== "Approved" ? (
          <Button
            type="button"
            size="sm"
            loading={loading}
            onClick={() => run(() => submissionsApi.updateStatus(submission.id, { status: "Approved" }))}
          >
            Təsdiqlə
          </Button>
        ) : null}
        {submission.status !== "Rejected" ? (
          <Button type="button" size="sm" variant="outline" onClick={() => setRejecting((v) => !v)}>
            Rədd et
          </Button>
        ) : null}
        {submission.status !== "Archived" ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            loading={loading}
            onClick={() => run(() => submissionsApi.updateStatus(submission.id, { status: "Archived" }))}
          >
            Arxivləşdir
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
                run(() => submissionsApi.updateStatus(submission.id, { status: "Rejected", reviewerNote: note }))
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
