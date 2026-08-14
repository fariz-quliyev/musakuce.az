import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <Skeleton className="mb-8 h-9 w-64" />
        <div className="space-y-8 border-l border-stone-light pl-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-72" />
            </div>
          ))}
        </div>
      </Container>
    </PageShell>
  );
}
