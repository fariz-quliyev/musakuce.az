"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Best-effort audit log — still clear the local session below.
    }
    await fetch("/api/auth/logout", { method: "POST" });
    const isProduction = process.env.NODE_ENV === "production";
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax${isProduction ? "; secure" : ""}`;
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-md px-3 py-2 text-left text-xs font-medium text-ink-faint transition-colors hover:text-danger disabled:opacity-50"
    >
      {loading ? "Çıxış edilir…" : "Çıxış"}
    </button>
  );
}
