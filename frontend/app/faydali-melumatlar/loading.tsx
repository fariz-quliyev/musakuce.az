import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <Skeleton className="mb-8 h-9 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      </Container>
    </PageShell>
  );
}
