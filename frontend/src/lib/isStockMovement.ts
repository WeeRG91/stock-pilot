import { StockMovement } from "@/types/stockMovement";

export function isStockMovement(value: unknown): value is StockMovement {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "id" in value &&
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    "productId" in value &&
    typeof value.productId === "number" &&
    Number.isSafeInteger(value.productId) &&
    value.productId > 0 &&
    "type" in value &&
    (value.type === "in" || value.type === "out") &&
    "quantity" in value &&
    typeof value.quantity === "number" &&
    Number.isSafeInteger(value.quantity) &&
    value.quantity > 0 &&
    value.quantity <= 2147483647 &&
    "createdAt" in value &&
    typeof value.createdAt === "string" &&
    Number.isFinite(Date.parse(value.createdAt))
  );
}