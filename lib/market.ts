import { supabase } from "./supabase";
import { MarketData } from "@/types/market";

export async function getLatestMarketData(): Promise<MarketData[]> {
  const { data, error } = await supabase
    .from("market_data")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Market query failed:", error);
    throw new Error(error.message);
  }

  return (data as MarketData[]) || [];
}