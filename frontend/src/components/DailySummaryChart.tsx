import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailySummary } from "../types";
import { formatPrice, getYearLabel } from "../format";

interface DailySummaryChartProps {
  data: DailySummary[];
}

// Validated categorical palette, slots 1 and 2 (light mode) -- see dataviz skill.
const LOW_COLOR = "#2a78d6";
const HIGH_COLOR = "#eb6834";
const MUTED_INK = "#898781";
const GRIDLINE = "#e1e0d9";

export function DailySummaryChart({ data }: DailySummaryChartProps) {
  if (data.length === 0) {
    return null;
  }

  const yearLabel = getYearLabel(data);

  return (
    <section className="chart-section">
      <h2>Price Trend — {yearLabel}</h2>
      <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 32, right: 56, left: 56, bottom: 24 }}>
        <CartesianGrid stroke={GRIDLINE} vertical={false} />
        <XAxis
          dataKey="day"
          interval={1}
          tickFormatter={(day) => day.slice(5)}
          stroke={MUTED_INK}
          tick={{ fill: MUTED_INK }}
          label={{ value: "Date", position: "insideBottom", offset: -20, fill: MUTED_INK }}
        />
        <YAxis
          domain={["dataMin - 10", "dataMax + 10"]}
          stroke={MUTED_INK}
          tick={{ fill: MUTED_INK }}
          label={{ value: "Price", angle: -90, position: "insideLeft", fill: MUTED_INK, offset: -40}}
        />
        <Tooltip
          formatter={(value) => formatPrice(Number(value))}
          cursor={{ stroke: MUTED_INK }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: "30px" }}
        />
        <Line
          type="monotone"
          dataKey="lowAverage"
          name="Low Average"
          stroke={LOW_COLOR}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="highAverage"
          name="High Average"
          stroke={HIGH_COLOR}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
