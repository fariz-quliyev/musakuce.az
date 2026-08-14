"use client";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Safety-net error boundary for anything under /admin that isn't
 * explicitly handled by a page's own try/catch (see the detail/edit
 * pages, which distinguish 403 specifically). Next.js redacts thrown
 * error details crossing this boundary, so this stays generic rather
 * than trying to branch on a status code that may not survive.
 */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        tone="error"
        title="Bu səhifəni yükləmək mümkün olmadı"
        description="Bu əməliyyat üçün icazəniz olmaya bilər, ya da gözlənilməz bir xəta baş verdi."
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={reset}>
              Yenidən cəhd et
            </Button>
            <Button size="sm" href="/admin/dashboard">
              Dashboard-a qayıt
            </Button>
          </div>
        }
      />
    </div>
  );
}
