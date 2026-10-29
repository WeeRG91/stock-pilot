import { redirect } from "next/navigation";
import { getApiSessionHeaders } from "./getApiSessionHeaders.server";
import { parseInventoryExportResponse } from "./parseInventoryExportResponse";
import type { InventoryExportResponse } from "@/types/inventoryExport";

export async function getInventoryExports(): Promise<
  InventoryExportResponse["data"][]
> {
  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    throw new Error("STOCKPILOT_API_URL is not configured.");
  }

  const headers = await getApiSessionHeaders();

  const response = await fetch(
    new URL("/api/inventory-exports", apiUrl),
    {
      headers,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new Error("Unable to fetch inventory exports.");
  }

  const payload: unknown = await response.json();

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("data" in payload) ||
    !Array.isArray(payload.data)
  ) {
    throw new Error("Invalid inventory exports response.");
  }

  return payload.data.map(
    (item: unknown) => parseInventoryExportResponse({ data: item }).data,
  );
}