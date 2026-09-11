-- Points were paid out after an `alreadySolved` read that ran outside the
-- write transaction, so two concurrent correct submissions could both see
-- "not yet solved" and both pay. A partial unique index makes the first
-- correct attempt per (learner, question) the single source of truth: the
-- second one now loses the race with P2002 and pays nothing.
--
-- Prisma's schema language cannot express a partial index, so it lives here
-- as raw SQL. The Prisma schema documents it in a comment on AnswerAttempt.
--
-- PRE-FLIGHT: run prisma/manual/find_duplicate_correct_attempts.sql first.
-- If it reports any duplicate pairs this statement fails and the whole
-- migration is rolled back; nothing is deleted automatically on purpose.
CREATE UNIQUE INDEX "answer_attempts_profile_question_correct_key"
  ON "answer_attempts" ("profile_id", "question_id")
  WHERE "is_correct";

-- The room-completion bonus is paid at most once per learner and room, for
-- the same reason. Partial again, because QUESTION_CORRECT entries are
-- intentionally many per room.
CREATE UNIQUE INDEX "points_ledger_room_completed_key"
  ON "points_ledger" ("profile_id", "room_id")
  WHERE "reason" = 'ROOM_COMPLETED';
