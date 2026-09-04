"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface MarketData {
  timestamp: string;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function LiveMarket() {

  const [data, setData] = useState<MarketData[]>([]);

  useEffect(() => {

    const channel = supabase
      .channel("market-data-live")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "market_data",
        },
        (payload) => {

          console.log("Market update:", payload);

          const newRow = payload.new as MarketData;

          setData((current) => {

            const filtered = current.filter(
              (item) =>
                !(
                  item.symbol === newRow.symbol &&
                  item.timestamp === newRow.timestamp
                )
            );

            return [
              newRow,
              ...filtered,
            ].slice(0, 100);

          });

        }
      )

      .subscribe();

    return () => {

      supabase.removeChannel(channel);

    };

  }, []);

  return (

    <div>

      {data.map((item) => (

        <div
          key={`${item.symbol}-${item.timestamp}`}
          className="border-b border-slate-800 p-3"
        >

          <strong>
            {item.symbol}
          </strong>

          <span className="ml-4">
            ${item.close}
          </span>

        </div>

      ))}

    </div>

  );
}