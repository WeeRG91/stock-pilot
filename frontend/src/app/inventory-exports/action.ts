"use server";

import { getApiMutationHeaders } from "@/lib/getApiMutationHeaders.server";
import { redirect, unstable_rethrow } from "next/navigation";

export async function requestInventoryExport(): Promise<{
  message: string;
}> {
  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    return { message: "Inventory exports are currently unavailable." };
  }

  let exportId: number;

  try {
    const headers = await getApiMutationHeaders();

    const response = await fetch(
      new URL("/api/inventory-exports", apiUrl),
      {
        method: "POST",
        cache: "no-store",
        redirect: "error",
        headers,
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (response.status === 401) {
      redirect("/login");
    }

    if (response.status === 403) {
      return {
        message: "Request verification failed. Please try again.",
      };
    }

    if (response.status !== 202) {
      throw new Error("Unexpected export response.");
    }

    const payload: unknown = await response.json();

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("data" in payload) ||
      typeof payload.data !== "object" ||
      payload.data === null ||
      !("id" in payload.data) ||
      typeof payload.data.id !== "number" ||
      !Number.isSafeInteger(payload.data.id) ||
      payload.data.id <= 0
    ) {
      throw new Error("Invalid export response.");
    }

    exportId = payload.data.id;
  } catch (error) {
    unstable_rethrow(error);

    return {
      message:
        "The export request could not be confirmed. It may have been queued.",
    };
  }

  redirect(`/inventory-exports/${exportId}`);
}