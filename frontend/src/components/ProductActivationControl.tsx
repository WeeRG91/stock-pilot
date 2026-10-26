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
        <p role="alert" className="mb-3 text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-50"
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