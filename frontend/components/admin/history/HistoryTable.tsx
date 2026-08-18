"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicationStatusBadge } from "@/components/admin/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { HistoryRowActions } from "./HistoryRowActions";
import { historyApi } from "@/lib/api/history";
import type { HistoricalEventDto, UpdateHistoricalEventRequest } from "@/lib/api/types";

function toUpdatePayload(event: HistoricalEventDto): UpdateHistoricalEventRequest {
  return {
    title: event.title,
    period: event.period,
    eventDate: event.eventDate,
    description: event.description,
    detailedText: event.detailedText,
    sourceStatus: event.sourceStatus,
    sourceReference: event.sourceReference,
    displayOrder: event.displayOrder,
    coverMediaAssetId: event.coverMediaAssetId,
    showInTimeline: event.showInTimeline,
    additionalImageMediaAssetIds: event.additionalImages.map((img) => img.mediaAssetId),
  };
}

/**
 * Owns the /admin/tarix list table, including ↑/↓ reordering — no
 * drag-and-drop library exists anywhere in this admin panel yet, so
 * reordering swaps DisplayOrder between the two adjacent rows (both
 * persisted via the existing full-field PUT, same as HistoryForm) rather
 * than introducing a new dependency for it.
 */
export function HistoryTable({ events }: { events: HistoricalEventDto[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function move(index: number, direction: -1 | 1) {
    const current = events[index];
    const other = events[index + direction];
    if (!current || !other) return;

    setPendingId(current.id);
    try {
      await Promise.all([
        historyApi.update(current.id, { ...toUpdatePayload(current), displayOrder: other.displayOrder }),
        historyApi.update(other.id, { ...toUpdatePayload(other), displayOrder: current.displayOrder }),
      ]);
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-stone-light bg-paper">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-light bg-paper-soft text-left text-xs uppercase tracking-wide text-ink-faint">
            <th className="px-4 py-3">Sıra</th>
            <th className="px-4 py-3">Başlıq</th>
            <th className="px-4 py-3">Dövr</th>
            <th className="px-4 py-3">Mənbə</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={event.id} className="border-b border-stone-light last:border-0 hover:bg-paper-soft">
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || pendingId !== null}
                    aria-label="Yuxarı köçür"
                    className="grid h-6 w-6 place-items-center rounded text-ink-soft hover:bg-stone-light disabled:pointer-events-none disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === events.length - 1 || pendingId !== null}
                    aria-label="Aşağı köçür"
                    className="grid h-6 w-6 place-items-center rounded text-ink-soft hover:bg-stone-light disabled:pointer-events-none disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-ink">
                <div className="flex items-center gap-2">
                  {event.title}
                  {event.isDefault ? <Badge tone="gold">Nümunə</Badge> : null}
                  {!event.showInTimeline ? <Badge tone="neutral">Timeline-da gizli</Badge> : null}
                </div>
              </td>
              <td className="px-4 py-3 text-ink-soft">{event.period}</td>
              <td className="px-4 py-3 text-ink-faint">{event.sourceReference ?? "—"}</td>
              <td className="px-4 py-3">
                <PublicationStatusBadge status={event.publicationStatus} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/tarix/${event.id}/redakte?s=${event.publicationStatus}`}
                    className="font-medium text-forest hover:underline"
                  >
                    Redaktə
                  </Link>
                  <HistoryRowActions event={event} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
