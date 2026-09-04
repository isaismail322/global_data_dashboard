"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: {
    timestamp: string;
    symbol: string;
    close: number;
  }[];
}

export default function MarketChart({ data }: Props) {
  return (
    <div className="h-[400px] w-full rounded-xl border border-slate-800 bg-slate-900 p-5">

      <h2 className="mb-5 text-lg font-semibold">
        Market Price
      </h2>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="timestamp"
          />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="close"
            strokeWidth={2}
            dot={false}
          />

        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}