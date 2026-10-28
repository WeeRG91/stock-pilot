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
    <form action={formAction} className="form-panel">
      {state.message && (
        <p role="alert" className="form-feedback">
          {state.message}
        </p>
      )}

      <fieldset disabled={pending} className="space-y-5">
        <legend className="sr-only">Low-stock warning settings</legend>

        <div>
          <label
            htmlFor="low-stock-threshold"
            className="form-label"
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
            className="form-input"
          />

          <p id="threshold-help" className="mt-2 text-sm leading-6 text-muted">
            Active products are low stock at or below this value.
            Zero warns only when stock is empty.
          </p>

          {state.fieldErrors.threshold && (
            <p id="threshold-error" className="mt-2 text-sm text-danger">
              {state.fieldErrors.threshold}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="button-primary"
        >
          {pending ? "Saving threshold…" : "Save threshold"}
        </button>
      </fieldset>
    </form>
  );
}