import { supabase } from "./supabase";
import { News } from "@/types/news";

export async function getLatestNews(): Promise<News[]> {

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("News query failed:", error);
    throw error;
  }

  return data ?? [];
}