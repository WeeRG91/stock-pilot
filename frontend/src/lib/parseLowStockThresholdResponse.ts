import type {
  LowStockThresholdResponse,
} from "@/types/lowStockThreshold";

export function parseLowStockThresholdResponse(
  payload: unknown,
): LowStockThresholdResponse {
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload) ||
    !("data" in payload)
  ) {
    throw new Error("Invalid low-stock threshold response.");
  }

  const settings = payload.data;

  if (
    typeof settings !== "object" ||
    settings === null ||
    Array.isArray(settings) ||
    !("productId" in settings) ||
    typeof settings.productId !== "number" ||
    !Number.isSafeInteger(settings.productId) ||
    settings.productId < 1 ||
    !("threshold" in settings) ||
    typeof settings.threshold !== "number" ||
    !Number.isSafeInteger(settings.threshold) ||
    settings.threshold < 0 ||
    settings.threshold > 2147483647
  ) {
    throw new Error("Invalid low-stock threshold response.");
  }

  return {
    data: {
      productId: settings.productId,
      threshold: settings.threshold,
    },
  };
}