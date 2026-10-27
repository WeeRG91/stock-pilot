import { LowStockThresholdFormState } from "@/types/lowStockThreshold";

export function readLowStockThresholdFormData(
  formData: FormData,
): LowStockThresholdFormState {
  const threshold = formData.get("threshold");

  const state: LowStockThresholdFormState = {
    values: {
      threshold: typeof threshold === "string" ? threshold : "",
    },
    fieldErrors: {},
    message: "",
  };

  if (typeof threshold !== "string") {
    state.fieldErrors.threshold = "Threshold must be provided as text.";
  } else {
    const trimmed = threshold.trim();

    if (!/^(0|[1-9]\d*)$/.test(trimmed)) {
      state.fieldErrors.threshold = "Enter zero or a positive whole number.";
    } else {
      const value = Number(trimmed);

      if (!Number.isSafeInteger(value) || value > 2147483647) {
        state.fieldErrors.threshold = "Threshold must not exceed 2147483647.";
      }
    }
  }

  if (state.fieldErrors.threshold) {
    state.message = "Please correct the highlighted field.";
  }

  return state;
}
