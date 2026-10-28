import { redirect } from "next/navigation";
import { getApiSessionHeaders } from "./getApiSessionHeaders.server";
import { parseProductStockResponse } from "./parseProductStockResponse";

export async function getProductStock(productId: number): Promise<number> {
  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    throw new Error("STOCKPILOT_API_URL is not configured.");
  }

  const headers = await getApiSessionHeaders();

  const response = await fetch(
    new URL(`/api/products/${productId}/stock`, apiUrl),
    {
      cache: "no-store",
      redirect: "error",
      headers,
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new Error("Unable to fetch product stock.");
  }

  const payload: unknown = await response.json();
  const result = parseProductStockResponse(payload);

  if (result.data.productId !== productId) {
    throw new Error("Product stock identifier does not match.");
  }

  return result.data.quantity;
}
