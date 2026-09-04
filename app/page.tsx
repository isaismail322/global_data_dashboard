import { getLatestMarketData } from "@/lib/market";
import MarketChart from "@/components/dashboard/MarketChart";

export default async function Home() {
  const marketData = await getLatestMarketData();

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <header className="border-b border-slate-800 px-8 py-5">
        <h1 className="text-2xl font-bold">
          Global Market Dashboard
        </h1>

        <p className="text-sm text-slate-400">
          Live global market intelligence
        </p>
      </header>

      <section className="p-8">

        <h2 className="mb-4 text-xl font-semibold">
          Market Overview
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">

          {marketData.map((market) => (
            <div
              key={`${market.symbol}-${market.timestamp}`}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="text-sm text-slate-400">
                {market.symbol}
              </div>

              <div className="mt-2 text-2xl font-bold">
                ${market.close.toFixed(2)}
              </div>

              <div className="mt-2 text-sm text-slate-400">
                Volume: {market.volume.toLocaleString()}
              </div>
            </div>
          ))}

        </div>

      </section>

    </main>
  );
}