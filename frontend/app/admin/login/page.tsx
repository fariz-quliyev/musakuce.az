"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import type { LoginResponse } from "@/lib/api/types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
        }),
      });

      if (!response.ok) {
        setStatus("error");
        setErrorMessage("E-poçt və ya şifrə yanlışdır.");
        return;
      }

      const data = (await response.json()) as LoginResponse;
      const isProduction = process.env.NODE_ENV === "production";
      document.cookie = `${AUTH_COOKIE_NAME}=${data.token}; path=/; expires=${new Date(data.expiresAt).toUTCString()}; samesite=lax${isProduction ? "; secure" : ""}`;

      router.push(next && next.startsWith("/admin") ? next : "/admin/dashboard");
      router.refresh();
    } catch {
      setStatus("error");
      setErrorMessage("Serverlə əlaqə mümkün olmadı. Bir az sonra yenidən cəhd edin.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-soft px-5">
      <div className="w-full max-w-sm rounded-lg border border-stone-light bg-paper p-8">
        <p className="text-sm font-bold tracking-wide text-ink">MUSAKÜÇƏ · ADMIN</p>
        <h1 className="mt-2 text-xl font-bold text-ink">Daxil ol</h1>
        <p className="mt-1 text-sm text-ink-soft">Admin panelinə giriş üçün hesab məlumatlarınızı daxil edin.</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <FormField label="E-poçt" htmlFor="email" required>
            <Input id="email" name="email" type="email" required autoComplete="username" />
          </FormField>
          <FormField label="Şifrə" htmlFor="password" required>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </FormField>

          {status === "error" ? <p className="text-sm font-medium text-danger">{errorMessage}</p> : null}

          <Button type="submit" loading={status === "submitting"} className="mt-2 w-full">
            Daxil ol
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
