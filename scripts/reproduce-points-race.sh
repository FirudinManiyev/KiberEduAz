#!/usr/bin/env bash
#
# Reproduction for F-04 (double points payout on concurrent correct answers).
#
# A real concurrency test needs a live Postgres, so this is a script rather
# than a unit test: it fires N simultaneous *correct* submissions for the same
# question and checks that the learner's point total moved by one payout, not
# N. Before migration 20260911000500 this over-pays; after it, the partial
# unique index makes every loser a no-op.
#
# Usage:
#   API_URL=https://kiberedu-api.onrender.com/api/v1 \
#   STUDENT_TOKEN=<supabase access token for a test learner> \
#   QUESTION_ID=<uuid of an UNSOLVED question> \
#   OPTION_ID=<uuid of its correct option> \
#   ./scripts/reproduce-points-race.sh
#
# This WRITES: it answers a question as the given learner and awards points.
# Run it with a throwaway test account, never a real learner's.
set -euo pipefail

: "${API_URL:?set API_URL, e.g. http://127.0.0.1:4000/api/v1}"
: "${STUDENT_TOKEN:?set STUDENT_TOKEN (Supabase access token for a TEST learner)}"
: "${QUESTION_ID:?set QUESTION_ID (a question this learner has NOT solved yet)}"
: "${OPTION_ID:?set OPTION_ID (the correct option for that question)}"

CONCURRENCY="${CONCURRENCY:-8}"
API_URL="${API_URL%/}"

auth=(-H "Authorization: Bearer ${STUDENT_TOKEN}" -H 'Content-Type: application/json')

points_now() {
  curl -fsS "${auth[@]}" "${API_URL}/progress/summary" |
    sed -n 's/.*"totalPoints":\([0-9]*\).*/\1/p'
}

before="$(points_now)"
echo "totalPoints before: ${before}"
echo "firing ${CONCURRENCY} concurrent correct submissions for ${QUESTION_ID}"

tmp="$(mktemp -d)"
trap 'rm -rf "${tmp}"' EXIT

for i in $(seq 1 "${CONCURRENCY}"); do
  curl -sS -o "${tmp}/body.${i}" -w '%{http_code}\n' \
    -X POST "${auth[@]}" \
    -d "{\"optionId\":\"${OPTION_ID}\"}" \
    "${API_URL}/progress/questions/${QUESTION_ID}/answer" \
    > "${tmp}/code.${i}" 2>/dev/null &
done
wait

echo
echo "--- per-request status and pointsAwarded ---"
paid=0
for i in $(seq 1 "${CONCURRENCY}"); do
  code="$(cat "${tmp}/code.${i}")"
  awarded="$(sed -n 's/.*"pointsAwarded":\([0-9]*\).*/\1/p' "${tmp}/body.${i}")"
  awarded="${awarded:-0}"
  echo "  request ${i}: HTTP ${code}, pointsAwarded=${awarded}"
  if [ "${awarded}" -gt 0 ]; then paid=$((paid + 1)); fi
done

after="$(points_now)"
delta=$((after - before))

echo
echo "totalPoints after:  ${after}"
echo "delta:              ${delta}"
echo "requests that paid: ${paid}"
echo

if [ "${paid}" -le 1 ]; then
  echo "PASS: at most one submission was paid; the payout is idempotent."
  exit 0
fi

echo "FAIL: ${paid} submissions were each paid - the race is still open."
echo "Check that migration 20260911000500_answer_attempt_idempotency is applied:"
echo "  select indexname from pg_indexes"
echo "   where indexname = 'answer_attempts_profile_question_correct_key';"
exit 1
