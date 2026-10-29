"use client";

import { useActionState } from "react";
import { requestInventoryExport } from "@/app/inventory-exports/action";

export function InventoryExportForm() {
  const [state, formAction, isPending] = useActionState(
    requestInventoryExport,
    { message: "" },
  );

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted disabled:cursor-wait disabled:opacity-50"
      >
        {isPending ? "Requesting export…" : "Export inventory"}
      </button>

      {state.message && (
        <p role="alert" className="max-w-xs text-sm text-danger">
          {state.message}
        </p>
      )}
    </form>
  );
}
