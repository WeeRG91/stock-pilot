"use client";

import { useActionState } from "react";
import type { LoginFormState } from "@/types/loginForm";

type LoginFormProps = {
  action: (
    previousState: LoginFormState,
    formData: FormData,
  ) => Promise<LoginFormState>;
};

const initialState: LoginFormState = {
  email: "",
  fieldErrors: {},
};

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="form-panel">
      {state.message && (
        <p role="alert" className="form-feedback">
          {state.message}
        </p>
      )}

      <fieldset disabled={pending} className="space-y-5">
        <legend className="sr-only">Sign-in details</legend>

        <div>
          <label
            htmlFor="login-email"
            className="form-label"
          >
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            maxLength={180}
            required
            defaultValue={state.email}
            aria-invalid={Boolean(state.fieldErrors.email)}
            aria-describedby={
              state.fieldErrors.email ? "login-email-error" : undefined
            }
            className="form-input"
          />
          {state.fieldErrors.email && (
            <p id="login-email-error" className="mt-2 text-sm text-danger">
              {state.fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="form-label"
          >
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(state.fieldErrors.password)}
            aria-describedby={
              state.fieldErrors.password ? "login-password-error" : undefined
            }
            className="form-input"
          />
          {state.fieldErrors.password && (
            <p id="login-password-error" className="mt-2 text-sm text-danger">
              {state.fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="button-primary w-full"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </fieldset>
    </form>
  );
}