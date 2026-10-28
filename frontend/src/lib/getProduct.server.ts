import type { Product } from "@/types/product";
import { parseProductResponse } from "./parseProductResponse";
import { getApiSessionHeaders } from "./getApiSessionHeaders.server";
import { redirect } from "next/navigation";

export async function getProduct(id: string): Promise<Product | null> {
  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    throw new Error("STOCKPILOT_API_URL is not configured.");
  }

  const headers = await getApiSessionHeaders();

  const response = await fetch(new URL(`/api/products/${id}`, apiUrl), {
    cache: "no-store",
    redirect: "error",
    headers,
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 401) {
    redirect("/login");
  }

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
