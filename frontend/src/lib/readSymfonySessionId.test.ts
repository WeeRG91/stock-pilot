import { describe, expect, it } from "vitest";
import { readSymfonySessionId } from "./readSymfonySessionId";

function cookieHeaders(...cookies: string[]): Headers {
  return {
    getSetCookie: () => cookies,
  } as Headers;
}

describe("readSymfonySessionId", () => {
  it("returns null when no cookies are present", () => {
    expect(readSymfonySessionId(cookieHeaders())).toBeNull();
  });

  it("ignores unrelated cookies", () => {
    expect(
      readSymfonySessionId(cookieHeaders("theme=dark; Path=/")),
    ).toBeNull();
  });

  it("reads the Symfony session cookie", () => {
    expect(
      readSymfonySessionId(
        cookieHeaders(
          "STOCKPILOTSESSID=abc123-session; Path=/; HttpOnly; SameSite=Lax",
        ),
      ),
    ).toBe("abc123-session");
  });

  it("accepts a cookie without attributes", () => {
    expect(
      readSymfonySessionId(cookieHeaders("STOCKPILOTSESSID=abc123")),
    ).toBe("abc123");
  });

  it("handles other cookies with an Expires date", () => {
    expect(
      readSymfonySessionId(
        cookieHeaders(
          "theme=dark; Expires=Wed, 28 Oct 2026 12:00:00 GMT",
          "STOCKPILOTSESSID=session123; Path=/",
        ),
      ),
    ).toBe("session123");
  });

  it("matches the cookie name exactly", () => {
    expect(
      readSymfonySessionId(
        cookieHeaders("OTHER_STOCKPILOTSESSID=abc123; Path=/"),
      ),
    ).toBeNull();
  });

  it("rejects duplicate session cookies", () => {
    expect(() =>
      readSymfonySessionId(
        cookieHeaders(
          "STOCKPILOTSESSID=first",
          "STOCKPILOTSESSID=second",
        ),
      ),
    ).toThrow("Invalid Symfony session cookie.");
  });

  it.each([
    ["empty", ""],
    ["spaces", "abc def"],
    ["equals sign", "abc=def"],
    ["unsupported character", "abc/def"],
    ["oversized", "a".repeat(257)],
  ])("rejects an %s session value", (_label, value) => {
    expect(() =>
      readSymfonySessionId(
        cookieHeaders(`STOCKPILOTSESSID=${value}; Path=/`),
      ),
    ).toThrow("Invalid Symfony session cookie.");
  });
});