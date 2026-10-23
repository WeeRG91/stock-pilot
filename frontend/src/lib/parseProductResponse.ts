import type { ProductResponse } from "@/types/product";
import { isProduct } from "./isProduct";

export function parseProductResponse(value: unknown): ProductResponse {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !("data" in value) ||
    !isProduct(value.data)
  ) {
    throw new Error("Invalid product response.");
  }

  return {
    data: value.data,
  };
}
