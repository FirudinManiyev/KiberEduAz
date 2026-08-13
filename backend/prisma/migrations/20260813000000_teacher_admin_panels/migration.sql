-- Account lifecycle for teacher approval workflow
CREATE TYPE "account_status" AS ENUM ('ACTIVE', 'PENDING', 'REJECTED');

ALTER TABLE "profiles"
  ADD COLUMN "account_status" "account_status" NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX "profiles_account_status_idx" ON "profiles"("account_status");

ALTER TABLE "class_groups"
  ADD COLUMN "teacher_id" UUID;

ALTER TABLE "class_groups"
  ADD CONSTRAINT "class_groups_teacher_id_fkey"
  FOREIGN KEY ("teacher_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "class_groups_teacher_id_idx" ON "class_groups"("teacher_id");
