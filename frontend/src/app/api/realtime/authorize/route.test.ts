import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  getCurrentUser: vi.fn(),
  getApiMutationHeaders: vi.fn(),
}));

vi.mock("@/lib/getCurrentUser.server", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@/lib/getApiMutationHeaders.server", () => ({
  getApiMutationHeaders: mocks.getApiMutationHeaders,
}));

vi.mock("next/navigation", () => ({
  unstable_rethrow: vi.fn(),
}));

import { POST } from "./route";

const subscriberCookie =
  "mercure_access_token=test-token; Max-Age=60; " +
  "path=/.well-known/mercure; httponly; samesite=strict";

function makeRequest(origin = "http://127.0.0.1:3000") {
  return new Request(
    "http://localhost:3000/api/realtime/authorize",
    {
      method: "POST",
      headers: { Origin: origin },
    },
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("fetch", mocks.fetch);
  vi.stubEnv("STOCKPILOT_API_URL", "http://symfony.test");
  vi.stubEnv(
    "STOCKPILOT_FRONTEND_ORIGIN",
    "http://127.0.0.1:3000",
  );

  mocks.getCurrentUser.mockResolvedValue({ id: 1 });
  mocks.getApiMutationHeaders.mockResolvedValue({
    Cookie: "STOCKPILOTSESSID=test-session",
    "X-CSRF-Token": "test-csrf",
  });

  mocks.fetch.mockResolvedValue({
    ok: true,
    status: 200,
    headers: {
      getSetCookie: () => [
        "STOCKPILOTSESSID=backend-session; HttpOnly",
        subscriberCookie,
      ],
    },
    json: async () => ({
      data: {
        hubUrl: "http://127.0.0.1:8081/.well-known/mercure",
        topic: "urn:stockpilot:inventory",
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      },
    }),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("forwards only the subscriber cookie and returns metadata", async () => {
  const response = await POST(makeRequest());
  const payload = await response.json();

  expect(response.status).toBe(200);
  expect(response.headers.get("set-cookie")).toBe(subscriberCookie);
  expect(response.headers.get("cache-control")).toBe("no-store, private");

  expect(payload.data).toEqual({
    hubUrl: "http://127.0.0.1:8081/.well-known/mercure",
    topic: "urn:stockpilot:inventory",
    expiresAt: expect.any(String),
  });
  expect(JSON.stringify(payload)).not.toContain("test-token");

  expect(mocks.fetch).toHaveBeenCalledExactlyOnceWith(
    new URL("http://symfony.test/api/realtime/authorize"),
    expect.objectContaining({
      method: "POST",
      cache: "no-store",
      redirect: "error",
      headers: {
        Cookie: "STOCKPILOTSESSID=test-session",
        "X-CSRF-Token": "test-csrf",
      },
    }),
  );
});

it("rejects a different origin before contacting Symfony", async () => {
  const response = await POST(
    makeRequest("http://another-site.test"),
  );

  expect(response.status).toBe(403);
  expect(response.headers.get("set-cookie")).toBeNull();

  expect(mocks.getCurrentUser).not.toHaveBeenCalled();
  expect(mocks.getApiMutationHeaders).not.toHaveBeenCalled();
  expect(mocks.fetch).not.toHaveBeenCalled();
});

it("rejects an anonymous user without requesting credentials", async () => {
  mocks.getCurrentUser.mockResolvedValue(null);

  const response = await POST(makeRequest());

  expect(response.status).toBe(401);
  expect(response.headers.get("set-cookie")).toBeNull();

  expect(mocks.getApiMutationHeaders).not.toHaveBeenCalled();
  expect(mocks.fetch).not.toHaveBeenCalled();
});

it.each([
  [401, 401],
  [403, 403],
  [500, 503],
])(
  "maps backend status %s to %s without forwarding cookies",
  async (backendStatus, expectedStatus) => {
    mocks.fetch.mockResolvedValue({
      ok: false,
      status: backendStatus,
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(expectedStatus);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("cache-control")).toBe("no-store, private");
  },
);

it("returns 503 when the backend request fails", async () => {
  mocks.fetch.mockRejectedValue(
    new Error("Private backend connection details"),
  );

  const response = await POST(makeRequest());

  expect(response.status).toBe(503);
  expect(response.headers.get("set-cookie")).toBeNull();
  expect(await response.text()).not.toContain(
    "Private backend connection details",
  );
});

it("rejects a successful response without a subscriber cookie", async () => {
  const backendResponse = await mocks.fetch();
  mocks.fetch.mockClear();

  mocks.fetch.mockResolvedValue({
    ...backendResponse,
    headers: {
      getSetCookie: () => [
        "STOCKPILOTSESSID=backend-session; HttpOnly",
      ],
    },
  });

  const response = await POST(makeRequest());

  expect(response.status).toBe(503);
  expect(response.headers.get("set-cookie")).toBeNull();
});