import { getApiMutationHeaders } from "@/lib/getApiMutationHeaders.server";
import { getCurrentUser } from "@/lib/getCurrentUser.server";
import { unstable_rethrow } from "next/navigation";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const expectedOrigin = process.env.STOCKPILOT_FRONTEND_ORIGIN;

  if (!expectedOrigin) {
    return Response.json(
      { error: "Subscription unavailable." },
      {
        status: 503,
        headers: { "Cache-Control": "no-store, private" },
      },
    );
  }

  if (origin !== expectedOrigin) {
    return Response.json(
      {
        error: "Invalid request origin.",
      },
      {
        status: 403,
        headers: { "Cache-Control": "no-store, private" },
      },
    );
  }

  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    return Response.json(
      { error: "Subscription unavailable." },
      {
        status: 503,
        headers: { "Cache-Control": "no-store, private" },
      },
    );
  }

  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { error: "Authentication required." },
        {
          status: 401,
          headers: { "Cache-Control": "no-store, private" },
        },
      );
    }

    const headers = await getApiMutationHeaders();

    const response = await fetch(new URL("/api/realtime/authorize", apiUrl), {
      method: "POST",
      headers,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return Response.json(
        { error: "Subscription authorization failed." },
        {
          status:
            response.status === 401 || response.status === 403
              ? response.status
              : 503,
          headers: { "Cache-Control": "no-store, private" },
        },
      );
    }

    const payload: unknown = await response.json();

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("data" in payload) ||
      typeof payload.data !== "object" ||
      payload.data === null ||
      !("hubUrl" in payload.data) ||
      typeof payload.data.hubUrl !== "string" ||
      !("topic" in payload.data) ||
      payload.data.topic !== "urn:stockpilot:inventory" ||
      !("expiresAt" in payload.data) ||
      typeof payload.data.expiresAt !== "string"
    ) {
      throw new Error("Invalid subscription metadata.");
    }

    const { hubUrl, topic, expiresAt } = payload.data;
    const hub = new URL(hubUrl);
    const expiration = Date.parse(expiresAt);

    if (
      !["http:", "https:"].includes(hub.protocol) ||
      hub.hostname !== new URL(expectedOrigin).hostname ||
      hub.pathname !== "/.well-known/mercure" ||
      hub.username !== "" ||
      hub.password !== "" ||
      !Number.isFinite(expiration) ||
      expiration <= Date.now()
    ) {
      throw new Error("Invalid subscription configuration.");
    }

    const subscriberCookie = response.headers
      .getSetCookie()
      .find((cookie) => cookie.startsWith("mercure_access_token="));

    if (!subscriberCookie) {
      throw new Error("Missing subscriber cookie.");
    }

    return Response.json(
      {
        data: {
          hubUrl,
          topic,
          expiresAt,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, private",
          "Set-Cookie": subscriberCookie,
        },
      },
    );
  } catch (error) {
    unstable_rethrow(error);

    return Response.json(
      { error: "Subscription unavailable." },
      {
        status: 503,
        headers: { "Cache-Control": "no-store, private" },
      },
    );
  }
}
