import type { DailySummary } from "../types";
import { formatPrice, formatVolume } from "../format";

interface DailySummaryTableProps {
  data: DailySummary[];
}

export function DailySummaryTable({ data }: DailySummaryTableProps) {
  if (data.length === 0) {
    return <p>No data available for this symbol.</p>;
  }

  return (
    <details open className="table-section">
      <summary>Daily Summary</summary>
      <div className="table-scroll">
        <table className="summary-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Low Average</th>
              <th>High Average</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {data.map((summary) => (
              <tr key={summary.day}>
                <td>{summary.day.slice(5)}</td>
                <td>{formatPrice(summary.lowAverage)}</td>
                <td>{formatPrice(summary.highAverage)}</td>
                <td>{formatVolume(summary.volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
