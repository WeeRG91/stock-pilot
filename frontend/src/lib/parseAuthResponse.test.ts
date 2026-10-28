import { describe, expect, it } from "vitest";
import { parseAuthResponse } from "./parseAuthResponse";

describe("parseAuthResponse", () => {
  it("accepts a valid authenticated user", () => {
    const payload = {
      data: {
        user: {
          id: 1,
          email: "developer@example.com",
          roles: ["ROLE_USER"],
        },
      },
    };

    expect(parseAuthResponse(payload)).toEqual(payload);
  });

  it("returns only the expected user fields", () => {
    const result = parseAuthResponse({
      data: {
        user: {
          id: 1,
          email: "developer@example.com",
          roles: ["ROLE_USER"],
          unexpected: "ignored",
        },
      },
    });

    expect(result.data.user).toEqual({
      id: 1,
      email: "developer@example.com",
      roles: ["ROLE_USER"],
    });
  });

  it.each([
    ["null", null],
    ["array", []],
    ["missing data", {}],
    ["missing user", { data: {} }],
    ["null user", { data: { user: null } }],
  ])("rejects %s", (_label, payload) => {
    expect(() => parseAuthResponse(payload)).toThrow(
      "Invalid authentication response.",
    );
  });

  it.each([
    ["string ID", { id: "1" }],
    ["zero ID", { id: 0 }],
    ["fractional ID", { id: 1.5 }],
    ["unsafe ID", { id: Number.MAX_SAFE_INTEGER + 1 }],
    ["empty email", { email: "   " }],
    ["non-string email", { email: 123 }],
    ["missing roles", { roles: undefined }],
    ["non-array roles", { roles: "ROLE_USER" }],
    ["non-string role", { roles: ["ROLE_USER", 123] }],
    ["empty role", { roles: ["ROLE_USER", ""] }],
    ["missing required role", { roles: ["ROLE_ADMIN"] }],
  ])("rejects %s", (_label, overrides) => {
    const user = {
      id: 1,
      email: "developer@example.com",
      roles: ["ROLE_USER"],
      ...overrides,
    };

    expect(() => parseAuthResponse({ data: { user } })).toThrow(
      "Invalid authentication response.",
    );
  });
});
