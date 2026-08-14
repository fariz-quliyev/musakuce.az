"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { usersApi } from "@/lib/api/users";
import type { AdminRole, AdminUserDto } from "@/lib/api/types";

const ROLE_OPTIONS: AdminRole[] = ["Administrator", "Editor", "Archivist", "Moderator"];

export function UserRow({ user, currentUserId }: { user: AdminUserDto; currentUserId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isSelf = currentUserId === user.id;

  async function handleRoleChange(role: AdminRole) {
    setLoading(true);
    setError(null);
    try {
      await usersApi.assignRole(user.id, { role });
      router.refresh();
    } catch {
      setError("Rol dəyişdirilə bilmədi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive() {
    setLoading(true);
    setError(null);
    try {
      await usersApi.setActive(user.id, { isActive: user.isLockedOut });
      router.refresh();
    } catch {
      setError("Əməliyyat uğursuz oldu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (newPassword.length < 10) {
      setError("Şifrə ən azı 10 simvol olmalıdır.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await usersApi.resetPassword(user.id, { newPassword });
      setResetting(false);
      setNewPassword("");
    } catch {
      setError("Şifrə yenilənə bilmədi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr className="border-b border-stone-light last:border-0 hover:bg-paper-soft align-top">
      <td className="px-4 py-3">
        <p className="font-medium text-ink">{user.displayName}</p>
        <p className="text-xs text-ink-faint">{user.email}</p>
      </td>
      <td className="px-4 py-3">
        <Select
          value={user.roles[0] ?? "Moderator"}
          onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
          disabled={loading || isSelf}
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Select>
      </td>
      <td className="px-4 py-3">
        <Badge tone={user.isLockedOut ? "danger" : "success"}>{user.isLockedOut ? "Deaktiv" : "Aktiv"}</Badge>
      </td>
      <td className="px-4 py-3 text-ink-faint">{new Date(user.createdAt).toLocaleDateString("az-AZ")}</td>
      <td className="px-4 py-3">
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              loading={loading}
              disabled={isSelf}
              onClick={handleToggleActive}
            >
              {user.isLockedOut ? "Aktivləşdir" : "Deaktiv et"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setResetting((v) => !v)}>
              Şifrəni sıfırla
            </Button>
          </div>
          {resetting ? (
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Yeni şifrə"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button type="button" size="sm" loading={loading} onClick={handleResetPassword}>
                Təsdiqlə
              </Button>
            </div>
          ) : null}
          {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
          {isSelf ? <p className="text-xs text-ink-faint">(sizin hesabınız)</p> : null}
        </div>
      </td>
    </tr>
  );
}
