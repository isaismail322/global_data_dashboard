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
  const [modalEvent, setModalEvent] = useState<GlobalEvent | null>(null);

  useEffect(() => {
    let mounted = true;
    const channel = supabase
      .channel("public:global_events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "global_events" },
        (payload) => {
          const kind = payload.event;
          const record = payload.new as GlobalEvent | null;
          console.debug("global_events realtime", kind, record ?? payload.old);

          if (!mounted) return;

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

    // polling fallback: refetch every 20s in case realtime missed changes
    const poll = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from<GlobalEvent>("global_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) {
          console.debug("events polling error", error);
          return;
        }
        if (!mounted || !data) return;
        setEvents((prev) => {
          if (data.length !== prev.length || (data[0] && prev[0] && data[0].event_id !== prev[0].event_id)) {
            return data as GlobalEvent[];
          }
          return prev;
        });
      } catch (e) {
        console.debug("events polling failed", e);
      }
    }, 20000);

    return () => {
      mounted = false;
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 h-full flex flex-col">
      <h3 className="mb-3 text-lg font-semibold">Global Events</h3>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 h-full">

        <div className="h-full overflow-auto">
          <ul className="space-y-3">
            {events.map((e) => (
              <li
                key={e.event_id}
                onMouseEnter={() => setHighlighted(e.event_id)}
                onMouseLeave={() => setHighlighted(null)}
                onClick={() => setModalEvent(e)}
                className="rounded-md border border-slate-800 bg-slate-950 p-3 cursor-pointer"
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

        <div className="h-full">
          <EventsMap events={events as any} highlightedEventId={highlighted} />
        </div>

      </div>

      {modalEvent && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 z-[100000]" onClick={() => setModalEvent(null)} />
          <div className="relative z-[100001] max-w-3xl w-full max-h-[80vh] overflow-auto rounded-lg bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-start justify-between">
              <h4 className="text-xl font-semibold">{modalEvent.event_name ?? modalEvent.name}</h4>
              <button className="text-slate-400" onClick={() => setModalEvent(null)}>Close</button>
            </div>

            <div className="mt-3 text-sm text-slate-300">
              <div className="mb-3"><strong>Alert:</strong> {modalEvent.alert_level ?? 'N/A'}</div>
              <div className="mb-3"><strong>Country:</strong> {modalEvent.country ?? modalEvent.iso3 ?? 'N/A'}</div>
              <div className="mb-3"><strong>From:</strong> {modalEvent.from_date ? new Date(modalEvent.from_date).toLocaleString() : 'N/A'}</div>
              <div className="mb-3"><strong>To:</strong> {modalEvent.to_date ? new Date(modalEvent.to_date).toLocaleString() : 'N/A'}</div>
              <div className="mb-3"><strong>Severity:</strong> {modalEvent.severity_text ?? modalEvent.severity ?? 'N/A'}</div>
              <div className="mb-4"><strong>Source:</strong> {modalEvent.source ?? 'N/A'}</div>

              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: modalEvent.html_description ?? modalEvent.description ?? '<em>No description</em>' }} />

              {modalEvent.urls && (
                <div className="mt-4 space-y-2">
                  {Object.entries(modalEvent.urls).map(([k, v]) => (
                    <div key={k}><a href={String(v)} target="_blank" rel="noreferrer" className="text-sky-400 underline">{k}</a></div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
