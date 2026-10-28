import type { AuthResponse } from "@/types/auth";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseAuthResponse(payload: unknown): AuthResponse {
  if (!isRecord(payload) || !isRecord(payload.data)) {
    throw new Error("Invalid authentication response.");
  }

  const user = payload.data.user;

  if (
    !isRecord(user) ||
    typeof user.id !== "number" ||
    !Number.isSafeInteger(user.id) ||
    user.id <= 0 ||
    typeof user.email !== "string" ||
    user.email.trim() === "" ||
    !Array.isArray(user.roles) ||
    !user.roles.every(
      (role: unknown) => typeof role === "string" && role.length > 0,
    ) ||
    !user.roles.includes("ROLE_USER")
  ) {
    throw new Error("Invalid authentication response.");
  }

  return {
    data: {
      user: {
        id: user.id,
        email: user.email,
        roles: [...user.roles],
      },
    },
  };
}
