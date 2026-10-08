export interface YahooChartQuote {
  low: (number | null)[];
  high: (number | null)[];
  volume: (number | null)[];
}

export interface YahooChartMeta {
  symbol: string;
  exchangeTimezoneName: string;
}

export interface YahooChartIndicators {
  quote: YahooChartQuote[];
}

export interface YahooChartResult {
  meta: YahooChartMeta;
  timestamp: number[];
  indicators: YahooChartIndicators;
}

export interface YahooChartError {
  code: string;
  description: string;
}

export interface YahooChartResponse {
  chart: {
    result: YahooChartResult[] | null;
    error: YahooChartError | null;
  };
}
