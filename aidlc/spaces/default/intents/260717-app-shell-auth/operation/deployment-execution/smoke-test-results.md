# Smoke Test Results - W2-01 App Shell and Auth

## Upstream Inputs

These smoke results consume `cd-config`, `deployment-strategy`, `environment-inventory`, and `build-test-results`.

## Smoke Status

| Smoke test | Status | Reason |
| --- | --- | --- |
| Unauthenticated `/` redirects to login/auth | PASS | Browser reached Keycloak through Nginx |
| Allowed actor lands in shell | PASS | OIDC subject `local.booking.user` observed |
| Booking create/detail uses real subject | PASS | Create, validate, price, and confirm audit rows match session subject |
| Denied actor sees denied surface inside shell | PASS | `local.reference.admin` receives Identity-backed denial |
| Sign-out clears session and stale call fails closed | PASS | Cookie cleared, reauthentication required, stale call returned 401 |
| `/bookings*` compatibility routes preserve canonical shell behavior | PASS | Three 308 redirects observed |
| Detector 6d live acceptance | PASS | Zero hardcoded-auth hits in mounted surfaces |
| `erp-fidelity-audit` | PASS | Explicit Git Bash invocation exited `0`; output captured in the evidence package |
| `aidlc-audit` | PASS | Explicit Git Bash invocation exited `0`; output captured in the evidence package |

## Automated Pre-Smoke Evidence

| Evidence | Status |
| --- | --- |
| Frontend/shared package tests | PASS in `build-test-results` |
| Backend targeted authorization tests | PASS in `build-test-results` |
| Compose static config | PASS |
| W2-01 evidence package schema | PASS |
| W2-01 evidence package validation | PASS with `--require-pass`; final decision is PASS |

## Result

All browser smoke scenarios and required audits PASS, so the W2-01 package is accepted. This is separate from W1-01's live-proof waiver, which remains BLOCKED at compose-start and is not a W2-01 PASS.
