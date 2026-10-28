"use client";

import { useActionState, useState } from "react";
import type { StockMovementFormState } from "@/types/stockMovementForm";

type StockMovementFormProps = {
  direction: "in" | "out";
  action: (
    previousState: StockMovementFormState,
    formData: FormData,
  ) => Promise<StockMovementFormState>;
};

export function StockMovementForm({
  direction,
  action,
}: StockMovementFormProps) {
  const initialState: StockMovementFormState = {
    values: { quantity: "" },
    fieldErrors: {},
    message: "",
  };

  const [state, formAction, pending] = useActionState(action, initialState);
  const [quantity, setQuantity] = useState("");
  const isStockIn = direction === "in";

  return (
    <form action={formAction} className="form-panel">
      {state.message && (
        <p role="alert" className="form-feedback">
          {state.message}
        </p>
      )}

      <fieldset disabled={pending} className="space-y-5">
        <legend className="sr-only">
          {isStockIn ? "Stock received" : "Stock issued"}
        </legend>

        <div>
          <label
            htmlFor="stock-in-quantity"
            className="form-label"
          >
            {isStockIn ? "Quantity received" : "Quantity to issue"}
          </label>

          <input
            id="stock-in-quantity"
            name="quantity"
            type="number"
            min={1}
            max={2147483647}
            step={1}
            required
            value={quantity}
            onChange={(event) => setQuantity(event.currentTarget.value)}
            aria-invalid={Boolean(state.fieldErrors.quantity)}
            aria-describedby={
              state.fieldErrors.quantity
                ? "stock-in-quantity-help stock-in-quantity-error"
                : "stock-in-quantity-help"
            }
            className="form-input"
          />

          <p id="stock-in-quantity-help" className="mt-2 text-sm leading-6 text-muted">
            {isStockIn
              ? "Enter the number of units received."
              : "Enter the number of units to issue."}{" "}
            Each submission records a new stock movement.
          </p>

          {state.fieldErrors.quantity && (
            <p
              id="stock-in-quantity-error"
              className="mt-2 text-sm text-danger"
            >
              {state.fieldErrors.quantity}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="button-primary"
        >
          {pending
            ? "Recording stock…"
            : isStockIn
              ? "Record stock in"
              : "Record stock out"}
        </button>
      </fieldset>
    </form>
  );
}
