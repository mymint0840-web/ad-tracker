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

# P0 round 2 — additional surfaces audited 2026-04-11
dashboard_status=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/dashboard/summary")
check "GET /api/dashboard/summary (anonymous)" "401" "$dashboard_status"

products_status=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/products")
check "GET /api/products (anonymous)" "401" "$products_status"

# test-token endpoint must not issue tokens (deleted as dev-only credential bypass).
# NextAuth's [...nextauth] catch-all answers with 400 for unknown actions; either
# 400 or 404 is a safe state — what matters is that no token is returned.
testtoken_body=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"x"}' "$BASE_URL/api/auth/test-token")
if echo "$testtoken_body" | grep -q '"token"'; then
  echo "FAIL  POST /api/auth/test-token leaked token in body"
  fail=1
else
  echo "PASS  POST /api/auth/test-token no token in body"
fi

# PUT/DELETE on entry detail must require auth (was already enforced, regression check)
put_status=$(curl -s -o /dev/null -w '%{http_code}' -X PUT -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/entries/1")
check "PUT /api/entries/1 (anonymous)" "401" "$put_status"

del_status=$(curl -s -o /dev/null -w '%{http_code}' -X DELETE "$BASE_URL/api/entries/1")
check "DELETE /api/entries/1 (anonymous)" "401" "$del_status"

exit $fail
