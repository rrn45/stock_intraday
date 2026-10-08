import type { DailySummary } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchDailySummary(symbol: string): Promise<DailySummary[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/stocks/${encodeURIComponent(symbol)}/daily-summary`
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}
