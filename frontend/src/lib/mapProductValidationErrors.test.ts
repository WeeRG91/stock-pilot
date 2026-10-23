import { expect, test } from "vitest";
import { mapProductValidationErrors } from "@/lib/mapProductValidationErrors";
import type { ProductFormState } from "@/types/productForm";

const state: ProductFormState = {
  values: { name: "Example", sku: "EXAMPLE-001" },
  fieldErrors: {},
  message: "",
};

test("maps known field errors and preserves submitted values", () => {
  const payload = {
    error: {
      details: [
        { field: "name", message: "Name is too long." },
        { field: "sku", message: "SKU is too long." },
      ],
    },
  };

  expect(mapProductValidationErrors(payload, state)).toEqual({
    values: state.values,
    fieldErrors: {
      name: "Name is too long.",
      sku: "SKU is too long.",
    },
    message: "Please correct the highlighted fields.",
  });

  expect(state.fieldErrors).toEqual({});
});

test("keeps the first error for each field", () => {
  const payload = {
    error: {
      details: [
        { field: "name", message: "First error." },
        { field: "name", message: "Second error." },
      ],
    },
  };

  expect(mapProductValidationErrors(payload, state).fieldErrors).toEqual({
    name: "First error.",
  });
});

test("ignores unknown fields and malformed details", () => {
  const payload = {
    error: {
      details: [
        null,
        { field: "price", message: "Unknown field." },
        { field: "name", message: 123 },
        { field: "sku", message: "   " },
      ],
    },
  };

  expect(mapProductValidationErrors(payload, state)).toEqual({
    values: state.values,
    fieldErrors: {},
    message: "The product details were rejected. Check the field values.",
  });
});

test("uses a fallback for an unexpected response", () => {
  expect(mapProductValidationErrors(null, state)).toEqual({
    values: state.values,
    fieldErrors: {},
    message: "The product details were rejected. Check the field values.",
  });
});