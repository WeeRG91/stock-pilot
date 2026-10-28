import { redirect } from "next/navigation";
import { getApiSessionHeaders } from "./getApiSessionHeaders.server";
import { parseLowStockThresholdResponse } from "./parseLowStockThresholdResponse";

export async function getLowStockThreshold(
  productId: number,
): Promise<number | null> {
  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    throw new Error("STOCKPILOT_API_URL is not configured.");
  }

  const headers = await getApiSessionHeaders();

  const response = await fetch(
    new URL(`/api/products/${productId}/low-stock-threshold`, apiUrl),
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

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to fetch low-stock threshold.");
  }

  const payload: unknown = await response.json();
  const result = parseLowStockThresholdResponse(payload);

  if (result.data.productId !== productId) {
    throw new Error("Low-stock threshold product identifier does not match.");
  }

  return result.data.threshold;
}
