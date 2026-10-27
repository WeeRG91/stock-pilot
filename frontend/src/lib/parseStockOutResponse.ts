import { StockOutResponse } from "@/types/stockMovement";
import { isStockMovement } from "./isStockMovement";

export function parseStockOutResponse(payload: unknown): StockOutResponse {
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload) ||
    !("data" in payload)
  ) {
    throw new Error("Invalid stock-out response.");
  }

  const movement = payload.data;

  if (!isStockMovement(movement) || movement.type !== "out") {
    throw new Error("Invalid stock-out response.");
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
