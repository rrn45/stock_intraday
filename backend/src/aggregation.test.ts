import { test } from "node:test";
import assert from "node:assert/strict";
import { getExchangeLocalDayKey, aggregateDailySummaries } from "./aggregation";
import type { YahooChartResult } from "./types/yahooChart.types";

function buildResult(
  timeZone: string,
  bars: {
    timestamp: number;
    low: number | null;
    high: number | null;
    volume: number | null;
  }[]
): YahooChartResult {
  return {
    meta: { symbol: "TEST", exchangeTimezoneName: timeZone },
    timestamp: bars.map((b) => b.timestamp),
    indicators: {
      quote: [
        {
          low: bars.map((b) => b.low),
          high: bars.map((b) => b.high),
          volume: bars.map((b) => b.volume),
        },
      ],
    },
  };
}

test("getExchangeLocalDayKey: winter (EST) timestamp rolls back across UTC midnight to the correct prior local date", () => {
  // 2026-01-16T04:30:00Z = 2026-01-15 23:30 local (EST, UTC-5)
  const ts = Date.UTC(2026, 0, 16, 4, 30, 0) / 1000;
  assert.equal(getExchangeLocalDayKey(ts, "America/New_York"), "2026-01-15");
});

test("getExchangeLocalDayKey: summer (EDT) timestamp resolves correctly, proving the offset isn't hardcoded to winter", () => {
  // 2026-07-16T04:15:00Z = 2026-07-16 00:15 local (EDT, UTC-4)
  // A hardcoded EST (-5) offset here would incorrectly roll this back to July 15.
  const ts = Date.UTC(2026, 6, 16, 4, 15, 0) / 1000;
  assert.equal(getExchangeLocalDayKey(ts, "America/New_York"), "2026-07-16");
});

test("aggregateDailySummaries: groups bars by day and averages low/high, sums volume", () => {
  const dayOne = Date.UTC(2026, 5, 1, 14, 30, 0) / 1000; // 2026-06-01 10:30 EDT
  const dayTwo = Date.UTC(2026, 5, 2, 14, 30, 0) / 1000; // 2026-06-02 10:30 EDT

  const result = buildResult("America/New_York", [
    { timestamp: dayOne, low: 100, high: 110, volume: 1000 },
    { timestamp: dayOne + 900, low: 102, high: 112, volume: 2000 },
    { timestamp: dayTwo, low: 200, high: 210, volume: 3000 },
  ]);

  const summaries = aggregateDailySummaries(result);

  assert.equal(summaries.length, 2);
  assert.deepEqual(summaries[0], {
    day: "2026-06-01",
    lowAverage: 101,
    highAverage: 111,
    volume: 3000,
  });
  assert.deepEqual(summaries[1], {
    day: "2026-06-02",
    lowAverage: 200,
    highAverage: 210,
    volume: 3000,
  });
});

test("aggregateDailySummaries: null low/high values are excluded from the average, not treated as 0", () => {
  const base = Date.UTC(2026, 5, 1, 14, 30, 0) / 1000;

  const result = buildResult("America/New_York", [
    { timestamp: base, low: 100, high: 110, volume: 1000 },
    { timestamp: base + 900, low: null, high: null, volume: 500 },
    { timestamp: base + 1800, low: 102, high: 112, volume: 1500 },
  ]);

  const summaries = aggregateDailySummaries(result);

  assert.equal(summaries.length, 1);
  // average of 100 and 102 only (null bar excluded) -- NOT (100 + 0 + 102) / 3
  assert.equal(summaries[0].lowAverage, 101);
  assert.equal(summaries[0].highAverage, 111);
});

test("aggregateDailySummaries: null volume is treated as 0 in the sum", () => {
  const base = Date.UTC(2026, 5, 1, 14, 30, 0) / 1000;

  const result = buildResult("America/New_York", [
    { timestamp: base, low: 100, high: 110, volume: 1000 },
    { timestamp: base + 900, low: 101, high: 111, volume: null },
  ]);

  const summaries = aggregateDailySummaries(result);

  assert.equal(summaries[0].volume, 1000);
});

test("aggregateDailySummaries: a day with no valid lows is dropped entirely, even if highs are valid", () => {
  const base = Date.UTC(2026, 5, 1, 14, 30, 0) / 1000;

  const result = buildResult("America/New_York", [
    { timestamp: base, low: null, high: 110, volume: 1000 },
    { timestamp: base + 900, low: null, high: 112, volume: 2000 },
  ]);

  assert.deepEqual(aggregateDailySummaries(result), []);
});

test("aggregateDailySummaries: a day with no valid highs is dropped entirely, even if lows are valid", () => {
  const base = Date.UTC(2026, 5, 1, 14, 30, 0) / 1000;

  const result = buildResult("America/New_York", [
    { timestamp: base, low: 100, high: null, volume: 1000 },
    { timestamp: base + 900, low: 102, high: null, volume: 2000 },
  ]);

  assert.deepEqual(aggregateDailySummaries(result), []);
});

test("aggregateDailySummaries: rounds averages to exactly 4 decimal places", () => {
  const base = Date.UTC(2026, 5, 1, 14, 30, 0) / 1000;

  const result = buildResult("America/New_York", [
    { timestamp: base, low: 100.11111, high: 110.99999, volume: 1000 },
    { timestamp: base + 900, low: 100.22222, high: 110.88888, volume: 1000 },
  ]);

  const summaries = aggregateDailySummaries(result);

  assert.equal(summaries[0].lowAverage, 100.1667);
  assert.equal(summaries[0].highAverage, 110.9444);
});

test("aggregateDailySummaries: output days are in ascending chronological order", () => {
  const dayOne = Date.UTC(2026, 5, 1, 14, 30, 0) / 1000;
  const dayTwo = Date.UTC(2026, 5, 2, 14, 30, 0) / 1000;
  const dayThree = Date.UTC(2026, 5, 3, 14, 30, 0) / 1000;

  const result = buildResult("America/New_York", [
    { timestamp: dayOne, low: 1, high: 2, volume: 1 },
    { timestamp: dayTwo, low: 1, high: 2, volume: 1 },
    { timestamp: dayThree, low: 1, high: 2, volume: 1 },
  ]);

  const summaries = aggregateDailySummaries(result);

  assert.deepEqual(
    summaries.map((s) => s.day),
    ["2026-06-01", "2026-06-02", "2026-06-03"]
  );
});

test("aggregateDailySummaries: empty input returns an empty array", () => {
  const result = buildResult("America/New_York", []);
  assert.deepEqual(aggregateDailySummaries(result), []);
});
