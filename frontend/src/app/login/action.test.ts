import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LoginFormState } from "@/types/loginForm";

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  setCookie: vi.fn(),
  redirect: vi.fn((path: string): never => {
    throw new Error(`Redirect:${path}`);
  }),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: mocks.setCookie,
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

import { login } from "./action";

const initialState: LoginFormState = {
  email: "",
  fieldErrors: {},
};

describe("login", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mocks.fetch);
    vi.stubEnv("STOCKPILOT_API_URL", "http://symfony.test");
    mocks.fetch.mockReset();
    mocks.setCookie.mockReset();
    mocks.redirect.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("rejects invalid input without contacting Symfony", async () => {
    const formData = new FormData();
    formData.set("email", "not-an-email");
    formData.set("password", "private-password");

    const result = await login(initialState, formData);

    expect(result.fieldErrors.email).toBeDefined();
    expect(result).not.toHaveProperty("password");
    expect(JSON.stringify(result)).not.toContain("private-password");
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.setCookie).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("logs in with the bootstrap session and stores the rotated session", async () => {
    mocks.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          getSetCookie: () => [
            "STOCKPILOTSESSID=bootstrap-session; Path=/; HttpOnly",
          ],
        },
        json: async () => ({
          data: {
            intent: "authenticate",
            token: "login-csrf-token",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          getSetCookie: () => [
            "STOCKPILOTSESSID=rotated-session; Path=/; HttpOnly",
          ],
        },
        json: async () => ({
          data: {
            user: {
              id: 1,
              email: "developer@example.com",
              roles: ["ROLE_USER"],
            },
          },
        }),
      });

    const formData = new FormData();
    formData.set("email", " Developer@Example.COM ");
    formData.set("password", " private-password ");

    await expect(login(initialState, formData)).rejects.toThrow("Redirect:/");

    expect(mocks.fetch).toHaveBeenCalledTimes(2);

    expect(mocks.fetch).toHaveBeenNthCalledWith(
      1,
      new URL("http://symfony.test/api/auth/csrf/authenticate"),
      expect.objectContaining({
        cache: "no-store",
        redirect: "error",
        headers: { Accept: "application/json" },
      }),
    );

    expect(mocks.fetch).toHaveBeenNthCalledWith(
      2,
      new URL("http://symfony.test/api/auth/login"),
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        redirect: "error",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Cookie: "STOCKPILOTSESSID=bootstrap-session",
          "X-CSRF-Token": "login-csrf-token",
        },
        body: JSON.stringify({
          email: "developer@example.com",
          password: " private-password ",
        }),
      }),
    );

    expect(mocks.setCookie).toHaveBeenCalledExactlyOnceWith(
      "STOCKPILOT_SESSION",
      "rotated-session",
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    );

    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith("/");
  });

  it.each([
    [401, "Invalid email or password."],
    [403, "Login verification failed. Please submit the form again."],
    [429, "Too many login attempts. Please try again later."],
    [500, "Unable to sign in. Please try again."],
  ])(
    "handles HTTP %i without storing a session or redirecting",
    async (status, message) => {
      mocks.fetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: {
            getSetCookie: () => [
              "STOCKPILOTSESSID=bootstrap-session; Path=/; HttpOnly",
            ],
          },
          json: async () => ({
            data: {
              intent: "authenticate",
              token: "login-csrf-token",
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status,
        });

      const formData = new FormData();
      formData.set("email", "developer@example.com");
      formData.set("password", "private-password");

      const result = await login(initialState, formData);

      expect(result).toEqual({
        email: "developer@example.com",
        fieldErrors: {},
        message,
      });

      expect(JSON.stringify(result)).not.toContain("private-password");
      expect(mocks.fetch).toHaveBeenCalledTimes(2);
      expect(mocks.setCookie).not.toHaveBeenCalled();
      expect(mocks.redirect).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["missing cookie", [], true],
    ["unchanged session", ["STOCKPILOTSESSID=bootstrap-session; Path=/"], true],
    ["invalid user data", ["STOCKPILOTSESSID=rotated-session; Path=/"], false],
  ])(
    "rejects a successful response with %s",
    async (_label, cookies, validUser) => {
      mocks.fetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: {
            getSetCookie: () => ["STOCKPILOTSESSID=bootstrap-session; Path=/"],
          },
          json: async () => ({
            data: {
              intent: "authenticate",
              token: "login-csrf-token",
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: {
            getSetCookie: () => cookies,
          },
          json: async () =>
            validUser
              ? {
                  data: {
                    user: {
                      id: 1,
                      email: "developer@example.com",
                      roles: ["ROLE_USER"],
                    },
                  },
                }
              : { data: { user: null } },
        });

      const formData = new FormData();
      formData.set("email", "developer@example.com");
      formData.set("password", "private-password");

      const result = await login(initialState, formData);

      expect(result).toEqual({
        email: "developer@example.com",
        fieldErrors: {},
        message: "Unable to sign in. Please try again.",
      });

      expect(mocks.fetch).toHaveBeenCalledTimes(2);
      expect(mocks.setCookie).not.toHaveBeenCalled();
      expect(mocks.redirect).not.toHaveBeenCalled();
    },
  );

  it("handles a network failure without storing a session or retrying", async () => {
    mocks.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          getSetCookie: () => ["STOCKPILOTSESSID=bootstrap-session; Path=/"],
        },
        json: async () => ({
          data: {
            intent: "authenticate",
            token: "login-csrf-token",
          },
        }),
      })
      .mockRejectedValueOnce(new Error("Network unavailable"));

    const formData = new FormData();
    formData.set("email", "developer@example.com");
    formData.set("password", "private-password");

    const result = await login(initialState, formData);

    expect(result).toEqual({
      email: "developer@example.com",
      fieldErrors: {},
      message: "Unable to sign in. Please try again.",
    });

    expect(mocks.fetch).toHaveBeenCalledTimes(2);
    expect(mocks.setCookie).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
