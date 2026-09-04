import { supabase } from "./supabase";
import { MarketData } from "@/types/market";

export async function getLatestMarketData(symbols: string[] = []): Promise<MarketData[]> {
  let query = supabase.from("market_data").select("*").order("timestamp", { ascending: false }).limit(100);

  if (symbols.length) {
    query = query.in("symbol", symbols);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Market query failed:", error);
    throw new Error(error.message);
  }

  // keep latest per symbol
  const rows = (data as MarketData[]) || [];
  const map: Record<string, MarketData> = {};
  for (const r of rows) {
    if (!map[r.symbol]) map[r.symbol] = r;
  }

  return Object.values(map);
}

export async function getHistoricalMarketData(symbol: string, limit = 500): Promise<MarketData[]> {
  const { data, error } = await supabase
    .from("market_data")
    .select("*")
    .eq("symbol", symbol)
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Historical market query failed:", error);
    throw error;
  }

  const rows = (data as MarketData[]) || [];
  // return in ascending order for charting
  return rows.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
