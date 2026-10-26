import { StockMovement } from "@/types/stockMovement";
import { parseMovementHistoryResponse } from "./parseMovementHistoryResponse";

export async function getProductMovements(
  productId: number,
): Promise<StockMovement[]> {
  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    throw new Error("STOCKPILOT_API_URL is not configured.");
  }

  const response = await fetch(
    new URL(`/api/products/${productId}/movements`, apiUrl),
    {
      cache: "no-store",
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error("Unable to fetch movement history.");
  }

  const payload: unknown = await response.json();
  const result = parseMovementHistoryResponse(payload);

  if (result.data.some((movement) => movement.productId !== productId)) {
    throw new Error("Movement history contains a different product.");
  }

  return result.data;
}
