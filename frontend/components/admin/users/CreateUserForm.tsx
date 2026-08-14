"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { usersApi } from "@/lib/api/users";
import type { AdminRole } from "@/lib/api/types";

const ROLE_OPTIONS: AdminRole[] = ["Administrator", "Editor", "Archivist", "Moderator"];

export function CreateUserForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      await usersApi.create({
        email: String(form.get("email") ?? ""),
        displayName: String(form.get("displayName") ?? ""),
        role: form.get("role") as AdminRole,
        temporaryPassword: String(form.get("temporaryPassword") ?? ""),
      });
      router.push("/admin/users");
      router.refresh();
    } catch {
      setStatus("error");
      setError("İstifadəçi yaradıla bilmədi. E-poçt artıq istifadə oluna bilər və ya şifrə tələblərə uyğun deyil.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-md gap-5">
      <FormField label="Ad, soyad" htmlFor="displayName" required>
        <Input id="displayName" name="displayName" required maxLength={150} />
      </FormField>

      <FormField label="E-poçt" htmlFor="email" required>
        <Input id="email" name="email" type="email" required />
      </FormField>

      <FormField label="Rol" htmlFor="role" required>
        <Select id="role" name="role" defaultValue="Moderator" required>
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Müvəqqəti şifrə"
        htmlFor="temporaryPassword"
        required
        hint="Ən azı 10 simvol, böyük hərf və rəqəm daxil olmalıdır"
      >
        <Input id="temporaryPassword" name="temporaryPassword" type="password" required minLength={10} />
      </FormField>

      {status === "error" ? <p className="text-sm font-medium text-danger">{error}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" loading={status === "submitting"}>
          Yarat
        </Button>
        <Button type="button" variant="outline" href="/admin/users">
          Ləğv et
        </Button>
      </div>
    </form>
  );
}
