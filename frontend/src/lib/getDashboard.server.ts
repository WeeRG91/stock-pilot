import type { DashboardResponse } from "@/types/dashboard";
import { redirect } from "next/navigation";
import { getApiSessionHeaders } from "./getApiSessionHeaders.server";
import { parseDashboardResponse } from "./parseDashboardResponse";

export async function getDashboard(): Promise<DashboardResponse> {
  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    throw new Error("STOCKPILOT_API_URL is not configured.");
  }

  const headers = await getApiSessionHeaders();

  const response = await fetch(new URL("/api/dashboard", apiUrl), {
    cache: "no-store",
    redirect: "error",
    headers,
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new Error("Unable to fetch dashboard.");
  }

  const payload: unknown = await response.json();

  return parseDashboardResponse(payload);
}