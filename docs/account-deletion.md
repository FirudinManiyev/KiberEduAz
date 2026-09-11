# Account deletion

Closes F-09. The platform's audience is minors, so a data-subject deletion
request has to be answerable; before this there was no delete path at all,
only sign-out.

## The two steps

**1. Request — `DELETE /api/v1/profiles/me`**

Sets `profiles.deleted_at`. Nothing is erased yet, but `JwtAuthGuard` refuses
a marked profile, so the account stops working from the very next request.
The response carries `deletedAt`, `purgeAfter` and `restoreWindowDays`.

The account also disappears straight away from the leaderboard, the admin user
list, the pending-teacher queue and the admin dashboard counts.

**2. Purge — `POST /api/v1/admin/profiles/purge-expired`** (ADMIN only)

Hard-deletes every profile whose `deleted_at` is older than the 30-day restore
window. Idempotent, so re-running it is harmless.

For each account it deletes the Supabase Auth user first and the `Profile` row
second. If the Auth call fails the profile stays behind and is retried on the
next run, rather than leaving an auth user with no local record. The response
reports `{ due, purged, failed }`.

`POST /api/v1/admin/profiles/:id/restore` undoes a request inside the window.
It has to be an admin action: a marked account cannot sign in to undo it
itself.

## What is deleted, and what deliberately is not

`Profile` is the root of the cascade, so these go with it (`onDelete: Cascade`):

- `AnswerAttempt`, `PointsLedger`, `UserStats`
- `RoomProgress`, `TaskProgress`
- `ClassMembership`, `Notification`
- the Supabase Auth user

Authored content does **not**. `Path`, `LearningModule` and `Room` hold
`created_by_id` with `onDelete: SetNull`, and `ClassGroup.teacher_id` likewise.
Deleting a teacher must not take a published curriculum, or a class full of
other people's learners, down with it. The rows survive with no author
attached.

**This needs a retention sign-off.** If the intent is that a teacher's content
must also go, that is a product decision with a different implementation
(reassign to an admin, or archive), not a change of cascade rule.

## Scheduling the purge

Done in-process: `AccountDeletionService.purgeExpiredOnSchedule` runs every day
at 03:00 server time via `@nestjs/schedule` (`ScheduleModule.forRoot()` is
registered in `ProfilesModule`). No admin token has to live in an external cron,
and because the purge is idempotent a second instance firing the same tick
finds nothing left to do.

`POST /api/v1/admin/profiles/purge-expired` stays available for running it by
hand - after a support request, or to verify the job on a fresh deploy.

Every purge and every restore is also written to the audit log
(`audit_log`, see `docs/audit-log.md`), so "when did this account actually go"
has an answer.

## Configuration

`SUPABASE_SECRET_KEY` (already present in `.env.example` and in `render.yaml`
with `sync: false`) is what authorises the Supabase Admin `deleteUser` call. It
is the same admin key the role-assignment flow already uses, so no new secret
is introduced. Without it, step 1 still works and step 2 fails loudly per
account rather than silently half-deleting.
