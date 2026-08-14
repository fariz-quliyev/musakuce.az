import { Button } from "./Button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

/** Simple prev/next + page indicator — used by any client-side browser
 * (listings, events) that paginates through a PagedResult. */
export function Pagination({ page, totalPages, onPageChange, disabled }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Əvvəlki
      </Button>
      <span className="text-sm text-ink-soft">
        {page} / {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Növbəti →
      </Button>
    </div>
  );
}
