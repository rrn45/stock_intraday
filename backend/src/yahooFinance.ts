import { SymbolNotFoundError, UpstreamError } from "./errors";
import type { YahooChartResponse, YahooChartResult } from "./types/yahooChart.types";

const YAHOO_CHART_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

export async function fetchIntradayChart(symbol: string): Promise<YahooChartResult> {
  const url = `${YAHOO_CHART_BASE_URL}/${symbol}?interval=15m&range=1mo`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
  } catch (err) {
    throw new UpstreamError(
      err instanceof Error ? err.message : "network request failed"
    );
  }

  const body = (await response.json()) as YahooChartResponse;

  // Checked independently: chart.error and a non-2xx status are two separate
  // signals from Yahoo that don't always arrive together.
  if (body.chart.error) {
    throw new SymbolNotFoundError(symbol, body.chart.error.description);
  }

  if (!response.ok) {
    throw new UpstreamError(`HTTP ${response.status}`);
  }

  const result = body.chart.result?.[0];
  if (!result) {
    throw new SymbolNotFoundError(symbol, "no data returned");
  }

  return result;
}
