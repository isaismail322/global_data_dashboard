import { supabase } from "./supabase";
import { GlobalEvent } from "@/types/events";

export async function getLatestEvents(): Promise<GlobalEvent[]> {

  const { data, error } = await supabase
    .from("global_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Events query failed:", error);
    throw error;
  }

  return data ?? [];
}
