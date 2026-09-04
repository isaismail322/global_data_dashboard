export interface GlobalEvent {
  event_id: number;
  episode_id?: number | null;
  event_type?: string | null;
  event_name?: string | null;
  name?: string | null;
  description?: string | null;
  html_description?: string | null;
  icon_url?: string | null;
  country?: string | null;
  iso3?: string | null;
  alert_level?: string | null;
  alert_score?: number | null;
  is_current?: boolean | null;
  from_date?: string | null;
  to_date?: string | null;
  date_modified?: string | null;
  source?: string | null;
  severity?: number | null;
  created_at?: string | null;
}
