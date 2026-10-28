import type { LoginFormState } from "@/types/loginForm";

type LoginFormResult =
  | {
      valid: true;
      email: string;
      password: string;
    }
  | {
      valid: false;
      state: LoginFormState;
    };

export function readLoginFormData(formData: FormData): LoginFormResult {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  const email =
    typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";

  const fieldErrors: LoginFormState["fieldErrors"] = {};

  if (
    email === "" ||
    email.length > 180 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (typeof passwordValue !== "string" || passwordValue === "") {
    fieldErrors.password = "Enter your password.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      valid: false,
      state: {
        email,
        fieldErrors,
        message: "Please correct the highlighted fields.",
      },
    };
  }

  return {
    valid: true,
    email,
    password: passwordValue as string,
  };
}
