import type { Product, ProductListResponse } from "@/types/product";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIntegerAtLeast(value: unknown, minimum: number): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= minimum
  );
}

function isProduct(value: unknown): value is Product {
  return (
    isRecord(value) &&
    isIntegerAtLeast(value.id, 1) &&
    typeof value.name === "string" &&
    typeof value.sku === "string" &&
    typeof value.active === "boolean"
  );
}

export function parseProductListResponse(
  value: unknown,
): ProductListResponse {
  if (!isRecord(value)) {
    throw new Error("Invalid product list response.");
  }

  const data = value.data;
  const meta = value.meta;

  if (!Array.isArray(data) || !data.every(isProduct)) {
    throw new Error("Invalid product list data.");
  }

  if (
    !isRecord(meta) ||
    !isIntegerAtLeast(meta.page, 1) ||
    !isIntegerAtLeast(meta.limit, 1) ||
    meta.limit > 100 ||
    !isIntegerAtLeast(meta.total, 0) ||
    !isIntegerAtLeast(meta.totalPages, 0)
  ) {
    throw new Error("Invalid product pagination metadata.");
  }

  return {
    data,
    meta: {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages: meta.totalPages,
    },
  };
}