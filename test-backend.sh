#!/bin/bash
# Backend API Test Script
# Uses seeded data — run `docker compose up -d` before starting.
# Usage: bash test-backend.sh

BASE="http://localhost:3000"

# Seeded IDs
MOONBUCKS="550e8400-e29b-41d4-a716-446655440000"
ROBUSTA="661f9511-f30c-52e5-b827-557766551111"
UNLUCKIN="772a0622-f41d-63f6-c938-668877662222"

ALICE="UI0000001"
BOB="UI0000002"
CHARLIE="UI0000003"
DAVID="UI0000004"
EVE="UI0000005"

PASS=0
FAIL=0

check() {
  local label="$1"
  local expected="$2"
  local actual="$3"
  if echo "$actual" | grep -qF "$expected"; then
    echo "  PASS  $label"
    ((PASS++))
  else
    echo "  FAIL  $label"
    echo "        Expected to contain: $expected"
    echo "        Got: $actual"
    ((FAIL++))
  fi
}

check_absent() {
  local label="$1"
  local unexpected="$2"
  local actual="$3"
  if echo "$actual" | grep -qF "$unexpected"; then
    echo "  FAIL  $label"
    echo "        Expected NOT to contain: $unexpected"
    echo "        Got: $actual"
    ((FAIL++))
  else
    echo "  PASS  $label"
    ((PASS++))
  fi
}

echo ""
echo "============================================================"
echo " GET /cafes"
echo "============================================================"

RES=$(curl -s "$BASE/cafes")
check "Returns all 3 cafes" "Moonbucks" "$RES"
check "Moonbucks has 3 employees" '"name":"Moonbucks"' "$RES"
check "Moonbucks appears before Robusta (sorted desc)" '"name":"Moonbucks"' "$(echo $RES | sed 's/"Robusta".*//")" 

echo ""
echo "-- GET /cafes?location=Tanjong Pagar"
RES=$(curl -s "$BASE/cafes?location=Tanjong%20Pagar")
check "Returns cafes in Tanjong Pagar" "Moonbucks" "$RES"
check "Returns Robusta too" "Robusta" "$RES"
check_absent "Tanjong Pagar filter excludes UnLuckin" "UnLuckin" "$RES"

echo ""
echo "-- GET /cafes?location=Orchard"
RES=$(curl -s "$BASE/cafes?location=Orchard")
check "Returns UnLuckin" "UnLuckin" "$RES"

echo ""
echo "-- GET /cafes?location=Tampines (no match)"
RES=$(curl -s "$BASE/cafes?location=Tampines")
check "Returns empty array" "[]" "$RES"

echo ""
echo "============================================================"
echo " GET /employees"
echo "============================================================"

RES=$(curl -s "$BASE/employees")
check "Returns all 5 employees" "Alice" "$RES"
check "Alice has highest days_worked (sorted first)" '"id":"UI0000001"' "$(echo $RES | cut -c1-30)"
check "Eve has 0 days_worked and null cafe" '"days_worked":0,"cafe":null' "$RES"

echo ""
echo "-- GET /employees?cafe=Moonbucks"
RES=$(curl -s "$BASE/employees?cafe=Moonbucks")
check "Returns Alice" "Alice" "$RES"
check "Returns Bob" "Bob" "$RES"
check "Returns Charlie" "Charlie" "$RES"
check_absent "Moonbucks filter excludes David" "David" "$RES"

echo ""
echo "-- GET /employees?cafe=Robusta"
RES=$(curl -s "$BASE/employees?cafe=Robusta")
check "Returns David only" "David" "$RES"

echo ""
echo "============================================================"
echo " POST /cafes"
echo "============================================================"

