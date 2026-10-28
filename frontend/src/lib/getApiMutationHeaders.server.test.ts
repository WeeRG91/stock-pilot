import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  getSessionHeaders: vi.fn(),
}));

vi.mock("./getApiSessionHeaders.server", () => ({
  getApiSessionHeaders: mocks.getSessionHeaders,
}));

import { getApiMutationHeaders } from "./getApiMutationHeaders.server";

describe("getApiMutationHeaders", () => {
  beforeEach(() => {
    mocks.fetch.mockReset();
    mocks.getSessionHeaders.mockReset();

    vi.stubGlobal("fetch", mocks.fetch);
    vi.stubEnv("STOCKPILOT_API_URL", "http://symfony.test");

    mocks.getSessionHeaders.mockResolvedValue({
      Accept: "application/json",
      Cookie: "STOCKPILOTSESSID=current-session",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("requests an api token using the current session", async () => {
    mocks.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { intent: "api", token: "api-csrf-token" },
      }),
    });

    await expect(getApiMutationHeaders()).resolves.toEqual({
      Accept: "application/json",
      Cookie: "STOCKPILOTSESSID=current-session",
      "Content-Type": "application/json",
      "X-CSRF-Token": "api-csrf-token",
    });

    expect(mocks.fetch).toHaveBeenCalledExactlyOnceWith(
      new URL("http://symfony.test/api/auth/csrf/api"),
      expect.objectContaining({
        cache: "no-store",
        redirect: "error",
        headers: {
          Accept: "application/json",
          Cookie: "STOCKPILOTSESSID=current-session",
        },
      }),
    );
  });

  it.each([
    ["missing data", {}],
    ["wrong intent", { data: { intent: "logout", token: "token" } }],
    ["empty token", { data: { intent: "api", token: "" } }],
    ["numeric token", { data: { intent: "api", token: 123 } }],
  ])("rejects %s", async (_label, payload) => {
    mocks.fetch.mockResolvedValue({
      ok: true,
      json: async () => payload,
    });

    await expect(getApiMutationHeaders()).rejects.toThrow(
      "Invalid request verification response.",
    );
  });

  it("rejects an unsuccessful bootstrap response", async () => {
    mocks.fetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(getApiMutationHeaders()).rejects.toThrow(
      "Unable to prepare request verification.",
    );
  });

  it("propagates a missing-session redirect without fetching", async () => {
    mocks.getSessionHeaders.mockRejectedValue(
      new Error("Redirect:/login"),
    );

    await expect(getApiMutationHeaders()).rejects.toThrow(
      "Redirect:/login",
    );

    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("does not retry a failed bootstrap request", async () => {
    mocks.fetch.mockRejectedValue(new Error("Network unavailable"));

    await expect(getApiMutationHeaders()).rejects.toThrow(
      "Network unavailable",
    );

    expect(mocks.fetch).toHaveBeenCalledTimes(1);
  });
});