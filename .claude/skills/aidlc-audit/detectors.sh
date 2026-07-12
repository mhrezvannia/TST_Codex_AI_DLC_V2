#!/usr/bin/env bash
# aidlc-audit detectors — mechanical leads for the failure classes AI-DLC/Codex
# output tends to hide behind a green build. Every hit is a LEAD, not a verdict:
# confirm each by reading the code. Uses ripgrep (rg) if present, else grep.
set -uo pipefail
ROOT="${1:-.}"
cd "$ROOT" || exit 1
# Exclude generated graphs, deps, and the audit's own output so hits are real source leads.
EXC='--glob=!**/graphify-out/** --glob=!**/node_modules/** --glob=!**/*.tsbuildinfo --glob=!**/codex-review-findings.md'
if command -v rg >/dev/null 2>&1; then S(){ rg -n $EXC "$@"; }; else S(){ grep -rnE --exclude-dir={graphify-out,node_modules,.git} "$@" 2>/dev/null; }; fi
hr(){ printf '\n=== %s ===\n' "$1"; }

hr "1. Placeholder / no-op / stub adapters (are these wired into prod? is there a real sibling?)"
S -g '!*/test/*' -g '!*.md' 'class\s+(Placeholder|Noop|NoOp|Stub|Fake|Dummy)\w+' 2>/dev/null || echo "  none found"

hr "1b. Where placeholder beans are instantiated (check the profile — should be local-only)"
S 'new\s+(Placeholder|Noop|NoOp|Stub|Fake)\w+\(' 2>/dev/null || echo "  none found"

hr "2. Gates that 'verify/validate' by existence only (includes/existsSync/!== undefined)"
S -g '*verify*' -g '*validate*' 'includes\(|existsSync\(|!== undefined|!= null && ' 2>/dev/null || echo "  none found"

hr "3. Outbox producers (enqueue) — each needs a relay AND a scheduler draining it"
echo "-- enqueue sites:"; S 'outbox\.enqueue|\.enqueue\(' 2>/dev/null || echo "  none"
echo "-- relay methods (drain the outbox):"; S 'publishOutboxBatch|claimAvailable|OutboxRelay|OutboxDispatcher|drainOutbox' 2>/dev/null || echo "  none — outbox may be write-only"

hr "4. Schedulers / background workers (without one, relays never run in prod)"
S '@Scheduled|@EnableScheduling|ScheduledExecutorService|@Component.*Scheduler' 2>/dev/null || echo "  NONE — no background dispatch exists"

hr "5. Async event contracts vs. synchronous delivery of the same event (drift)"
echo "-- events declared async in contracts/docs:"; S -g '*.md' -g '*.yaml' 'async|Kafka|topic|channel' contracts docs 2>/dev/null | head -20
echo "-- direct HTTP calls that may be delivering those 'events':"; S 'postForObject|restTemplate\.|WebClient|HttpClient|fetch\(.*confirmed|/booking-confirmed' 2>/dev/null | head -20

hr "6. State-change + outbox paths lacking a transactional boundary"
echo "-- @Transactional usages (expect these around save+enqueue):"; S '@Transactional' 2>/dev/null || echo "  NONE — dual-write hazard likely"

hr "7. Definition-of-done: was live E2E actually run?"
S -g '*.md' '\[ \].*(smoke|e2e|end-to-end|live|Docker)|Docker.*not.*run|intentionally not run' 2>/dev/null || echo "  no unchecked live-E2E markers found (verify manually)"

printf '\nDone. Each section lists LEADS. Confirm every hit against the source before reporting.\n'