RES=$(curl -s -X POST "$BASE/cafes" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Cafe","description":"A brand new cafe","location":"Orchard"}')
check "Returns new UUID" '"id":"' "$RES"
NEW_CAFE_ID=$(echo "$RES" | sed 's/.*"id":"\([^"]*\)".*/\1/')
echo "        New cafe ID: $NEW_CAFE_ID"

echo ""
echo "============================================================"
echo " POST /employees"
echo "============================================================"

echo ""
echo "-- POST unassigned employee"
RES=$(curl -s -X POST "$BASE/employees" \
  -H "Content-Type: application/json" \
  -d '{"name":"Frank","email_address":"frank@test.com","phone_number":"91234567","gender":"Male"}')
check "Returns new UIXXXXXXX id" '"id":"UI' "$RES"
NEW_EMP_ID=$(echo "$RES" | sed 's/.*"id":"\([^"]*\)".*/\1/')
echo "        New employee ID: $NEW_EMP_ID"

echo ""
echo "-- POST employee assigned to cafe"
RES=$(curl -s -X POST "$BASE/employees" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Grace\",\"email_address\":\"grace@test.com\",\"phone_number\":\"81234567\",\"gender\":\"Female\",\"cafe_id\":\"$ROBUSTA\"}")
check "Returns new UIXXXXXXX id" '"id":"UI' "$RES"
NEW_EMP_ID2=$(echo "$RES" | sed 's/.*"id":"\([^"]*\)".*/\1/')

RES=$(curl -s "$BASE/employees?cafe=Robusta")
check "Grace appears under Robusta" "Grace" "$RES"

echo ""
echo "============================================================"
echo " PUT /cafes/:id"
echo "============================================================"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/cafes/$UNLUCKIN" \
  -H "Content-Type: application/json" \
  -d '{"name":"UnLucky Coffee","description":"Still a Luckin competitor","location":"Orchard"}')
check "Returns 204" "204" "$HTTP_CODE"

RES=$(curl -s "$BASE/cafes")
check "Name updated in GET /cafes response" "UnLucky Coffee" "$RES"

echo ""
echo "-- Revert name back"
curl -s -o /dev/null -X PUT "$BASE/cafes/$UNLUCKIN" \
  -H "Content-Type: application/json" \
  -d '{"name":"UnLuckin","description":"Luckin Coffee Competitor","location":"Orchard"}'

echo ""
echo "============================================================"
echo " PUT /employees (reassign to different cafe)"
echo "============================================================"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/employees" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"$DAVID\",\"name\":\"David Koh\",\"email_address\":\"david@gmail.com\",\"phone_number\":\"84445555\",\"gender\":\"Male\",\"cafe_id\":\"$UNLUCKIN\"}")
check "Returns 204" "204" "$HTTP_CODE"

RES=$(curl -s "$BASE/employees?cafe=UnLuckin")
check "David now appears under UnLuckin" "David" "$RES"

echo ""
echo "-- Revert David back to Robusta"
curl -s -o /dev/null -X PUT "$BASE/employees" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"$DAVID\",\"name\":\"David Koh\",\"email_address\":\"david@gmail.com\",\"phone_number\":\"84445555\",\"gender\":\"Male\",\"cafe_id\":\"$ROBUSTA\"}"

echo ""
echo "============================================================"
echo " PUT /employees (unassign from cafe)"
echo "============================================================"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/employees" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"$CHARLIE\",\"name\":\"Charlie A.\",\"email_address\":\"charlie@gmail.com\",\"phone_number\":\"93334444\",\"gender\":\"Male\"}")
check "Returns 204" "204" "$HTTP_CODE"

RES=$(curl -s "$BASE/employees")
CHARLIE_JSON=$(echo "$RES" | python3 -c "import sys,json; emps=json.load(sys.stdin); match=[e for e in emps if e['id']=='UI0000003']; print(match[0]['cafe'] if match else 'NOT_FOUND')")
check "Charlie cafe is now null" "None" "$CHARLIE_JSON"

echo ""
echo "============================================================"
echo " PUT /employees (non-existent employee)"
echo "============================================================"

RES=$(curl -s -X PUT "$BASE/employees" \
  -H "Content-Type: application/json" \
  -d '{"id":"UIINVALID","name":"Nobody","email_address":"x@x.com","phone_number":"91234567","gender":"Male"}')
check "Returns not found error" "not found" "$RES"

echo ""
echo "============================================================"
echo " DELETE /employees/:id"
echo "============================================================"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/employees/$NEW_EMP_ID")
check "Returns 204 for Frank" "204" "$HTTP_CODE"

RES=$(curl -s "$BASE/employees")
check_absent "Frank is removed from GET /employees" "Frank" "$RES"

echo ""
echo "============================================================"
echo " DELETE /cafes/:id (cascade deletes employees)"
echo "============================================================"

# Create a temp cafe with one employee to test cascade
TEMP_CAFE=$(curl -s -X POST "$BASE/cafes" \
  -H "Content-Type: application/json" \
  -d '{"name":"Temp Cafe","description":"For deletion test","location":"Bishan"}' | sed 's/.*"id":"\([^"]*\)".*/\1/')

TEMP_EMP=$(curl -s -X POST "$BASE/employees" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"TempWorker\",\"email_address\":\"tmp@tmp.com\",\"phone_number\":\"91111111\",\"gender\":\"Male\",\"cafe_id\":\"$TEMP_CAFE\"}" | sed 's/.*"id":"\([^"]*\)".*/\1/')

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/cafes/$TEMP_CAFE")
check "Returns 204 for cafe delete" "204" "$HTTP_CODE"

RES=$(curl -s "$BASE/employees")
check_absent "TempWorker was cascade-deleted with the cafe" "TempWorker" "$RES"

RES=$(curl -s "$BASE/cafes")
check_absent "Temp Cafe is removed from GET /cafes" "Temp Cafe" "$RES"

echo ""
echo "============================================================"
echo " Results: $PASS passed, $FAIL failed"
echo "============================================================"
echo ""
