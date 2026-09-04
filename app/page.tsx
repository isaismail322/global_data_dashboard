import { getLatestMarketData } from "@/lib/market";
import { getLatestNews } from "@/lib/news";
import { getLatestEvents } from "@/lib/events";
import Dashboard from "@/components/dashboard/Dashboard";

export default async function Home() {
  const watchSymbols = ["AMZN", "GOOG", "AAPL", "MSFT", "NVDA"];

  const [marketData, newsData, events] = await Promise.all([
    getLatestMarketData(watchSymbols),
    getLatestNews(20),
    getLatestEvents(),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <header className="border-b border-slate-800 px-8 py-5">
        <h1 className="text-2xl font-bold">Global Market Dashboard</h1>
        <p className="text-sm text-slate-400">Live global market intelligence</p>
      </header>

      <Dashboard initialMarket={marketData} initialNews={newsData} initialEvents={events} watchSymbols={watchSymbols} />

    </main>
  );
}
