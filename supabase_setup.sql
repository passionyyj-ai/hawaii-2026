-- TravelMate AI v19.1 cloud sharing setup
create table if not exists public.travelmate_shared_state (
  share_code text primary key,
  state jsonb not null default '{"custom":[],"edited":{},"deleted":[]}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.travelmate_details (
  share_code text not null,
  schedule_key text not null,
  memo text default '', reservation text default '', phone text default '', url text default '',
  updated_at timestamptz not null default now(),
  primary key (share_code,schedule_key)
);
create table if not exists public.travelmate_attachments (
  id uuid primary key default gen_random_uuid(),
  share_code text not null,
  schedule_key text not null,
  file_name text not null,
  mime_type text default '', file_size bigint default 0,
  storage_path text not null unique,
  created_at timestamptz not null default now()
);
alter table public.travelmate_shared_state enable row level security;
alter table public.travelmate_details enable row level security;
alter table public.travelmate_attachments enable row level security;
drop policy if exists "travelmate shared state anon" on public.travelmate_shared_state;
create policy "travelmate shared state anon" on public.travelmate_shared_state for all to anon using (true) with check (true);
drop policy if exists "travelmate details anon" on public.travelmate_details;
create policy "travelmate details anon" on public.travelmate_details for all to anon using (true) with check (true);
drop policy if exists "travelmate attachments anon" on public.travelmate_attachments;
create policy "travelmate attachments anon" on public.travelmate_attachments for all to anon using (true) with check (true);
insert into storage.buckets (id,name,public) values ('travelmate-files','travelmate-files',true) on conflict (id) do update set public=true;
drop policy if exists "travelmate storage read" on storage.objects;
create policy "travelmate storage read" on storage.objects for select to public using (bucket_id='travelmate-files');
drop policy if exists "travelmate storage write" on storage.objects;
create policy "travelmate storage write" on storage.objects for insert to anon with check (bucket_id='travelmate-files');
drop policy if exists "travelmate storage delete" on storage.objects;
create policy "travelmate storage delete" on storage.objects for delete to anon using (bucket_id='travelmate-files');

-- v20 여행 생성/참가용 메타데이터
create table if not exists public.travelmate_trips (
  trip_code text primary key,
  trip_name text not null,
  created_at timestamptz not null default now()
);
alter table public.travelmate_trips enable row level security;
drop policy if exists "travelmate trips anon" on public.travelmate_trips;
create policy "travelmate trips anon" on public.travelmate_trips
for all to anon using (true) with check (true);
