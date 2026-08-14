import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { UserRow } from "@/components/admin/users/UserRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { usersApi } from "@/lib/api/users";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";

export const metadata = { title: "İstifadəçilər — Admin — Musaküçə" };

export default async function AdminUsersPage() {
  let users;
  let currentUserId: string | undefined;
  try {
    [users, currentUserId] = await Promise.all([
      usersApi.getAll(),
      authApi.me().then((u) => u.id).catch((error) => {
        if (isNextRedirectError(error)) throw error;
        return undefined;
      }),
    ]);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 403) {
      return (
        <EmptyState
          tone="error"
          title="İcazəniz yoxdur"
          description="İstifadəçiləri idarə etmək yalnız Administrator roluna açıqdır."
        />
      );
    }
    return <EmptyState tone="error" title="İstifadəçiləri yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="İstifadəçilər"
        description="Admin panelinə giriş imkanı olan hesablar. Açıq qeydiyyat yoxdur — hesablar yalnız burada yaradılır."
        actions={<Button href="/admin/users/yeni">+ Yeni istifadəçi</Button>}
      />

      {users.length === 0 ? (
        <EmptyState title="Heç bir istifadəçi tapılmadı" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-light bg-paper">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-light bg-paper-soft text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-3">İstifadəçi</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Yaradılıb</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow key={user.id} user={user} currentUserId={currentUserId} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
