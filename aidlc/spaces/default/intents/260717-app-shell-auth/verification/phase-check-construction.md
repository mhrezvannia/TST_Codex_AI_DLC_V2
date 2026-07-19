# Phase Check - Construction - W2-01 App Shell and Auth

## Purpose

This verification checks alignment from architecture and unit design through implementation, build/test evidence, and CI gates for the W2-01 vertical slice.

## Upstream Inputs

| Input | Status |
| --- | --- |
| W2-01 intent statement and Context Pack | Consumed |
| U01-U06 code-generation plans and summaries | Complete |
| `construction/build-and-test/build-and-test-summary.md` | Complete |
| `construction/build-and-test/build-test-results.md` | Complete |
| `.github/workflows/quality-gates.yml` | Updated |
| `scripts/run-quality-gates.mjs` and tests | Updated |
| `scripts/w2-01-live-acceptance.mjs` and tests | Updated |

## Alignment Matrix

| Requirement | Construction evidence | Alignment |
| --- | --- | --- |
| One authenticated application shell | `apps/shell` routes, shell layout, protected Booking routes, workflow shell gates | Aligned |
| Reuse existing auth app/session | `apps/auth` local subject/sign-out updates, `packages/auth` cookie/session helpers, CI app-auth/package gates | Aligned |
| Remove hardcoded `local-user` from mounted shell/Booking surfaces | Booking BFF actor hardening, detector 6d source scan, W2-01 live gate | Aligned for code; live proof blocked |
| Backend authorization uses real subject | Booking service identity adapter and targeted Maven tests | Aligned |
| Access denied inside shell | Shell denied panel and app-auth denied actor fixture tests | Aligned |
| Sign-out ends session and stale calls fail closed | Shell sign-out adapter, auth sign-out route, expiry and stale BFF tests | Aligned |
| `/bookings*` compatibility preserved | Shell compatibility routes and U05 tests | Aligned for code; live Nginx observation blocked |
| Prior W0/W1/W2-02 work preserved | No eventing/reference-data/design-system redesign; CI keeps existing W1 gates | Aligned |
| W1 live waiver explicit | U06 final decision and CI docs state `W1-01 live-proof waiver remains BLOCKED at compose-start; not a W2-01 PASS.` | Aligned |

## Verification Results

| Command | Result |
| --- | --- |
| `node --test scripts/w2-01-live-acceptance.test.mjs scripts/run-quality-gates.test.mjs` | PASS, 10 tests |
| `docker compose config --quiet` | PASS |
| `node scripts/w2-01-live-acceptance.mjs --dry-run --output-root artifacts/w2-01-live/app-shell-auth-ci-check` | PASS command, final decision BLOCKED |
| `node scripts/w2-01-live-acceptance.mjs --validate --require-pass --output-root artifacts/w2-01-live/app-shell-auth-ci-check` | FAIL as expected while live proof is blocked |

## Construction Decision

Code construction and CI wiring are aligned with the W2-01 vertical slice. Final intent acceptance remains BLOCKED until the live Compose/Nginx/Keycloak scenarios and both audit detectors produce PASS evidence.
