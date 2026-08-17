import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { eventCategoryLabels } from "@/lib/api/labels";
import type { EventDto } from "@/lib/api/types";

export function EventCard({ event }: { event: EventDto }) {
  const date = new Date(event.startsAt);

  return (
    <Link
      href={`/teqvim/${event.id}`}
      className="flex items-center gap-5 rounded-lg border border-stone-light bg-paper p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full bg-forest text-cream">
        <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
          {date.toLocaleDateString("az-AZ", { month: "short" })}
        </span>
        <span className="font-display text-xl leading-none">{date.getDate()}</span>
      </div>
      <div className="flex-1">
        <Badge tone="neutral" className="mb-1.5">
          {eventCategoryLabels[event.category]}
        </Badge>
        <h3 className="line-clamp-2 font-display text-lg text-ink">{event.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{event.description}</p>
        <p className="mt-1 text-xs text-ink-faint">
          {date.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })} · {event.location}
        </p>
      </div>
    </Link>
  );
}
