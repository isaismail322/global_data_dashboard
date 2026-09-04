"use client";

import React, { useEffect, useRef, useState } from "react";
import { getHistoricalMarketData } from "@/lib/market";
import { supabase } from "@/lib/supabase";
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
  symbol: string;
}

export default function MarketChart({ symbol }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any | null>(null);
  const seriesRef = useRef<any>(null);
  const channelRef = useRef<any>(null);
  const [fallbackData, setFallbackData] = useState<any[] | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      // dynamically import lightweight-charts only on client at runtime
      try {
        const rows = await getHistoricalMarketData(symbol, 500);

        const chartData = rows.map((r) => ({
          time: Math.floor(new Date(r.timestamp).getTime() / 1000),
          open: r.open,
          high: r.high,
          low: r.low,
          close: r.close,
        }));

        if (!mounted) return;

        // try to load lightweight-charts dynamically
        let lwc: any = null;
        try {
          lwc = await import("lightweight-charts");
        } catch (err) {
          // fallback to a simple line chart
          console.warn("lightweight-charts not available, falling back to line chart", err);
          setFallbackData(rows.map((r) => ({ timestamp: r.timestamp, close: r.close })));
          setUseFallback(true);
          return;
        }

        if (!ref.current) return;

        chartRef.current = lwc.createChart(ref.current, {
          width: ref.current.clientWidth,
          height: 400,
          layout: { backgroundColor: "#0f1724", textColor: "#d1d5db" },
          grid: { vertLines: { color: "#374151" }, horzLines: { color: "#374151" } },
        });

        seriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: "#16a34a",
          downColor: "#ef4444",
          wickUpColor: "#16a34a",
          wickDownColor: "#ef4444",
        });

        seriesRef.current.setData(chartData);

        // subscribe realtime for this symbol
        if (channelRef.current) supabase.removeChannel(channelRef.current);
        const channel = supabase
          .channel(`public:market_data:${symbol}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "market_data", filter: `symbol=eq.${symbol}` }, (payload) => {
            const record = payload.new;
            if (!record) return;
            const p: any = {
              time: Math.floor(new Date(record.timestamp).getTime() / 1000),
              open: record.open,
              high: record.high,
              low: record.low,
              close: record.close,
            };
            try {
              seriesRef.current.update(p);
            } catch (e) {
              // ignore
            }
          })
          .subscribe();

        channelRef.current = channel;

        const handleResize = () => {
          if (!ref.current || !chartRef.current) return;
          chartRef.current.applyOptions({ width: ref.current.clientWidth });
        };
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      } catch (e) {
        console.error("Failed to initialize chart", e);
        setUseFallback(true);
      }
    }

    init();

    return () => {
      mounted = false;
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (chartRef.current) chartRef.current.remove && chartRef.current.remove();
    };
  }, [symbol]);

  if (useFallback) {
    const rows = fallbackData ?? [];
    // normalize and sort
    const plotData = rows
      .map((r: any) => ({
        timestamp: new Date(r.timestamp).toISOString(),
        label: new Date(r.timestamp).toLocaleString(),
        close: Number(r.close ?? 0),
      }))
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const closes = plotData.map((d: any) => d.close);
    const min = closes.length ? Math.min(...closes) : 0;
    const max = closes.length ? Math.max(...closes) : 0;
    const padding = (max - min) * 0.1 || Math.max(1, max * 0.05);

    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-2 text-lg font-semibold">{symbol} — Price (fallback)</h2>
        <div className="text-xs text-slate-400 mb-3">Showing {plotData.length} points — install "lightweight-charts" for candlestick view</div>

        <div style={{ width: "100%", height: 400 }}>
          {plotData.length === 0 ? (
            <div className="text-sm text-slate-400">No historical data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={plotData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[min - padding, max + padding]} />
                <Tooltip labelFormatter={(val) => `${val}`} />
                <Line type="monotone" dataKey="close" stroke="#3182bd" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="mb-5 text-lg font-semibold">{symbol} — Candlestick</h2>
      <div ref={ref} style={{ width: "100%", height: 400 }} />
    </div>
  );
}
