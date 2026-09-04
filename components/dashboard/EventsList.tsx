"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GlobalEvent } from "@/types/events";
import EventsMap from "./EventsMap";

interface Props {
  initialEvents: GlobalEvent[];
}

export default function EventsList({ initialEvents }: Props) {
  const [events, setEvents] = useState<GlobalEvent[]>(initialEvents);
  const [highlighted, setHighlighted] = useState<number | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("public:global_events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "global_events" },
        (payload) => {
          const kind = payload.event;
          const record = payload.new as GlobalEvent | null;

          if (kind === "INSERT" && record) {
            setEvents((p) => [record, ...p].slice(0, 20));
          }

          if (kind === "UPDATE" && record) {
            setEvents((p) => p.map((e) => (e.event_id === record.event_id ? record : e)));
          }

          if (kind === "DELETE") {
            const oldRecord = payload.old as GlobalEvent;
            setEvents((p) => p.filter((e) => e.event_id !== oldRecord.event_id));
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-3 text-lg font-semibold">Global Events</h3>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        <div>
          <div className="h-[300px] overflow-auto pr-2">
            <ul className="space-y-3">
              {events.map((e) => (
                <li
                  key={e.event_id}
                  onMouseEnter={() => setHighlighted(e.event_id)}
                  onMouseLeave={() => setHighlighted(null)}
                  className="rounded-md border border-slate-800 bg-slate-950 p-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium">{e.event_name ?? e.name}</div>
                      {e.description && (
                        <div className="mt-1 text-xs text-slate-400" style={{ maxHeight: 72, overflow: 'hidden' }}>
                          {e.description}
                        </div>
                      )}

                      <div className="mt-2 text-xs">
                        <span className={`px-2 py-1 rounded ${e.alert_level === 'Red' ? 'bg-red-600 text-white' : e.alert_level === 'Orange' ? 'bg-amber-600 text-white' : 'bg-green-600 text-white'}`}>
                          {e.alert_level ?? 'Unknown'}
                        </span>
                      </div>

                      {e.severity_text && <div className="mt-2 text-sm font-semibold text-slate-200">{e.severity_text}</div>}
                    </div>

                    <div className="text-xs text-slate-400">
                      {e.created_at ? new Date(e.created_at).toLocaleString() : ''}
                    </div>
                  </div>

                  {e.urls?.report && (
                    <div className="mt-2 text-xs">
                      <a href={e.urls.report} target="_blank" rel="noreferrer" className="text-sky-400 underline">Report</a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <EventsMap events={events as any} highlightedEventId={highlighted} />
        </div>

      </div>
    </div>
  );
}
