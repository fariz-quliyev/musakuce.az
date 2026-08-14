import Link from "next/link";
import { Container } from "@/components/ui/Container";

/**
 * "Xatirə" — deliberately the quietest, smallest section on the page
 * (spec §5/§13: never a prominent card grid on the homepage). A single
 * calm line and a soft link, nothing more.
 */
export function MemorialMinimal() {
  return (
    <div className="border-y border-memorial-line bg-memorial-bg">
      <Container className="flex flex-col items-center gap-2 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-memorial-ink">
          Aramızdan ayrılan kənd sakinlərimizi hörmətlə xatırlayırıq.
        </p>
        <Link
          href="/xatire"
          className="text-sm font-semibold text-memorial-accent underline underline-offset-4"
        >
          Xatirə səhifəsinə keç →
        </Link>
      </Container>
    </div>
  );
}
