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
        className="rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-100 disabled:opacity-50"
      >
        {pending ? "Signing out…" : "Sign out"}
      </button>

      {state.error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}