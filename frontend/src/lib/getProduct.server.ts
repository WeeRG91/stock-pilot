import type { Product } from "@/types/product";
import { parseProductResponse } from "./parseProductResponse";

export async function getProduct(id: string): Promise<Product | null> {
  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    throw new Error("STOCKPILOT_API_URL is not configured.");
  }

  const response = await fetch(new URL(`/api/products/${id}`, apiUrl), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to fetch product details.");
  }

  const payload: unknown = await response.json();
  const result = parseProductResponse(payload);

  return result.data;
}
