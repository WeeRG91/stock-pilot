import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  getSessionHeaders: vi.fn(),
  deleteCookie: vi.fn(),
  redirect: vi.fn((path: string): never => {
    throw new Error(`Redirect:${path}`);
  }),
}));

vi.mock("@/lib/getApiSessionHeaders.server", () => ({
  getApiSessionHeaders: mocks.getSessionHeaders,
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    delete: mocks.deleteCookie,
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  unstable_rethrow: vi.fn(),
}));

import { logout } from "./logout-action";

describe("logout", () => {
  beforeEach(() => {
    mocks.fetch.mockReset();
    mocks.getSessionHeaders.mockReset();
    mocks.deleteCookie.mockReset();
    mocks.redirect.mockClear();

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

  it.each([200, 401])(
    "clears the browser session after backend HTTP %i",
    async (status) => {
      mocks.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { intent: "logout", token: "logout-token" },
          }),
        })
        .mockResolvedValueOnce({ status });

      await expect(logout({ error: "" })).rejects.toThrow("Redirect:/login");

      expect(mocks.fetch).toHaveBeenCalledTimes(2);

      expect(mocks.fetch).toHaveBeenNthCalledWith(
        1,
        new URL("http://symfony.test/api/auth/csrf/logout"),
        expect.objectContaining({
          cache: "no-store",
          redirect: "error",
          headers: {
            Accept: "application/json",
            Cookie: "STOCKPILOTSESSID=current-session",
          },
        }),
      );

      expect(mocks.fetch).toHaveBeenNthCalledWith(
        2,
        new URL("http://symfony.test/api/auth/logout"),
        expect.objectContaining({
          method: "POST",
          cache: "no-store",
          redirect: "error",
          headers: {
            Accept: "application/json",
            Cookie: "STOCKPILOTSESSID=current-session",
            "X-CSRF-Token": "logout-token",
          },
        }),
      );

      expect(mocks.deleteCookie).toHaveBeenCalledExactlyOnceWith(
        "STOCKPILOT_SESSION",
      );
      expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith("/login");
    },
  );

  it.each([403, 500])(
    "preserves the cookie after backend HTTP %i",
    async (status) => {
      mocks.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { intent: "logout", token: "logout-token" },
          }),
        })
        .mockResolvedValueOnce({ status });

      await expect(logout({ error: "" })).resolves.toEqual({
        error: "Sign out could not be confirmed. Please try again.",
      });

      expect(mocks.fetch).toHaveBeenCalledTimes(2);
      expect(mocks.deleteCookie).not.toHaveBeenCalled();
      expect(mocks.redirect).not.toHaveBeenCalled();
    },
  );

  it("preserves the cookie when the logout request fails", async () => {
    mocks.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { intent: "logout", token: "logout-token" },
        }),
      })
      .mockRejectedValueOnce(new Error("Network unavailable"));

    await expect(logout({ error: "" })).resolves.toEqual({
      error: "Sign out could not be confirmed. Please try again.",
    });

    expect(mocks.fetch).toHaveBeenCalledTimes(2);
    expect(mocks.deleteCookie).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("rejects a token for the wrong intent without requesting logout", async () => {
    mocks.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { intent: "api", token: "wrong-intent-token" },
      }),
    });

    await expect(logout({ error: "" })).resolves.toEqual({
      error: "Sign out could not be confirmed. Please try again.",
    });

    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    expect(mocks.deleteCookie).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
