"use client";

import React from "react";
import MarketChart from "./MarketChart";
import SymbolSidebar from "./SymbolSidebar";
import NewsList from "./NewsList";
import EventsList from "./EventsList";
import { MarketData } from "@/types/market";
import { NewsData } from "@/types/news";
import { GlobalEvent } from "@/types/events";

interface Props {
  initialMarket: MarketData[];
  initialNews: NewsData[];
  initialEvents: GlobalEvent[];
  watchSymbols: string[];
}

export default function Dashboard({ initialMarket, initialNews, initialEvents, watchSymbols }: Props) {
  const [selected, setSelected] = React.useState<string>(watchSymbols[0]);

  return (
    <div className="px-8 py-8">
      {/* Top row: watchlist, chart, latest news - same height */}
      <div className="grid grid-cols-12 gap-6 mb-6">

        <div className="col-span-12 lg:col-span-2 h-96 min-h-0">
          <div className="h-full min-h-0">
            <SymbolSidebar initial={initialMarket} symbols={watchSymbols} selected={selected} onSelect={setSelected} />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 h-96 min-h-0">
          <div className="h-full min-h-0">
            <MarketChart symbol={selected} />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 h-96 min-h-0">
          <div className="h-full min-h-0 flex flex-col gap-6">
            <div className="flex-1 min-h-0">
              <NewsList initialNews={initialNews} />
            </div>
          </div>
        </div>

      </div>

      {/* Bottom: Global Events - larger block */}
      <div className="col-span-12">
        <div className="h-[520px] min-h-0">
          <EventsList initialEvents={initialEvents} />
        </div>
      </div>

    </div>
  );
}
