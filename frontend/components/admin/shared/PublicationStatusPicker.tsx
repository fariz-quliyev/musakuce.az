"use client";

import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import type { PublicationStatus } from "@/lib/api/types";

export type PublicationChoice = Extract<PublicationStatus, "Draft" | "Published">;

/** Shared "Nəşr statusu" control (Select + status Badge) for the sticky
 * save bar every admin content form uses — extracted from PersonForm,
 * the reference implementation, so every other form applies the exact
 * same status-management model instead of the separate "Dərc et"/
 * "Arxivləşdir" buttons PublicationStatusActions renders in a page
 * header. Every save applies whichever option is currently selected —
 * "Yadda saxla" never silently decides the status on its own. */
export function PublicationStatusPicker({
  value,
  onChange,
}: {
  value: PublicationChoice;
  onChange: (value: PublicationChoice) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select
        aria-label="Nəşr statusu"
        value={value}
        onChange={(event) => onChange(event.target.value as PublicationChoice)}
        className="w-auto py-2"
      >
        <option value="Draft">Qaralama</option>
        <option value="Published">Yayımla</option>
      </Select>
      {value === "Published" ? (
        <Badge tone="success" dot>
          Saytda dərhal görünəcək
        </Badge>
      ) : (
        <Badge tone="neutral" dot>
          Saytda görünməyəcək
        </Badge>
      )}
    </div>
  );
}
