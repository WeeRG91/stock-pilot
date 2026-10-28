"use server";

import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { getApiSessionHeaders } from "@/lib/getApiSessionHeaders.server";
import type { LogoutState } from "@/types/logout";

export async function logout(previousState: LogoutState): Promise<LogoutState> {
  void previousState;

  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    return { error: "Sign out is unavailable. Please try again later." };
  }

  try {
    const headers = await getApiSessionHeaders();

    const bootstrap = await fetch(new URL("/api/auth/csrf/logout", apiUrl), {
      cache: "no-store",
      redirect: "error",
      headers,
      signal: AbortSignal.timeout(10_000),
    });

    if (!bootstrap.ok) {
      throw new Error("Unable to prepare logout.");
    }

    const payload: unknown = await bootstrap.json();

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("data" in payload) ||
      typeof payload.data !== "object" ||
      payload.data === null ||
      !("intent" in payload.data) ||
      payload.data.intent !== "logout" ||
      !("token" in payload.data) ||
      typeof payload.data.token !== "string" ||
      payload.data.token === ""
    ) {
      throw new Error("Invalid logout bootstrap.");
    }

    const response = await fetch(new URL("/api/auth/logout", apiUrl), {
      method: "POST",
      cache: "no-store",
      redirect: "error",
      headers: {
        ...headers,
        "X-CSRF-Token": payload.data.token,
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status !== 200 && response.status !== 401) {
      throw new Error("Logout was not confirmed.");
    }
  } catch (error) {
    unstable_rethrow(error);

    return {
      error: "Sign out could not be confirmed. Please try again.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.delete("STOCKPILOT_SESSION");

  redirect("/login");
}
