-- Learning modules had no author column, so there was nothing to check
-- ownership against. Nullable on purpose: rows created before this migration
-- keep created_by_id = NULL and stay admin-only, which is the safe default.
ALTER TABLE "learning_modules"
  ADD COLUMN "created_by_id" UUID;

ALTER TABLE "learning_modules"
  ADD CONSTRAINT "learning_modules_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "learning_modules_created_by_id_idx" ON "learning_modules"("created_by_id");
