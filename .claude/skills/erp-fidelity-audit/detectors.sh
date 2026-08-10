#!/usr/bin/env bash
# erp-fidelity-audit detectors — does the code match its own domain spec?
# Every hit is a LEAD; confirm against the contract/vision doc before reporting.
set -uo pipefail
ROOT="${1:-.}"; cd "$ROOT" || exit 1
EXC='--glob=!**/graphify-out/** --glob=!**/node_modules/** --glob=!**/.next/** --glob=!**/artifacts/** --glob=!**/.w2-02-traces/** --glob=!**/coverage/** --glob=!**/dist/** --glob=!**/build/** --glob=!**/*.tsbuildinfo --glob=!**/*gap-analysis*.md --glob=!**/erp-workflow-map.md'
if command -v rg >/dev/null 2>&1; then S(){ rg -n $EXC "$@"; }; else S(){ grep -rnE "$@" . 2>/dev/null; }; fi
hr(){ printf '\n=== %s ===\n' "$1"; }

hr "1. Aggregate shape — arrays/value-objects in contracts vs. flat scalars in domain"
echo "-- array/nested fields the CONTRACTS declare:"; S -g '*.avsc' -g '*.yaml' '"type"\s*:\s*"array"|"items"|routing|equipment\b' contracts docs 2>/dev/null | head -15
echo "-- how the domain models them (look for flat String instead):"; S -g '*.java' 'String\s+(origin|destination|equipmentType|containerId)' services 2>/dev/null | head

hr "2. Field-name drift & self-disagreement (compare against contract names by hand)"
S 'equipmentType(Id|Code)?|loadUnLocode|dischargeUnLocode|originLocationId|destinationLocationId|voyageId|equipmentId|moveCode|movementStatus' -g '*.java' -g '*.ts' -g '*.tsx' -g '*.avsc' 2>/dev/null | head -30

hr "3. Stringly-typed escape hatches (real domain fields hidden in bags)"
S 'Map<String,\s*String>\s+attributes|Map<String,\s*String>\s+metadata|Record<string,\s*string>|attributes\.' -g '*.java' -g '*.ts' -g '*.tsx' 2>/dev/null | head -20

hr "4. Standards-on-paper — industry standard in docs vs. code (edit STD for your standard)"
STD='dcsa|un.?locode|iso.?6346|equipmentEventTypeCode|eventClassifierCode|carrierBookingReference'
echo "-- in DOCS:"; S -i "$STD" docs contracts 2>/dev/null | wc -l
echo "-- in CODE (java/ts/avsc):"; S -i "$STD" -g '*.java' -g '*.ts' -g '*.tsx' -g '*.avsc' 2>/dev/null | wc -l
echo "  (docs >> 0 while code == 0 means the standard is aspirational only)"

hr "5. Named capabilities that are ZERO/near-zero in code (adjust list per vision)"
for cap in invoice capacity tariff surcharge reefer voyage vessel "track.?trace" routing; do
  n=$(S -i "$cap" -g '*.java' -g '*.ts' -g '*.tsx' 2>/dev/null | grep -viE 'test' | wc -l)
  printf "  %-14s %s hits\n" "$cap" "$n"
done

hr "6a. UI — missing detail routes (expect a [id] page per entity)"
if command -v rg >/dev/null 2>&1; then
  echo "-- dynamic [id] PAGE routes found:"; find apps -path '*app*' -name 'page.tsx' 2>/dev/null | grep -E '\[' || echo "  NONE — no detail pages exist"
fi

hr "6b. UI — inline hardcoded colors & local style objects (no design tokens)"
S '#[0-9a-fA-F]{6}|const styles:\s*Record<string,\s*CSSProperties>' -g '*.tsx' apps 2>/dev/null | wc -l
echo "  hex-color/inline-style occurrences in app TSX (high = ad-hoc styling, no design system)"

hr "6c. UI — design system size (a real one is many files, not one)"
find packages/ui -name '*.tsx' -o -name '*.ts' 2>/dev/null | grep -v node_modules | wc -l
echo "  files in packages/ui (1 = placeholder, not a design system)"

hr "6d. UI — hardcoded auth user (login not wired into business screens)"
S "actorSubjectId:\s*[\"']local-user[\"']|subjectId\s*=\s*[\"']local|X-Local-User" -g '*.tsx' -g '*.ts' apps 2>/dev/null || echo "  none found"

printf '\nDone. LEADS only — confirm each against the vision/contract docs before reporting.\n'
