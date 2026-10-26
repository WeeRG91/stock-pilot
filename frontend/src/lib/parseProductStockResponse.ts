import type { ProductStockResponse } from "@/types/productStock";

export function parseProductStockResponse(
  payload: unknown,
): ProductStockResponse {
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload) ||
    !("data" in payload)
  ) {
    throw new Error("Invalid product stock response.");
  }

  const stock = payload.data;

  if (
    typeof stock !== "object" ||
    stock === null ||
    Array.isArray(stock) ||
    !("productId" in stock) ||
    typeof stock.productId !== "number" ||
    !Number.isSafeInteger(stock.productId) ||
    stock.productId < 1 ||
    !("quantity" in stock) ||
    typeof stock.quantity !== "number" ||
    !Number.isSafeInteger(stock.quantity) ||
    stock.quantity < 0
  ) {
    throw new Error("Invalid product stock response.");
  }

  return {
    data: {
      productId: stock.productId,
      quantity: stock.quantity,
    },
  };
}
