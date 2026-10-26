"use client";

import { useActionState, useState } from "react";
import type { StockInFormState } from "@/types/stockInForm";

type StockInFormProps = {
  action: (
    previousState: StockInFormState,
    formData: FormData,
  ) => Promise<StockInFormState>;
};

export function StockInForm({ action }: StockInFormProps) {
  const initialState: StockInFormState = {
    values: { quantity: "" },
    fieldErrors: {},
    message: "",
  };

  const [state, formAction, pending] = useActionState(action, initialState);
  const [quantity, setQuantity] = useState("");

  return (
    <form action={formAction} className="mt-6 space-y-5">
      {state.message && (
        <p role="alert" className="text-red-700">
          {state.message}
        </p>
      )}

      <fieldset disabled={pending} className="space-y-5">
        <legend className="sr-only">Stock received</legend>

        <div>
          <label
            htmlFor="stock-in-quantity"
            className="block text-sm font-medium text-zinc-700"
          >
            Quantity received
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
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
          />

          <p
            id="stock-in-quantity-help"
            className="mt-2 text-sm text-zinc-600"
          >
            Enter the number of units received. Each submission records a
            new stock movement.
          </p>

          {state.fieldErrors.quantity && (
            <p
              id="stock-in-quantity-error"
              className="mt-2 text-sm text-red-700"
            >
              {state.fieldErrors.quantity}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Recording stock…" : "Record stock in"}
        </button>
      </fieldset>
    </form>
  );
}