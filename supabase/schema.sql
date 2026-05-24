-- Sapporo Life OS MVP v0.1
-- Initial Supabase PostgreSQL schema.
-- Auth is intentionally deferred. The first version is a private cockpit.

create extension if not exists pgcrypto;

create table if not exists values_core (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  horizon text check (horizon in ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'long_term')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  detail text,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done', 'deferred', 'cancelled')),
  priority integer check (priority between 1 and 5),
  energy_level integer check (energy_level between 1 and 5),
  north_star_alignment_score integer check (north_star_alignment_score between 1 and 5),
  linked_goal_id uuid references goals(id) on delete set null,
  linked_value_id uuid references values_core(id) on delete set null,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists reflections (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  mood text,
  energy integer check (energy between 1 and 5),
  gratitude text,
  friction text,
  reflection_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists learning_logs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  source text,
  can_be_content boolean not null default false,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  alignment_score integer check (alignment_score between 1 and 100),
  weekly_theme text,
  best_aligned_action text,
  wasted_area text,
  evidence_count integer not null default 0,
  learning_to_content_count integer not null default 0,
  next_one_improvement text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_status_idx on tasks(status);
create index if not exists tasks_due_date_idx on tasks(due_date);
create index if not exists calendar_events_start_at_idx on calendar_events(start_at);
create index if not exists calendar_events_event_type_idx on calendar_events(event_type);
create index if not exists reflections_date_idx on reflections(reflection_date);
create index if not exists reviews_period_idx on reviews(period_start, period_end);

-- MVP private cockpit policy.
-- Auth is intentionally deferred in v0.1, so the anon role can read/write the
-- core personal operating tables. Replace these broad policies with user-scoped
-- Supabase Auth policies before any public deployment.
grant usage on schema public to anon, authenticated;
grant select, insert, update on values_core, goals, tasks, calendar_events, reflections, learning_logs, reviews to anon, authenticated;

alter table values_core enable row level security;
alter table goals enable row level security;
alter table tasks enable row level security;
alter table calendar_events enable row level security;
alter table reflections enable row level security;
alter table learning_logs enable row level security;
alter table reviews enable row level security;

drop policy if exists "mvp_values_core_select" on values_core;
create policy "mvp_values_core_select"
  on values_core for select
  to anon, authenticated
  using (true);

drop policy if exists "mvp_values_core_insert" on values_core;
create policy "mvp_values_core_insert"
  on values_core for insert
  to anon, authenticated
  with check (true);

drop policy if exists "mvp_values_core_update" on values_core;
create policy "mvp_values_core_update"
  on values_core for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "mvp_goals_select" on goals;
create policy "mvp_goals_select"
  on goals for select
  to anon, authenticated
  using (true);

drop policy if exists "mvp_goals_insert" on goals;
create policy "mvp_goals_insert"
  on goals for insert
  to anon, authenticated
  with check (true);

drop policy if exists "mvp_goals_update" on goals;
create policy "mvp_goals_update"
  on goals for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "mvp_tasks_select" on tasks;
create policy "mvp_tasks_select"
  on tasks for select
  to anon, authenticated
  using (true);

drop policy if exists "mvp_tasks_insert" on tasks;
create policy "mvp_tasks_insert"
  on tasks for insert
  to anon, authenticated
  with check (true);

drop policy if exists "mvp_tasks_update" on tasks;
create policy "mvp_tasks_update"
  on tasks for update
  to anon, authenticated
  using (true)
  with check (true);

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

drop policy if exists "mvp_reflections_select" on reflections;
create policy "mvp_reflections_select"
  on reflections for select
  to anon, authenticated
  using (true);

drop policy if exists "mvp_reflections_insert" on reflections;
create policy "mvp_reflections_insert"
  on reflections for insert
  to anon, authenticated
  with check (true);

drop policy if exists "mvp_reflections_update" on reflections;
create policy "mvp_reflections_update"
  on reflections for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "mvp_learning_logs_select" on learning_logs;
create policy "mvp_learning_logs_select"
  on learning_logs for select
  to anon, authenticated
  using (true);

drop policy if exists "mvp_learning_logs_insert" on learning_logs;
create policy "mvp_learning_logs_insert"
  on learning_logs for insert
  to anon, authenticated
  with check (true);

drop policy if exists "mvp_learning_logs_update" on learning_logs;
create policy "mvp_learning_logs_update"
  on learning_logs for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "mvp_reviews_select" on reviews;
create policy "mvp_reviews_select"
  on reviews for select
  to anon, authenticated
  using (true);

drop policy if exists "mvp_reviews_insert" on reviews;
create policy "mvp_reviews_insert"
  on reviews for insert
  to anon, authenticated
  with check (true);

drop policy if exists "mvp_reviews_update" on reviews;
create policy "mvp_reviews_update"
  on reviews for update
  to anon, authenticated
  using (true)
  with check (true);
