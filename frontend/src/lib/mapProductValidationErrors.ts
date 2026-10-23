import type { ProductFormState } from "@/types/productForm";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mapProductValidationErrors(
  payload: unknown,
  state: ProductFormState,
): ProductFormState {
  const fieldErrors: ProductFormState["fieldErrors"] = {};

  if (
    isRecord(payload) &&
    isRecord(payload.error) &&
    Array.isArray(payload.error.details)
  ) {
    for (const detail of payload.error.details) {
      if (
        isRecord(detail) &&
        (detail.field === "name" || detail.field === "sku") &&
        typeof detail.message === "string" &&
        detail.message.trim() !== ""
      ) {
        fieldErrors[detail.field] ??= detail.message;
      }
    }
  }

  return {
    ...state,
    fieldErrors,
    message:
      Object.keys(fieldErrors).length > 0
        ? "Please correct the highlighted fields."
        : "The product details were rejected. Check the field values.",
  };
}
