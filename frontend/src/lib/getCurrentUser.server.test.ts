import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCookie: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: mocks.getCookie,
  }),
}));

import { getCurrentUser } from "./getCurrentUser.server";

describe("getCurrentUser", () => {
  beforeEach(() => {
    mocks.getCookie.mockReset();
    mocks.fetch.mockReset();

    vi.stubGlobal("fetch", mocks.fetch);
    vi.stubEnv("STOCKPILOT_API_URL", "http://symfony.test");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("returns null without fetching when the cookie is missing", async () => {
    mocks.getCookie.mockReturnValue(undefined);

    await expect(getCurrentUser()).resolves.toBeNull();

    expect(mocks.getCookie).toHaveBeenCalledWith("STOCKPILOT_SESSION");
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("returns null without forwarding an invalid cookie", async () => {
    mocks.getCookie.mockReturnValue({ value: "invalid;cookie=value" });

    await expect(getCurrentUser()).resolves.toBeNull();

    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("returns the account confirmed by Symfony", async () => {
    const user = {
      id: 1,
      email: "developer@example.com",
      roles: ["ROLE_USER"],
    };

    mocks.getCookie.mockReturnValue({ value: "current-session" });
    mocks.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { user } }),
    });

    await expect(getCurrentUser()).resolves.toEqual(user);

    expect(mocks.fetch).toHaveBeenCalledExactlyOnceWith(
      new URL("http://symfony.test/api/auth/me"),
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

  it("returns null when Symfony rejects an expired session", async () => {
    mocks.getCookie.mockReturnValue({ value: "expired-session" });
    mocks.fetch.mockResolvedValue({ ok: false, status: 401 });

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("rejects an unexpected backend error", async () => {
    mocks.getCookie.mockReturnValue({ value: "current-session" });
    mocks.fetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(getCurrentUser()).rejects.toThrow(
      "Unable to fetch the current account.",
    );
  });

  it("rejects invalid account data", async () => {
    mocks.getCookie.mockReturnValue({ value: "current-session" });
    mocks.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { user: null } }),
    });

    await expect(getCurrentUser()).rejects.toThrow(
      "Invalid authentication response.",
    );
  });
});