import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5295";

/**
 * Proxies to the backend's stateless JWT login, then stores the token in
 * a cookie on this (Next.js) origin — see lib/auth/constants.ts for why
 * it isn't httpOnly. Never logs or echoes the password.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Yanlış sorğu." }, { status: 400 });
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ message: "Backend ilə əlaqə mümkün olmadı." }, { status: 502 });
  }

  if (!backendResponse.ok) {
    const detail = await backendResponse.json().catch(() => null);
    return NextResponse.json(detail ?? { message: "Giriş uğursuz oldu." }, { status: backendResponse.status });
  }

  const data = (await backendResponse.json()) as { token: string; expiresAt: string; user: unknown };

  const response = NextResponse.json({ user: data.user });
  response.cookies.set(AUTH_COOKIE_NAME, data.token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(data.expiresAt),
  });
  return response;
}
