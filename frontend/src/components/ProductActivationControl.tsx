"use client";

import { useActionState } from "react";
import type { ProductActivationState } from "@/types/productActivation";

type ProductActivationControlProps = {
  active: boolean;
  action: (
    previousState: ProductActivationState,
  ) => Promise<ProductActivationState>;
};

export function ProductActivationControl({
  active,
  action,
}: ProductActivationControlProps) {
  const [state, formAction, pending] = useActionState(action, {
    error: "",
  });

  return (
    <form action={formAction} className="mt-6">
      {state.error && (
        <p role="alert" className="mb-3 text-sm text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`min-h-11 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
          active
            ? "text-danger hover:bg-accent-soft"
            : "bg-success-soft text-success hover:bg-surface-muted"
        }`}
      >
        {pending
          ? "Updating status…"
          : active
            ? "Deactivate product"
            : "Activate product"}
      </button>
    </form>
  );
}
