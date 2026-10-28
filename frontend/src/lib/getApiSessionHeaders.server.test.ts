import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCookie: vi.fn(),
  redirect: vi.fn((path: string): never => {
    throw new Error(`Redirect:${path}`);
  }),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: mocks.getCookie,
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

import { getApiSessionHeaders } from "./getApiSessionHeaders.server";

describe("getApiSessionHeaders", () => {
  beforeEach(() => {
    mocks.getCookie.mockReset();
    mocks.redirect.mockClear();
  });

  it("forwards the named session cookie", async () => {
    mocks.getCookie.mockReturnValue({ value: "session123" });

    await expect(getApiSessionHeaders()).resolves.toEqual({
      Accept: "application/json",
      Cookie: "STOCKPILOTSESSID=session123",
    });

    expect(mocks.getCookie).toHaveBeenCalledWith("STOCKPILOT_SESSION");
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("redirects when the session cookie is missing", async () => {
    mocks.getCookie.mockReturnValue(undefined);

    await expect(getApiSessionHeaders()).rejects.toThrow(
      "Redirect:/login",
    );

    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });

  it.each(["", "invalid value", "abc;other=value", "a".repeat(257)])(
    "rejects an invalid session value %j",
    async (value) => {
      mocks.getCookie.mockReturnValue({ value });

      await expect(getApiSessionHeaders()).rejects.toThrow(
        "Redirect:/login",
      );
    },
  );

  it("reads the session again for each call", async () => {
    mocks.getCookie
      .mockReturnValueOnce({ value: "first-session" })
      .mockReturnValueOnce({ value: "second-session" });

    const first = await getApiSessionHeaders();
    const second = await getApiSessionHeaders();

    expect(first.Cookie).toBe("STOCKPILOTSESSID=first-session");
    expect(second.Cookie).toBe("STOCKPILOTSESSID=second-session");
    expect(mocks.getCookie).toHaveBeenCalledTimes(2);
  });
});