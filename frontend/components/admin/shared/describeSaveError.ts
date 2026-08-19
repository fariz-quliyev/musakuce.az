import { ApiError } from "@/lib/api/client";

/** Surfaces the backend's actual reason instead of a fixed string — a
 * FluentValidation 400 carries per-field messages in `detail.errors`, the
 * global exception handler's ProblemDetails carries one in `detail.detail`
 * (403/404/409 are all client-safe per GlobalExceptionHandler.cs), and a
 * generic 500 has neither, so it falls back to a still-informative
 * default rather than a silent, unexplained failure. Shared by every
 * admin content form's status-update call (see PublicationStatusPicker). */
export function describeSaveError(err: unknown): string {
  if (err instanceof ApiError) {
    const detail = err.detail as { detail?: string; errors?: Record<string, string[]> } | undefined;
    if (detail?.errors) {
      const messages = Object.values(detail.errors).flat();
      if (messages.length > 0) return messages.join(" ");
    }
    if (detail?.detail) return detail.detail;
    if (err.status === 403) return "Bu əməliyyat üçün icazəniz yoxdur.";
  }
  return "Yadda saxlamaq mümkün olmadı. Bir az sonra yenidən cəhd edin.";
}
