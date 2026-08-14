import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <Skeleton className="mb-4 h-9 w-64" />
        <Skeleton className="mb-12 h-4 w-full max-w-2xl" />
        <div className="mb-12 grid grid-cols-2 gap-6 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </Container>
    </PageShell>
  );
}
