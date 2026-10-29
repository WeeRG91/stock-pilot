import type { MovementHistoryResponse } from "@/types/stockMovement";
import { parseMovementHistoryResponse } from "./parseMovementHistoryResponse";
import { getApiSessionHeaders } from "./getApiSessionHeaders.server";
import { redirect } from "next/navigation";

export async function getProductMovements(
  productId: number,
  page = 1,
  limit = 20,
): Promise<MovementHistoryResponse> {
  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    throw new Error("STOCKPILOT_API_URL is not configured.");
  }

  const headers = await getApiSessionHeaders();
  const url = new URL(`/api/products/${productId}/movements`, apiUrl);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url, {
    cache: "no-store",
    redirect: "error",
    headers,
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new Error("Unable to fetch movement history.");
  }

  const payload: unknown = await response.json();
  const result = parseMovementHistoryResponse(payload);

  if (result.data.some((movement) => movement.productId !== productId)) {
    throw new Error("Movement history contains a different product.");
  }

  return result;
}
