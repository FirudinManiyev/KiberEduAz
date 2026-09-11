#!/usr/bin/env bash
#
# Does the compiled backend actually start?
#
# `nest build` only type-checks and emits. It never loads @nestjs/core at
# runtime, so a lockfile where @nestjs/core and @nestjs/common drift apart
# builds perfectly and then dies on boot with:
#
#   Cannot find module '@nestjs/common/decorators/http/sse-signal.decorator'
#
# That is exactly how the 12 Sep deploy broke. This script closes the gap:
# it boots dist/main.js against a deliberately unreachable database and
# checks how far it got.
#
#   PASS - Nest wired every module and mapped its routes, then failed to
#          reach the dummy database. That failure is the expected ending.
#   FAIL - the process died before that: a missing module, a dependency
#          injection error, or bad configuration.
#
# Run from the repo root, after `npm --prefix backend run build`:
#   ./scripts/boot-check.sh
#
# Read-only: touches no real database, no network, no deployment.
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

ENTRY="backend/dist/main.js"

if [ ! -f "${ENTRY}" ]; then
  echo "FAIL: ${ENTRY} not found - run 'npm --prefix backend run build' first."
  exit 1
fi

# Port 1 on loopback refuses instantly, so Prisma fails fast instead of
# spending the whole timeout retrying.
UNREACHABLE_DB='postgresql://boot:check@127.0.0.1:1/bootcheck'
LOG="$(mktemp)"
trap 'rm -f "${LOG}"' EXIT

echo "Booting ${ENTRY} against an unreachable database..."

SUPABASE_URL='https://boot-check.supabase.co' \
SUPABASE_PROJECT_REF='boot-check' \
SUPABASE_PUBLISHABLE_KEY='boot-check' \
DATABASE_URL="${UNREACHABLE_DB}" \
DIRECT_URL="${UNREACHABLE_DB}" \
CORS_ORIGINS='http://localhost:3000' \
NODE_ENV='production' \
PORT='45990' \
  timeout 90 node "${ENTRY}" > "${LOG}" 2>&1

echo

# --- things that mean the process is genuinely broken -----------------------
if grep -qE "Cannot find module|MODULE_NOT_FOUND" "${LOG}"; then
  echo "FAIL: a module could not be resolved. Usually means the @nestjs/*"
  echo "      packages in package-lock.json have drifted to different minor"
  echo "      versions - they must all move together."
  echo
  grep -E "Cannot find module|Require stack" -A 3 "${LOG}" | head -20
  exit 1
fi

if grep -qE "Nest can't resolve dependencies|UnknownDependenciesException" "${LOG}"; then
  echo "FAIL: dependency injection error - a provider is missing from its module."
  echo
  grep -E "Nest can't resolve dependencies" -A 6 "${LOG}" | head -20
  exit 1
fi

if grep -q "Missing required environment variable" "${LOG}"; then
  echo "FAIL: configuration rejected the environment before the app could start."
  echo
  grep "Missing required environment variable" "${LOG}" | head -5
  exit 1
fi

# --- the app has to have got far enough to be worth calling a pass ----------
if ! grep -q "RouterExplorer" "${LOG}"; then
  echo "FAIL: the app never mapped any routes, so it did not finish starting."
  echo
  tail -25 "${LOG}"
  exit 1
fi

routes="$(grep -c "Mapped {" "${LOG}")"

echo "PASS: every module initialised and ${routes} routes were mapped."
echo "      The only failure was reaching the dummy database, which is the"
echo "      expected ending for this check."
