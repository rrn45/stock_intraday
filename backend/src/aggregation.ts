import type { YahooChartResult } from "./types/yahooChart.types";
import type { DailySummary } from "./types/dailySummary.types";

/**
 * Converts an epoch-seconds timestamp to its calendar date (YYYY-MM-DD) in
 * the given IANA time zone. Built from formatToParts rather than relying on
 * a locale's string layout, so the output format doesn't depend on
 * Intl's locale-formatting conventions.
 */
export function getExchangeLocalDayKey(
  epochSeconds: number,
  timeZone: string
): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date(epochSeconds * 1000));
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error(
      `Failed to resolve a calendar date for timestamp ${epochSeconds} in zone ${timeZone}`
    );
  }

  return `${year}-${month}-${day}`;
}

function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function roundTo4(value: number): number {
  return Math.round(value * 10000) / 10000;
}

interface DayBucket {
  lows: number[];
  highs: number[];
  volumeSum: number;
}

export function aggregateDailySummaries(result: YahooChartResult): DailySummary[] {
  const { timestamp, meta, indicators } = result;
  const quote = indicators.quote[0];
  const timeZone = meta.exchangeTimezoneName;

  const buckets = new Map<string, DayBucket>();

  for (let i = 0; i < timestamp.length; i++) {
    const day = getExchangeLocalDayKey(timestamp[i], timeZone);

    let bucket = buckets.get(day);
    if (!bucket) {
      bucket = { lows: [], highs: [], volumeSum: 0 };
      buckets.set(day, bucket);
    }

    const low = quote.low[i];
    const high = quote.high[i];
    const volume = quote.volume[i];

    if (low !== null) bucket.lows.push(low);
    if (high !== null) bucket.highs.push(high);
    bucket.volumeSum += volume ?? 0;
  }

  const summaries: DailySummary[] = [];
  for (const [day, bucket] of buckets) {
    if (bucket.lows.length === 0 || bucket.highs.length === 0) {
      continue;
    }
    summaries.push({
      day,
      lowAverage: roundTo4(average(bucket.lows)),
      highAverage: roundTo4(average(bucket.highs)),
      volume: bucket.volumeSum,
    });
  }

  return summaries;
}
