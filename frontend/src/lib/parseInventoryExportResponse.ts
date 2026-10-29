import type { InventoryExportResponse } from "@/types/inventoryExport";

export function parseInventoryExportResponse(
  payload: unknown,
): InventoryExportResponse {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("data" in payload) ||
    typeof payload.data !== "object" ||
    payload.data === null
  ) {
    throw new Error("Invalid inventory export response.");
  }

  const data = payload.data;

  if (
    !("id" in data) ||
    typeof data.id !== "number" ||
    !Number.isSafeInteger(data.id) ||
    data.id <= 0 ||
    !("status" in data) ||
    (data.status !== "pending" &&
      data.status !== "ready" &&
      data.status !== "failed") ||
    !("createdAt" in data) ||
    typeof data.createdAt !== "string" ||
    Number.isNaN(Date.parse(data.createdAt))
  ) {
    throw new Error("Invalid inventory export response.");
  }

  return {
    data: {
      id: data.id,
      status: data.status,
      createdAt: data.createdAt,
    },
  };
}
