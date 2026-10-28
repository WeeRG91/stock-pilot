"use client";

import { useActionState } from "react";
import type { LogoutState } from "@/types/logout";

type LogoutControlProps = {
  action: (previousState: LogoutState) => Promise<LogoutState>;
};

export function LogoutControl({ action }: LogoutControlProps) {
  const [state, formAction, pending] = useActionState(action, {
    error: "",
  });

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Signing out…" : "Sign out"}
      </button>

      {state.error && (
        <p role="alert" className="mt-2 max-w-xs text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}