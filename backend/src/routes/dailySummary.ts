import { Router } from "express";
import { fetchIntradayChart } from "../yahooFinance";
import { aggregateDailySummaries } from "../aggregation";
import { ValidationError } from "../errors";

const SYMBOL_PATTERN = /^[A-Za-z0-9.-]{1,10}$/;

export const dailySummaryRouter = Router();

dailySummaryRouter.get("/stocks/:symbol/daily-summary", async (req, res) => {
  const rawSymbol = req.params.symbol;

  if (!SYMBOL_PATTERN.test(rawSymbol)) {
    throw new ValidationError(`Invalid symbol format: "${rawSymbol}"`);
  }

  const symbol = rawSymbol.toUpperCase();

  const chartResult = await fetchIntradayChart(symbol);
  const summaries = aggregateDailySummaries(chartResult);

  res.json(summaries);
});
