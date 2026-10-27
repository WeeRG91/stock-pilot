import type { MovementHistoryResponse } from "@/types/stockMovement";
import { isStockMovement } from "./isStockMovement";

export function parseMovementHistoryResponse(
  payload: unknown,
): MovementHistoryResponse {
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload) ||
    !("data" in payload) ||
    !Array.isArray(payload.data) ||
    !payload.data.every(isStockMovement) ||
    !("meta" in payload)
  ) {
    throw new Error("Invalid movement history response.");
  }

  const meta = payload.meta;

  if (
    typeof meta !== "object" ||
    meta === null ||
    Array.isArray(meta) ||
    !("limit" in meta) ||
    meta.limit !== 20 ||
    payload.data.length > meta.limit
  ) {
    throw new Error("Invalid movement history response.");
  }

  return {
    data: payload.data,
    meta: { limit: meta.limit },
  };
}
