#!/usr/bin/env bash
# Regression test for /api/entries auth gate.
# Past incident: GET /api/entries was public — leaked all entries to anonymous callers.
# This script must report PASS for both list and detail endpoints.
#
# Usage:
#   BASE_URL=https://your-app.up.railway.app ./tests/api/entries-auth.sh
#   BASE_URL=http://localhost:3000 ./tests/api/entries-auth.sh   (default)

set -u
BASE_URL="${BASE_URL:-http://localhost:3000}"
fail=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    echo "PASS  $name → $actual"
  else
    echo "FAIL  $name → expected $expected, got $actual"
    fail=1
  fi
}

list_status=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/entries")
check "GET /api/entries (anonymous)" "401" "$list_status"

detail_status=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/entries/1")
check "GET /api/entries/1 (anonymous)" "401" "$detail_status"

exit $fail
