import { describe, expect, it } from "vitest";
import { readLoginFormData } from "./readLoginFormData";

function loginData(email: string, password: string): FormData {
  const data = new FormData();
  data.set("email", email);
  data.set("password", password);
  return data;
}

describe("readLoginFormData", () => {
  it("normalizes email and preserves password spaces", () => {
    expect(
      readLoginFormData(
        loginData(" Developer@Example.COM ", " password with spaces "),
      ),
    ).toEqual({
      valid: true,
      email: "developer@example.com",
      password: " password with spaces ",
    });
  });

  it("rejects missing fields", () => {
    const result = readLoginFormData(new FormData());

    expect(result.valid).toBe(false);

    if (result.valid) {
      throw new Error("Expected invalid form data.");
    }

    expect(result.state.fieldErrors.email).toBeDefined();
    expect(result.state.fieldErrors.password).toBeDefined();
  });

  it.each(["", "   ", "not-an-email", "user@example", "user name@example.com"])(
    "rejects invalid email %j",
    (email) => {
      const result = readLoginFormData(loginData(email, "private-password"));

      expect(result.valid).toBe(false);

      if (result.valid) {
        throw new Error("Expected invalid form data.");
      }

      expect(result.state.fieldErrors.email).toBeDefined();
      expect(result.state).not.toHaveProperty("password");
      expect(JSON.stringify(result.state)).not.toContain("private-password");
    },
  );

  it("rejects an email longer than 180 characters", () => {
    const result = readLoginFormData(
      loginData(`${"a".repeat(170)}@example.com`, "private-password"),
    );

    expect(result.valid).toBe(false);
  });

  it("preserves the normalized email when the password is empty", () => {
    const result = readLoginFormData(
      loginData(" Developer@Example.COM ", ""),
    );

    expect(result).toEqual({
      valid: false,
      state: {
        email: "developer@example.com",
        fieldErrors: {
          password: "Enter your password.",
        },
        message: "Please correct the highlighted fields.",
      },
    });
  });

  it("rejects a file supplied as the password", () => {
    const data = loginData("developer@example.com", "");
    data.set("password", new File(["content"], "password.txt"));

    const result = readLoginFormData(data);

    expect(result.valid).toBe(false);

    if (result.valid) {
      throw new Error("Expected invalid form data.");
    }

    expect(result.state.fieldErrors.password).toBeDefined();
    expect(result.state).not.toHaveProperty("password");
  });

  it("rejects a file supplied as the email", () => {
    const data = loginData("", "private-password");
    data.set("email", new File(["content"], "email.txt"));

    const result = readLoginFormData(data);

    expect(result.valid).toBe(false);

    if (result.valid) {
      throw new Error("Expected invalid form data.");
    }

    expect(result.state.fieldErrors.email).toBeDefined();
    expect(result.state).not.toHaveProperty("password");
  });
});