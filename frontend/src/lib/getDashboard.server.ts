import { DashboardResponse } from "@/types/dashboard";
import { parseDashboardResponse } from "./parseDashboardResponse";

export async function getDashboard(): Promise<DashboardResponse> {
  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    throw new Error("STOCKPILOT_API_URL is not configured.");
  }

  const response = await fetch(new URL("/api/dashboard", apiUrl), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to fetch dashboard.");
  }

  const payload: unknown = await response.json();

  return parseDashboardResponse(payload);
}
