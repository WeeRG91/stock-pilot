"use server";

import { parseAuthResponse } from "@/lib/parseAuthResponse";
import { readLoginFormData } from "@/lib/readLoginFormData";
import {
  readSymfonySessionId,
  SYMFONY_SESSION_COOKIE,
} from "@/lib/readSymfonySessionId";
import type { LoginFormState } from "@/types/loginForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(
  previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  void previousState;

  const input = readLoginFormData(formData);

  if (!input.valid) {
    return input.state;
  }

  const state: LoginFormState = {
    email: input.email,
    fieldErrors: {},
  };

  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    return {
      ...state,
      message: "Login is unavailable. Please contact the developer.",
    };
  }

  let authenticatedSessionId: string;

  try {
    const bootstrap = await fetch(
      new URL("/api/auth/csrf/authenticate", apiUrl),
      {
        cache: "no-store",
        redirect: "error",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!bootstrap.ok) {
      throw new Error("Unable to initialize login.");
    }

    const bootstrapSessionId = readSymfonySessionId(bootstrap.headers);
    const payload: unknown = await bootstrap.json();

    if (
      !bootstrapSessionId ||
      typeof payload !== "object" ||
      payload === null ||
      !("data" in payload) ||
      typeof payload.data !== "object" ||
      payload.data === null ||
      !("intent" in payload.data) ||
      payload.data.intent !== "authenticate" ||
      !("token" in payload.data) ||
      typeof payload.data.token !== "string" ||
      payload.data.token === ""
    ) {
      throw new Error("Invalid login bootstrap.");
    }

    const response = await fetch(new URL("/api/auth/login", apiUrl), {
      method: "POST",
      cache: "no-store",
      redirect: "error",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: `${SYMFONY_SESSION_COOKIE}=${bootstrapSessionId}`,
        "X-CSRF-Token": payload.data.token,
      },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 401) {
      return { ...state, message: "Invalid email or password." };
    }

    if (response.status === 429) {
      return {
        ...state,
        message: "Too many login attempts. Please try again later.",
      };
    }

    if (response.status === 403) {
      return {
        ...state,
        message: "Login verification failed. Please submit the form again.",
      };
    }

    if (response.status !== 200) {
      throw new Error("Unexpected login response.");
    }

    const authPayload: unknown = await response.json();
    parseAuthResponse(authPayload);

    const sessionId = readSymfonySessionId(response.headers);

    if (!sessionId || sessionId === bootstrapSessionId) {
      throw new Error("Missing session rotation.");
    }

    authenticatedSessionId = sessionId;
  } catch {
    return {
      ...state,
      message: "Unable to sign in. Please try again.",
    };
  }

  const cookieStore = await cookies();

  cookieStore.set("STOCKPILOT_SESSION", authenticatedSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  redirect("/");
}