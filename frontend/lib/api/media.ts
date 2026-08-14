import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { ApiError } from "./client";
import type { MediaAssetDto } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5295";

function getBrowserToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** XMLHttpRequest (not fetch) specifically because it's the only browser
 * API that exposes upload progress events — needed for the admin/
 * community upload widgets' progress bars. Client-side only. */
function uploadFile(
  path: string,
  file: File,
  options: { onProgress?: (percent: number) => void; authenticated: boolean },
): Promise<MediaAssetDto> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}${path}`);

    if (options.authenticated) {
      const token = getBrowserToken();
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        options.onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as MediaAssetDto);
        } catch {
          reject(new ApiError("Serverdən yanlış cavab alındı.", xhr.status));
        }
        return;
      }

      let detail: unknown;
      try {
        detail = JSON.parse(xhr.responseText);
      } catch {
        // Non-JSON error body — fall through to the generic message below.
      }
      const message =
        (detail as { detail?: string } | undefined)?.detail ?? "Fayl yüklənə bilmədi.";
      reject(new ApiError(message, xhr.status, detail));
    };

    xhr.onerror = () => reject(new ApiError("Yükləmə zamanı şəbəkə xətası baş verdi.", 0));

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}

export const mediaApi = {
  /** ADMIN-PRIVILEGED — requires Permissions.MediaUpload. */
  uploadAdmin: (file: File, onProgress?: (percent: number) => void) =>
    uploadFile("/api/media/upload", file, { onProgress, authenticated: true }),

  /** Public, anonymous, rate-limited — used only from the community
   * submission form (/paylas). */
  uploadCommunity: (file: File, onProgress?: (percent: number) => void) =>
    uploadFile("/api/media/community-upload", file, { onProgress, authenticated: false }),
};
