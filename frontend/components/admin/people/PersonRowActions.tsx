"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { peopleApi } from "@/lib/api/people";
import { ApiError } from "@/lib/api/client";
import type { PersonDto } from "@/lib/api/types";

/** People admin list no longer offers Redaktə/Dərc et/Arxivləşdir — only
 * a hard delete, confirmed first (native confirm(), no dialog primitive
 * exists yet in this design system and one isn't worth adding for a
 * single confirmation prompt). Backend does the real deletion and its
 * own safe cover-image cleanup (PersonService.DeleteAsync); this just
 * calls it and refreshes the list. */
export function PersonRowActions({ person }: { person: PersonDto }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const name = `${person.firstName} ${person.lastName}`;
    if (!window.confirm(`"${name}" adlı şəxsi silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await peopleApi.remove(person.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 403 ? "Bu əməliyyat üçün icazəniz yoxdur." : "Silmək mümkün olmadı.");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error ? <span className="text-xs font-medium text-danger">{error}</span> : null}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="border-danger text-danger hover:bg-danger-bg"
        loading={loading}
        onClick={handleDelete}
      >
        Sil
      </Button>
    </div>
  );
}
