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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        <div className="lg:col-span-2">
          <SymbolSidebar initial={initialMarket} symbols={watchSymbols} selected={selected} onSelect={setSelected} />
        </div>

        <div className="lg:col-span-6">
          <MarketChart symbol={selected} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <NewsList initialNews={initialNews} />
          <EventsList initialEvents={initialEvents} />
        </div>

      </div>

    </div>
  );
}
