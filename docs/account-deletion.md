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

The endpoint is deliberately a plain authenticated POST so it can be driven
from outside, and no scheduler is baked into the API process. In rough order of
effort:

1. **Render Cron Job** (simplest). Add a second service to `render.yaml` with
   `type: cron`, `schedule: "0 3 * * *"`, running a one-line `curl` against
   `POST /api/v1/admin/profiles/purge-expired` with an admin token. Needs a
   long-lived admin credential, which is the main drawback.
2. **GitHub Actions scheduled workflow** — same call, token in repository
   secrets. No extra Render service.
3. **In-process `@nestjs/schedule`** — a `@Cron` decorator calling
   `AccountDeletionService.purgeExpired()` directly, so no token is needed at
   all. Adds a dependency, and on a multi-instance deploy every instance fires;
   harmless here because the purge is idempotent, and Render's free plan runs a
   single instance anyway.

Option 3 is the cleanest if the extra dependency is acceptable. Until one of
these is wired up, the purge only happens when an admin calls it, and deleted
accounts simply stay marked and inert — which is safe, just not complete.

## Configuration

`SUPABASE_SECRET_KEY` (already present in `.env.example` and in `render.yaml`
with `sync: false`) is what authorises the Supabase Admin `deleteUser` call. It
is the same admin key the role-assignment flow already uses, so no new secret
is introduced. Without it, step 1 still works and step 2 fails loudly per
account rather than silently half-deleting.
