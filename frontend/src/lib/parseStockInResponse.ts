import { StockInResponse } from "@/types/stockMovement";

export function parseStockInResponse(payload: unknown): StockInResponse {
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload) ||
    !("data" in payload)
  ) {
    throw new Error("Invalid stock-in response.");
  }

  const movement = payload.data;

  if (
    typeof movement !== "object" ||
    movement === null ||
    Array.isArray(movement) ||
    !("id" in movement) ||
    typeof movement.id !== "number" ||
    !Number.isSafeInteger(movement.id) ||
    movement.id < 1 ||
    !("productId" in movement) ||
    typeof movement.productId !== "number" ||
    !Number.isSafeInteger(movement.productId) ||
    movement.productId < 1 ||
    !("type" in movement) ||
    movement.type !== "in" ||
    !("quantity" in movement) ||
    typeof movement.quantity !== "number" ||
    !Number.isSafeInteger(movement.quantity) ||
    movement.quantity < 1 ||
    movement.quantity > 2147483647 ||
    !("createdAt" in movement) ||
    typeof movement.createdAt !== "string" ||
    !Number.isFinite(Date.parse(movement.createdAt))
  ) {
    throw new Error("Invalid stock-in response.");
  }

  return {
    data: {
      id: movement.id,
      productId: movement.productId,
      type: movement.type,
      quantity: movement.quantity,
      createdAt: movement.createdAt,
    },
  };
}
