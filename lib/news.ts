import { supabase } from "./supabase";
import { NewsData } from "@/types/news";

export async function getLatestNews(limit = 20): Promise<NewsData[]> {
  const { data, error } = await supabase
    .from("news_data")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("News query failed:", error);
    throw error;
  }

  return (data as NewsData[]) ?? [];
}
