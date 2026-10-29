import type { MovementHistoryResponse } from "@/types/stockMovement";
import { isStockMovement } from "./isStockMovement";

function isIntegerAtLeast(value: unknown, minimum: number): value is number {
  return (
    typeof value === "number" && Number.isSafeInteger(value) && value >= minimum
  );
}

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
    !("page" in meta) ||
    !isIntegerAtLeast(meta.page, 1) ||
    !("limit" in meta) ||
    !isIntegerAtLeast(meta.limit, 1) ||
    meta.limit > 100 ||
    !("total" in meta) ||
    !isIntegerAtLeast(meta.total, 0) ||
    !("totalPages" in meta) ||
    !isIntegerAtLeast(meta.totalPages, 0) ||
    meta.totalPages !== Math.ceil(meta.total / meta.limit) ||
    payload.data.length > meta.limit ||
    payload.data.length > meta.total
  ) {
    throw new Error("Invalid movement history response.");
  }

  return {
    data: payload.data,
    meta: {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages: meta.totalPages,
    },
  };
}
