import { getApiSessionHeaders } from "./getApiSessionHeaders.server";

export async function getApiMutationHeaders(): Promise<{
  Accept: string;
  Cookie: string;
  "Content-Type": string;
  "X-CSRF-Token": string;
}> {
  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    throw new Error("STOCKPILOT_API_URL is not configured.");
  }

  const headers = await getApiSessionHeaders();

  const response = await fetch(new URL("/api/auth/csrf/api", apiUrl), {
    cache: "no-store",
    redirect: "error",
    headers,
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error("Unable to prepare request verification.");
  }

  const payload: unknown = await response.json();

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("data" in payload) ||
    typeof payload.data !== "object" ||
    payload.data === null ||
    !("intent" in payload.data) ||
    payload.data.intent !== "api" ||
    !("token" in payload.data) ||
    typeof payload.data.token !== "string" ||
    payload.data.token === ""
  ) {
    throw new Error("Invalid request verification response.");
  }

  return {
    ...headers,
    "Content-Type": "application/json",
    "X-CSRF-Token": payload.data.token,
  };
}
