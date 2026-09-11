# Audit log

Closes the P3 "audit trail for privileged actions" item from the consolidated
audit. Answers *who did what, to whom, when* for every action that changes
somebody else's access or what learners can see.

## What is recorded

| Action | Target | Written by |
|---|---|---|
| `teacher.approve`, `teacher.reject` | `profile` | admin console |
| `profile.role.change` | `profile` (metadata: `from`, `to`) | `PATCH /profiles/:id/role` |
| `room.publish`, `room.unpublish`, `room.archive`, `room.delete` | `room` | rooms admin endpoints |
| `path.delete`, `module.delete` | `path` / `module` | curriculum admin endpoints |
| `account.delete.request` | `profile` | the learner themselves |
| `account.restore` | `profile` | admin |
| `account.purge` | `profile` (metadata: `email`) | nightly scheduler (`actorId` null) or admin |

Ordinary content editing by a teacher on their own room is **not** logged:
it changes nothing another person can see until an admin publishes it, and
that publish is logged.

## Shape

`audit_log` — `id`, `actor_id` (nullable, `SET NULL` when the actor is purged),
`action`, `target_type`, `target_id`, `metadata` (jsonb), `created_at`. Indexed
by time, by actor and by target. RLS on, no policies, same as every table.

Append-only by convention: no code path updates or deletes a row. A failed
write is logged server-side and does **not** fail the action it was recording —
losing one line of history is preferable to blocking an admin.

## Reading it

`GET /api/v1/admin/audit?limit=50&cursor=<id>` (ADMIN only) returns the newest
entries first with the actor's name and e-mail joined in, plus a `nextCursor`
for paging. Nothing writes through this endpoint.
