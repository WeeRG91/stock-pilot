"use client";

import { useActionState, useState } from "react";
import type {
  LowStockThresholdFormState,
} from "@/types/lowStockThreshold";

type LowStockThresholdFormProps = {
  initialThreshold: number;
  action: (
    previousState: LowStockThresholdFormState,
    formData: FormData,
  ) => Promise<LowStockThresholdFormState>;
};

export function LowStockThresholdForm({
  initialThreshold,
  action,
}: LowStockThresholdFormProps) {
  const initialState: LowStockThresholdFormState = {
    values: {
      threshold: String(initialThreshold),
    },
    fieldErrors: {},
    message: "",
  };

  const [state, formAction, pending] = useActionState(action, initialState);
  const [threshold, setThreshold] = useState(String(initialThreshold));

  return (
    <form action={formAction} className="mt-6 space-y-5">
      {state.message && (
        <p role="alert" className="text-red-700">
          {state.message}
        </p>
      )}

      <fieldset disabled={pending} className="space-y-5">
        <legend className="sr-only">Low-stock warning settings</legend>

        <div>
          <label
            htmlFor="low-stock-threshold"
            className="block text-sm font-medium text-zinc-700"
          >
            Low-stock threshold
          </label>

          <input
            id="low-stock-threshold"
            name="threshold"
            type="number"
            min={0}
            max={2147483647}
            step={1}
            required
            value={threshold}
            onChange={(event) => setThreshold(event.currentTarget.value)}
            aria-invalid={Boolean(state.fieldErrors.threshold)}
            aria-describedby={
              state.fieldErrors.threshold
                ? "threshold-help threshold-error"
                : "threshold-help"
            }
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
          />

          <p id="threshold-help" className="mt-2 text-sm text-zinc-600">
            Active products are low stock at or below this value.
            Zero warns only when stock is empty.
          </p>

          {state.fieldErrors.threshold && (
            <p id="threshold-error" className="mt-2 text-sm text-red-700">
              {state.fieldErrors.threshold}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Saving threshold…" : "Save threshold"}
        </button>
      </fieldset>
    </form>
  );
}