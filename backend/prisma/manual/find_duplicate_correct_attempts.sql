-- Pre-flight for migration 20260911000100_answer_attempt_idempotency.
--
-- That migration creates a UNIQUE INDEX on (profile_id, question_id) WHERE
-- is_correct, which is what makes the points payout idempotent. If any learner
-- already holds more than one *correct* attempt for the same question, the
-- index cannot be built and `prisma migrate deploy` will fail.
--
-- Run this FIRST, read-only. Nothing here modifies data.

-- 1) Which (learner, question) pairs are duplicated, and by how much.
select
  aa.profile_id,
  p.email,
  aa.question_id,
  count(*)                       as correct_attempts,
  sum(aa.points_awarded)         as points_awarded_total,
  min(aa.created_at)             as first_correct_at,
  max(aa.created_at)             as last_correct_at
from public.answer_attempts aa
join public.profiles p on p.id = aa.profile_id
where aa.is_correct
group by aa.profile_id, p.email, aa.question_id
having count(*) > 1
order by correct_attempts desc, points_awarded_total desc;

-- 2) One-line verdict: 0 rows means the migration will apply cleanly.
select count(*) as duplicate_pairs
from (
  select aa.profile_id, aa.question_id
  from public.answer_attempts aa
  where aa.is_correct
  group by aa.profile_id, aa.question_id
  having count(*) > 1
) dupes;

-- 3) The individual rows behind each duplicate pair, newest first. `keep`
--    marks the attempt the de-duplication should preserve (the earliest one,
--    which is the attempt that legitimately earned the points).
select
  aa.id,
  aa.profile_id,
  aa.question_id,
  aa.points_awarded,
  aa.created_at,
  row_number() over (
    partition by aa.profile_id, aa.question_id order by aa.created_at, aa.id
  ) = 1 as keep
from public.answer_attempts aa
join (
  select profile_id, question_id
  from public.answer_attempts
  where is_correct
  group by profile_id, question_id
  having count(*) > 1
) d on d.profile_id = aa.profile_id and d.question_id = aa.question_id
where aa.is_correct
order by aa.profile_id, aa.question_id, aa.created_at;

-- 4) How much over-payment the duplicates represent, so the ledger correction
--    can be sized before anybody touches a row.
select
  coalesce(sum(extra.points_awarded), 0) as overpaid_points,
  count(*)                               as surplus_attempt_rows
from (
  select
    aa.points_awarded,
    row_number() over (
      partition by aa.profile_id, aa.question_id order by aa.created_at, aa.id
    ) as rn
  from public.answer_attempts aa
  where aa.is_correct
) extra
where extra.rn > 1;

-- ---------------------------------------------------------------------------
-- The same migration also adds a partial unique index on points_ledger
-- (profile_id, room_id) WHERE reason = 'ROOM_COMPLETED', so the completion
-- bonus can only ever be paid once. Check that one too.
-- ---------------------------------------------------------------------------
select
  pl.profile_id,
  p.email,
  pl.room_id,
  r.slug            as room_slug,
  count(*)          as bonus_rows,
  sum(pl.amount)    as bonus_points_total
from public.points_ledger pl
join public.profiles p on p.id = pl.profile_id
left join public.rooms r on r.id = pl.room_id
where pl.reason = 'ROOM_COMPLETED'
group by pl.profile_id, p.email, pl.room_id, r.slug
having count(*) > 1
order by bonus_rows desc;
