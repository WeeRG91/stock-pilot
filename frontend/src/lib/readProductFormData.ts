import type { ProductFormState } from "@/types/productForm";

export function readProductFormData(formData: FormData): ProductFormState {
  const name = formData.get("name");
  const sku = formData.get("sku");

  const state: ProductFormState = {
    values: {
      name: typeof name === "string" ? name : "",
      sku: typeof sku === "string" ? sku : "",
    },
    fieldErrors: {},
    message: "",
  };

  if (typeof name !== "string") {
    state.fieldErrors.name = "Name must be provided as text.";
  } else if (name.trim() === "") {
    state.fieldErrors.name = "Name is required.";
  }

  if (typeof sku !== "string") {
    state.fieldErrors.sku = "SKU must be provided as text.";
  } else if (sku.trim() === "") {
    state.fieldErrors.sku = "SKU is required.";
  }

  if (Object.keys(state.fieldErrors).length > 0) {
    state.message = "Please correct the highlighted fields.";
  }

  return state;
}
