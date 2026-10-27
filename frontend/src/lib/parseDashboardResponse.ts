import type { DashboardMovement, DashboardResponse } from "@/types/dashboard";
import { isStockMovement } from "./isStockMovement";

function isNonnegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isDashboardMovement(value: unknown): value is DashboardMovement {
  return (
    isStockMovement(value) &&
    "productName" in value &&
    typeof value.productName === "string" &&
    "productSku" in value &&
    typeof value.productSku === "string"
  );
}

export function parseDashboardResponse(
  payload: unknown,
): DashboardResponse {
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload) ||
    !("data" in payload) ||
    !("meta" in payload)
  ) {
    throw new Error("Invalid dashboard response.");
  }

  const data = payload.data;
  const meta = payload.meta;

  if (
    typeof data !== "object" ||
    data === null ||
    Array.isArray(data) ||
    !("products" in data) ||
    !("stock" in data) ||
    !("recentMovements" in data) ||
    typeof meta !== "object" ||
    meta === null ||
    Array.isArray(meta) ||
    !("recentMovementsLimit" in meta) ||
    meta.recentMovementsLimit !== 5
  ) {
    throw new Error("Invalid dashboard response.");
  }

  const products = data.products;
  const stock = data.stock;
  const movements = data.recentMovements;

  if (
    typeof products !== "object" ||
    products === null ||
    Array.isArray(products) ||
    !("total" in products) ||
    !isNonnegativeInteger(products.total) ||
    !("active" in products) ||
    !isNonnegativeInteger(products.active) ||
    !("inactive" in products) ||
    !isNonnegativeInteger(products.inactive) ||
    products.active + products.inactive !== products.total ||
    typeof stock !== "object" ||
    stock === null ||
    Array.isArray(stock) ||
    !("totalUnits" in stock) ||
    !isNonnegativeInteger(stock.totalUnits) ||
    !Array.isArray(movements) ||
    !movements.every(isDashboardMovement) ||
    movements.length > meta.recentMovementsLimit
  ) {
    throw new Error("Invalid dashboard response.");
  }

  return {
    data: {
      products: {
        total: products.total,
        active: products.active,
        inactive: products.inactive,
      },
      stock: {
        totalUnits: stock.totalUnits,
      },
      recentMovements: movements,
    },
    meta: {
      recentMovementsLimit: meta.recentMovementsLimit,
    },
  };
}
