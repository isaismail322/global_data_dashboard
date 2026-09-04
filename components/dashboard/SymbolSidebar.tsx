"use client";

import React, { useEffect, useState } from "react";
import { MarketData } from "@/types/market";
import { supabase } from "@/lib/supabase";

interface Props {
  initial: MarketData[];
  symbols: string[];
  selected?: string;
  onSelect: (symbol: string) => void;
}

export default function SymbolSidebar({ initial, symbols, selected, onSelect }: Props) {
  const [map, setMap] = useState<Record<string, MarketData>>(() => {
    const m: Record<string, MarketData> = {};
    initial.forEach((d) => (m[d.symbol] = d));
    // ensure all watch symbols exist
    symbols.forEach((s) => {
      if (!m[s]) m[s] = { symbol: s, timestamp: new Date().toISOString(), open: 0, high: 0, low: 0, close: 0, volume: 0 };
    });
    return m;
  });

  useEffect(() => {
    const quoted = symbols.map((s) => `'${s}'`).join(",");
    const channel = supabase
      .channel("public:market_sidebar")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "market_data", filter: `symbol=in.(${quoted})` },
        (payload) => {
          const record = payload.new as MarketData | null;
          if (!record) return;
          setMap((prev) => ({ ...prev, [record.symbol]: record }));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [symbols]);

  const rows = Object.values(map);

  return (
    <aside className="w-full h-full rounded-xl border border-slate-800 bg-slate-900 p-4 flex flex-col">
      <h4 className="mb-3 text-sm font-semibold">Watchlist</h4>

      <div className="overflow-auto flex-1">
        <ul className="space-y-2">
          {symbols.map((s) => {
            const m = map[s];
            const price = m?.close ?? 0;
            return (
              <li key={s}>
                <button
                  onClick={() => onSelect(s)}
                  className={`w-full text-left rounded-md p-2 ${selected === s ? "bg-slate-800" : "bg-slate-950"} border border-slate-800`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{s}</div>
                    <div className="text-sm font-semibold">${price.toFixed(2)}</div>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{new Date(m?.timestamp ?? Date.now()).toLocaleTimeString()}</div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
