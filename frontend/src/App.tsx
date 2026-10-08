import { useState } from "react";
import { SymbolForm } from "./components/SymbolForm";
import { DailySummaryChart } from "./components/DailySummaryChart";
import { DailySummaryTable } from "./components/DailySummaryTable";
import { fetchDailySummary } from "./api/stockApi";
import type { DailySummary } from "./types";
import "./App.css";

function App() {
  const [data, setData] = useState<DailySummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(symbol: string) {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const summaries = await fetchDailySummary(symbol);
      setData(summaries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>Stock Intraday Dashboard</h1>
      <SymbolForm onSubmit={handleSearch} disabled={loading} />

      {loading && <div className="status status--loading">Loading...</div>}
      {error && <div className="status status--error">{error}</div>}

      {data && <DailySummaryChart data={data} />}
      {data && <DailySummaryTable data={data} />}
    </div>
  );
}

export default App;
