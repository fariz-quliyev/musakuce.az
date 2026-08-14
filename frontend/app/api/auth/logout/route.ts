import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

/** Clears the local session cookie. The backend audit "Logout" event is
 * recorded by the client calling authApi.logout() first (while the
 * cookie/token is still present) — see components/admin/LogoutButton.tsx. */
export async function POST() {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
