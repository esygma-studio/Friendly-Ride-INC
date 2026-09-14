-- Friendly Ride — Reserve a Ride account schema
-- Run this once in the Supabase SQL Editor for the new project.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,        -- e.g. "Home", "Office"
  address text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.saved_addresses enable row level security;

create policy "profiles: user reads own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: user inserts own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles: user updates own" on public.profiles
  for update using (auth.uid() = id);

create policy "saved_addresses: user reads own" on public.saved_addresses
  for select using (auth.uid() = user_id);
create policy "saved_addresses: user inserts own" on public.saved_addresses
  for insert with check (auth.uid() = user_id);
create policy "saved_addresses: user updates own" on public.saved_addresses
  for update using (auth.uid() = user_id);
create policy "saved_addresses: user deletes own" on public.saved_addresses
  for delete using (auth.uid() = user_id);
