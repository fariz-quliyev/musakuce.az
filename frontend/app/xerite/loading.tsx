import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <Skeleton className="mb-3 h-9 w-64" />
        <Skeleton className="mb-8 h-5 w-full max-w-md" />
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-[420px] w-full rounded-xl sm:h-[560px] lg:h-[650px]" />
      </Container>
    </PageShell>
  );
}
