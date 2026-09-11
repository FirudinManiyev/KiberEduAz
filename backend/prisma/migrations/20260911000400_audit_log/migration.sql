-- Who did what to whom, for the privileged actions: teacher approval and
-- rejection, room publish/unpublish/archive, role changes, curriculum
-- deletions, account restore and purge. Append-only by convention; nothing in
-- the API updates or deletes a row.
--
-- actor_id is nullable with ON DELETE SET NULL so an admin's own account can be
-- purged without taking their history with it, and so the scheduler (no
-- actor) can write rows too.
CREATE TABLE "audit_log" (
  "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
  "actor_id"    UUID,
  "action"      TEXT        NOT NULL,
  "target_type" TEXT        NOT NULL,
  "target_id"   UUID,
  "metadata"    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  "created_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "audit_log_actor_id_fkey"
    FOREIGN KEY ("actor_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "audit_log_created_at_idx" ON "audit_log" ("created_at" DESC);
CREATE INDEX "audit_log_actor_id_idx" ON "audit_log" ("actor_id");
CREATE INDEX "audit_log_target_type_target_id_idx" ON "audit_log" ("target_type", "target_id");

-- Same default-deny as every other table: the API is the only way in.
ALTER TABLE "audit_log" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "audit_log" FROM anon, authenticated;
