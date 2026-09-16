-- Friendly Ride — Reserve a Ride account schema, v2
-- Run this once in the Supabase SQL Editor (after supabase-schema.sql).
--
-- What this fixes: signUp() now sends first name, last name, phone and an
-- optional address as auth "user metadata" at signup time. That metadata
-- lands on auth.users immediately — before the user has even clicked the
-- email confirmation link, and independent of whether a session exists.
-- This trigger copies it into public.profiles / public.saved_addresses at
-- the moment the account row is created, so the account is never "empty":
-- no dependency on the user completing a full booking afterward, and no
-- dependency on Row Level Security seeing an authenticated session (the
-- function runs as its owner via `security definer`, which is what lets a
-- trigger on auth.users — a schema the app itself has no direct access
-- to — write into the public schema on the user's behalf).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do update set
    first_name = coalesce(excluded.first_name, public.profiles.first_name),
    last_name  = coalesce(excluded.last_name, public.profiles.last_name),
    phone      = coalesce(excluded.phone, public.profiles.phone);

  if coalesce(new.raw_user_meta_data ->> 'address', '') <> '' then
    insert into public.saved_addresses (user_id, label, address)
    values (new.id, 'Home', new.raw_user_meta_data ->> 'address');
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
