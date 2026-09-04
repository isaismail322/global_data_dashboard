"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { NewsData } from "@/types/news";

interface Props {
  initialNews: NewsData[];
}

export default function NewsList({ initialNews }: Props) {
  const [news, setNews] = useState<NewsData[]>(initialNews);

  useEffect(() => {
    let mounted = true;
    const channel = supabase
      .channel("public:news_data")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "news_data" },
        (payload) => {
          const record = payload.new as NewsData;
          console.debug("news realtime insert", record);
          if (!mounted) return;
          setNews((prev) => [record, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    // polling fallback: refetch every 15s in case realtime misses events
    const poll = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from<NewsData>("news_data")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(20);
        if (error) {
          console.debug("news polling error", error);
          return;
        }
        if (!mounted || !data) return;
        setNews((prev) => {
          // simple replace if different length or newest id differs
          if (data.length !== prev.length || (data[0] && prev[0] && data[0].id !== prev[0].id)) {
            return data as NewsData[];
          }
          return prev;
        });
      } catch (e) {
        console.debug("news polling failed", e);
      }
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 h-full flex flex-col">
      <h3 className="mb-3 text-lg font-semibold">Latest News</h3>

      <ul className="space-y-3 overflow-auto flex-1">
        {news.map((n) => (
          <li key={n.id} className="rounded-md border border-slate-800 bg-slate-950 p-3">
            <a href={n.url ?? "#"} target="_blank" rel="noreferrer" className="text-sm font-medium">
              {n.title}
            </a>

            {/* Only show additional fields if present (id and title are always present) */}
            {n.source && (
              <div className="mt-1 text-xs text-slate-400">Source: {n.source}</div>
            )}

            {n.published_at && (
              <div className="mt-1 text-xs text-slate-400">Published: {new Date(n.published_at).toLocaleString()}</div>
            )}

            {/* other fields (description, country, language, category, sentiment) intentionally not shown until available */}
          </li>
        ))}
      </ul>
    </div>
  );
}
