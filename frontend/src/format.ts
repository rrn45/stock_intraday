import type { DailySummary } from "./types";

export function formatPrice(value: number): string {
  return value.toFixed(4);
}

export function formatVolume(value: number): string {
  return value.toLocaleString("en-US");
}

export function getYearLabel(data: DailySummary[]): string {
  const years = Array.from(new Set(data.map((d) => d.day.slice(0, 4)))).sort();
  return years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years[0];
}
