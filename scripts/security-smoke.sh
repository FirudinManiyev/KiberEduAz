#!/usr/bin/env bash
#
# Post-deploy smoke test for the access-control fixes.
#
# Replays the proof-of-concept requests from the audit reports with a real,
# admin-approved TEACHER token and expects every one of them to be refused.
#
# READ-ONLY BY DESIGN. Every request either is a GET, or carries a payload that
# is a no-op even if it unexpectedly succeeds:
#   - the room/task writes target a room the token's owner does not own, and
#     send the field values back unchanged where they are sent at all;
#   - the publish attempt sets status to DRAFT, which is the state the target
#     module is already in, so a 200 would not change anything either.
# Nothing is deleted. Read the "UNEXPECTED" lines carefully if any appear.
#
# Usage:
#   API_URL=https://kiberedu-api.onrender.com/api/v1 \
#   TEACHER_TOKEN=<access token of an approved teacher> \
#   OTHER_ROOM_ID=<uuid of a room that teacher does NOT own> \
#   DRAFT_MODULE_ID=<uuid of a DRAFT module that teacher does NOT own> \
#   ./scripts/security-smoke.sh
#
# Exit code 0 means every check was refused as expected.
set -uo pipefail

: "${API_URL:?set API_URL, e.g. https://kiberedu-api.onrender.com/api/v1}"
: "${TEACHER_TOKEN:?set TEACHER_TOKEN (approved TEACHER access token)}"
: "${OTHER_ROOM_ID:?set OTHER_ROOM_ID (a room this teacher does NOT own)}"
: "${DRAFT_MODULE_ID:?set DRAFT_MODULE_ID (a DRAFT module this teacher does NOT own)}"

API_URL="${API_URL%/}"
OTHER_TASK_ID="${OTHER_TASK_ID:-00000000-0000-4000-8000-000000000000}"

pass=0
fail=0

# check <name> <expected-codes> <curl args...>
check() {
  local name="$1" expected="$2"
  shift 2

  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' \
    -H "Authorization: Bearer ${TEACHER_TOKEN}" \
    -H 'Content-Type: application/json' \
    "$@" 2>/dev/null)"

  if [[ " ${expected} " == *" ${code} "* ]]; then
    printf '  [ ok ] %-52s HTTP %s\n' "${name}" "${code}"
    pass=$((pass + 1))
  else
    printf '  [UNEXPECTED] %-45s HTTP %s (wanted one of: %s)\n' "${name}" "${code}" "${expected}"
    fail=$((fail + 1))
  fi
}

echo "Target: ${API_URL}"
echo

echo "Sanity: the token works at all"
check "GET /profiles/me" "200" "${API_URL}/profiles/me"
echo

echo "F-01 - answer keys and writes on somebody else's room (expect 403)"
check "GET  /rooms/:id/edit (answer key)" "403" \
  "${API_URL}/rooms/${OTHER_ROOM_ID}/edit"

check "PATCH /rooms/:id (no-op body)" "403" \
  -X PATCH -d '{}' "${API_URL}/rooms/${OTHER_ROOM_ID}"

check "POST /rooms/:id/tasks" "403" \
  -X POST -d '{"title":"smoke-test-should-be-refused"}' \
  "${API_URL}/rooms/${OTHER_ROOM_ID}/tasks"

check "DELETE /rooms/:id/tasks/:taskId" "403 404" \
  -X DELETE "${API_URL}/rooms/${OTHER_ROOM_ID}/tasks/${OTHER_TASK_ID}"
echo

echo "F-02 / publish bypass - the live PoC from the pentest report"
# status DRAFT, not PUBLISHED: the target is already DRAFT, so even an
# unexpected 200 leaves it exactly as it was.
check "PATCH /modules/:id with status (foreign module)" "403" \
  -X PATCH -d '{"status":"DRAFT"}' "${API_URL}/modules/${DRAFT_MODULE_ID}"
echo

echo "Admin-only surfaces (expect 403)"
check "POST /rooms/:id/publish" "403" \
  -X POST "${API_URL}/rooms/${OTHER_ROOM_ID}/publish"

check "DELETE /modules/:id" "403" \
  -X DELETE "${API_URL}/modules/${DRAFT_MODULE_ID}"

check "GET /profiles (admin list)" "403" "${API_URL}/profiles"
echo

echo "-----------------------------------------------"
echo "passed: ${pass}   unexpected: ${fail}"

if [ "${fail}" -ne 0 ]; then
  echo
  echo "At least one request was NOT refused. Do not consider the deploy verified."
  exit 1
fi

echo "All access-control checks refused as expected."
