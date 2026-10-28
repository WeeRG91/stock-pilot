"use client";

import { useActionState, useState } from "react";
import type { ProductFormState, ProductFormValues } from "@/types/productForm";

type ProductFormProps = {
  action: (
    previousState: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  initialValues: ProductFormValues;
  submitLabel: string;
  pendingLabel: string;
};

export function ProductForm({
  action,
  initialValues,
  submitLabel,
  pendingLabel,
}: ProductFormProps) {
  const initialState: ProductFormState = {
    values: initialValues,
    fieldErrors: {},
    message: "",
  };

  const [state, formAction, pending] = useActionState(action, initialState);

  const [name, setName] = useState(initialValues.name);
  const [sku, setSku] = useState(initialValues.sku);

  return (
    <form action={formAction} className="form-panel">
      {state.message && (
        <p role="alert" className="form-feedback">
          {state.message}
        </p>
      )}

      <fieldset disabled={pending} className="space-y-5">
        <legend className="sr-only">Product details</legend>

        <div>
          <label
            htmlFor="product-name"
            className="form-label"
          >
            Name
          </label>
          <input
            id="product-name"
            name="name"
            type="text"
            required
            maxLength={150}
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            aria-invalid={Boolean(state.fieldErrors.name)}
            aria-describedby={
              state.fieldErrors.name ? "product-name-error" : undefined
            }
            className="form-input"
          />
          {state.fieldErrors.name && (
            <p id="product-name-error" className="mt-2 text-sm text-danger">
              {state.fieldErrors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="product-sku"
            className="form-label"
          >
            SKU
          </label>
          <input
            id="product-sku"
            name="sku"
            type="text"
            required
            maxLength={50}
            value={sku}
            onChange={(event) => setSku(event.currentTarget.value)}
            aria-invalid={Boolean(state.fieldErrors.sku)}
            aria-describedby={
              state.fieldErrors.sku ? "product-sku-error" : undefined
            }
            className="form-input"
          />
          {state.fieldErrors.sku && (
            <p id="product-sku-error" className="mt-2 text-sm text-danger">
              {state.fieldErrors.sku}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="button-primary"
        >
          {pending ? pendingLabel : submitLabel}
        </button>
      </fieldset>
    </form>
  );
}
