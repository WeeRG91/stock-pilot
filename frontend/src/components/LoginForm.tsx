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
    <form action={formAction} className="mt-6 space-y-5">
      {state.message && (
        <p role="alert" className="text-red-700">
          {state.message}
        </p>
      )}

      <fieldset disabled={pending} className="space-y-5">
        <legend className="sr-only">Sign-in details</legend>

        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-zinc-700"
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
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
          />
          {state.fieldErrors.email && (
            <p id="login-email-error" className="mt-2 text-sm text-red-700">
              {state.fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-zinc-700"
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
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
          />
          {state.fieldErrors.password && (
            <p id="login-password-error" className="mt-2 text-sm text-red-700">
              {state.fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </fieldset>
    </form>
  );
}