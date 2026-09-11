-- Soft delete for data-subject deletion requests (F-09). A deleted account is
-- marked, not erased: it stops authenticating immediately, and the row plus
-- everything cascading off it is purged after the restore window.
--
-- Nullable, so every existing profile is "not deleted" without a backfill.
ALTER TABLE "profiles"
  ADD COLUMN "deleted_at" TIMESTAMPTZ(6);

-- Partial: the purge job only ever scans the handful of deleted rows.
CREATE INDEX "profiles_deleted_at_idx"
  ON "profiles" ("deleted_at")
  WHERE "deleted_at" IS NOT NULL;
