import { AuthUser } from "@/types/auth";
import { SYMFONY_SESSION_COOKIE } from "./readSymfonySessionId";
import { parseAuthResponse } from "./parseAuthResponse";
import { cookies } from "next/headers";

export async function getCurrentUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies();
  const sessionId = cookieStore.get("STOCKPILOT_SESSION")?.value;

  if (!sessionId || !/^[A-Za-z0-9,-]{1,256}$/.test(sessionId)) {
    return null;
  }

  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    throw new Error("STOCKPILOT_API_URL is not configured.");
  }

  const response = await fetch(new URL("/api/auth/me", apiUrl), {
    cache: "no-store",
    redirect: "error",
    headers: {
      Accept: "application/json",
      Cookie: `${SYMFONY_SESSION_COOKIE}=${sessionId}`,
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to fetch the current account.");
  }

  const payload: unknown = await response.json();

  return parseAuthResponse(payload).data.user;
}