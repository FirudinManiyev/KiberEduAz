-- Which of the 2026-09 security migrations are actually applied?
--
-- Read-only. Paste into Supabase -> SQL Editor and run. One row per thing the
-- new code needs; `missing` = true means the API will fail at runtime.
--
-- The important one is profiles.deleted_at: JwtAuthGuard loads the whole
-- profile row on EVERY authenticated request, so if that column is absent the
-- entire API returns 500 - not just the deletion feature.

select
  item,
  case when present then 'OK' else 'MISSING' end as status,
  not present                                    as missing,
  breaks_what
from (
  values
    (
      '1. learning_modules.created_by_id  (20260911000000)',
      to_regclass('public.learning_modules') is not null and exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'learning_modules'
          and column_name = 'created_by_id'
      ),
      'Path/module ownership checks -> 500 on teacher curriculum edits'
    ),
    (
      '2. answer_attempts partial unique index  (20260911000100)',
      exists (
        select 1 from pg_indexes
        where schemaname = 'public'
          and indexname = 'answer_attempts_profile_question_correct_key'
      ),
      'Points race stays open (no 500; just the F-04 bug)'
    ),
    (
      '3. points_ledger ROOM_COMPLETED unique index  (20260911000100)',
      exists (
        select 1 from pg_indexes
        where schemaname = 'public'
          and indexname = 'points_ledger_room_completed_key'
      ),
      'Room bonus can double-pay (no 500)'
    ),
    (
      '4. RLS on the legacy tourism tables  (20260911000200)',
      not exists (
        select 1
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relkind = 'r'
          and not c.relrowsecurity
      ),
      'Legacy tables readable with the public publishable key'
    ),
    (
      '5. profiles.deleted_at  (20260911000300)  <-- BREAKS EVERYTHING',
      exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'profiles'
          and column_name = 'deleted_at'
      ),
      'EVERY authenticated request returns 500'
    ),
    (
      '6. audit_log table  (20260911000400)',
      to_regclass('public.audit_log') is not null,
      'Admin actions fail to record (logged, not fatal)'
    )
) as checks(item, present, breaks_what)
order by item;

-- Has Prisma been baselined at all? If this returns 0 rows, `prisma migrate
-- deploy` has never run against this database and needs `npm run
-- prisma:baseline` from a workstation first (see README, "Prisma
-- migration-lari haqqinda").
select
  coalesce(count(*), 0) as applied_migrations,
  max(finished_at)      as last_applied
from public._prisma_migrations
where to_regclass('public._prisma_migrations') is not null;
