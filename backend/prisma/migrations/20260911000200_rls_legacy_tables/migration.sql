-- The init migration already enables RLS and revokes anon/authenticated on
-- every KiberEduAz table. It did NOT cover the seven leftover tables from the
-- unrelated tourism project that shares this Supabase instance, nor Prisma's
-- own migration bookkeeping table. If the Data API (PostgREST) is enabled,
-- anything in `public` without RLS is reachable with the publishable key,
-- which is public by design.
--
-- Default-deny: RLS on, no policies, grants revoked. The backend connects as
-- the table owner / postgres role, which bypasses RLS, so the API is
-- unaffected.
--
-- The legacy tables are NOT dropped here. Dropping them is a separate,
-- operator-run decision (prisma/manual/drop_legacy_tables.sql) that should
-- follow a backup.
do $$
declare
  target text;
begin
  foreach target in array array[
    -- Legacy tourism project, quoted CamelCase names.
    'User', 'TouristProfile', 'EntrepreneurProfile', 'Place', 'Booking',
    'Review', 'CoinTransaction',
    -- Prisma migration history.
    '_prisma_migrations'
  ]
  loop
    -- Skip anything already dropped, so this migration stays replayable.
    if to_regclass(format('public.%I', target)) is not null then
      execute format('alter table public.%I enable row level security', target);
      execute format('revoke all on public.%I from anon, authenticated', target);
    end if;
  end loop;
end;
$$;

-- Re-assert the same default-deny over every remaining public table, so a
-- table added outside these migrations cannot silently stay open.
do $$
declare
  target text;
begin
  for target in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and not c.relrowsecurity
  loop
    execute format('alter table public.%I enable row level security', target);
    execute format('revoke all on public.%I from anon, authenticated', target);
  end loop;
end;
$$;
