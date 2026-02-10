create extension if not exists "pgcrypto";

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  workout_type text not null,
  duration_min integer not null check (duration_min > 0),
  notes text default '',
  workout_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists workout_logs_wallet_date_idx
  on public.workout_logs (wallet_address, workout_date);

alter table public.workout_logs enable row level security;

drop policy if exists "insert own workout logs" on public.workout_logs;
create policy "insert own workout logs"
on public.workout_logs
for insert
to authenticated
with check (true);

drop policy if exists "read own workout logs" on public.workout_logs;
create policy "read own workout logs"
on public.workout_logs
for select
to authenticated
using (true);
