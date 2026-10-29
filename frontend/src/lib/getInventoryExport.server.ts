import { redirect } from "next/navigation";
import { getApiSessionHeaders } from "./getApiSessionHeaders.server";
import { parseInventoryExportResponse } from "./parseInventoryExportResponse";
import type { InventoryExportResponse } from "@/types/inventoryExport";

export async function getInventoryExport(
  exportId: number,
): Promise<InventoryExportResponse["data"] | null> {
  if (!Number.isSafeInteger(exportId) || exportId <= 0) {
    throw new Error("Invalid inventory export ID.");
  }

  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    throw new Error("STOCKPILOT_API_URL is not configured.");
  }

  const headers = await getApiSessionHeaders();

  const response = await fetch(
    new URL(`/api/inventory-exports/${exportId}`, apiUrl),
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
    throw new Error("Unable to fetch inventory export.");
  }

  const payload: unknown = await response.json();
  const result = parseInventoryExportResponse(payload);

  if (result.data.id !== exportId) {
    throw new Error("Inventory export identifier does not match.");
  }

  return result.data;
}