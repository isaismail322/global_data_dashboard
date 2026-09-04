"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MarketData } from "@/types/market";

interface Props {
  initialData: MarketData[];
  symbols: string[];
}

export default function RealtimeMarketGrid({ initialData, symbols }: Props) {
  const [map, setMap] = useState<Record<string, MarketData>>(() => {
    const m: Record<string, MarketData> = {};
    initialData.forEach((d) => (m[d.symbol] = d));
    return m;
  });

  useEffect(() => {
    // Subscribe to postgres changes for market_data for our symbols
    const quoted = symbols.map((s) => `'${s}'`).join(",");
    const channel = supabase
      .channel("public:market_data")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "market_data", filter: `symbol=in.(${quoted})` },
        (payload) => {
          const record = payload.new as MarketData | null;
          if (!record) return;

          setMap((prev) => {
            const prevRecord = prev[record.symbol];
            if (prevRecord && prevRecord.timestamp >= record.timestamp) return prev;
            return { ...prev, [record.symbol]: record };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [symbols]);

  const rows = useMemo(() => Object.values(map), [map]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="mb-4 text-lg font-semibold">Markets</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((m) => (
          <div key={m.symbol} className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">{m.symbol}</div>
              <div className="text-xs text-slate-500">{new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>

            <div className="mt-2 text-2xl font-bold">${m.close.toFixed(2)}</div>

            <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
              <div>Vol: {m.volume?.toLocaleString() ?? "-"}</div>
              <div>
                <span className="mr-2 text-xs text-slate-500">O</span>${m.open.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
