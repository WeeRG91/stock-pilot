import { StockInFormState } from "@/types/stockInForm";

export function readStockInFormData(formData: FormData): StockInFormState {
  const quantity = formData.get("quantity");

  const state: StockInFormState = {
    values: {
      quantity: typeof quantity === "string" ? quantity : "",
    },
    fieldErrors: {},
    message: "",
  };

  if (typeof quantity !== "string") {
    state.fieldErrors.quantity = "Quantity must be provided as text.";
  } else {
    const trimmed = quantity.trim();

    if (!/^[1-9]\d*$/.test(trimmed)) {
      state.fieldErrors.quantity = "Enter a positive whole number.";
    } else {
      const value = Number(trimmed);

      if (!Number.isSafeInteger(value) || value > 2147483647) {
        state.fieldErrors.quantity = "Quantity must not exceed 2147483647.";
      }
    }
  }

  if (state.fieldErrors.quantity) {
    state.message = "Please correct the highlighted field.";
  }

  return state;
}
