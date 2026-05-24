-- Sapporo Life OS Phase 5.5/5.6
-- Add calendar_events for manual calendar planning and Review time-use intelligence.

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean not null default false,
  event_type text not null default 'work' check (
    event_type in ('work', 'ai-ax', 'learning', 'health', 'finance', 'family', 'recovery', 'content', 'admin')
  ),
  intent text,
  linked_task_id uuid references tasks(id) on delete set null,
  linked_value text,
  north_star_aligned boolean not null default true,
  energy_cost text not null default 'medium' check (energy_cost in ('low', 'medium', 'high')),
  visibility text not null default 'private' check (visibility in ('private', 'candidate', 'public')),
  source_kind text not null default 'manual' check (source_kind in ('manual', 'task', 'wiki-seed', 'external-later')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index if not exists calendar_events_start_at_idx on calendar_events(start_at);
create index if not exists calendar_events_event_type_idx on calendar_events(event_type);

grant select, insert, update on calendar_events to anon, authenticated;

alter table calendar_events enable row level security;

drop policy if exists "mvp_calendar_events_select" on calendar_events;
create policy "mvp_calendar_events_select"
  on calendar_events for select
  to anon, authenticated
  using (true);

drop policy if exists "mvp_calendar_events_insert" on calendar_events;
create policy "mvp_calendar_events_insert"
  on calendar_events for insert
  to anon, authenticated
  with check (true);

drop policy if exists "mvp_calendar_events_update" on calendar_events;
create policy "mvp_calendar_events_update"
  on calendar_events for update
  to anon, authenticated
  using (true)
  with check (true);
