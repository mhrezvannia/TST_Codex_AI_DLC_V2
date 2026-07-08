# Security Test Instructions - Shared Platform MVP

## Scope and Inputs

Security checks trace to the `security-design.md` and code-generation summaries for U02, U03, U05, U06, U08, U09, and U10. The key controls are fail-closed authorization, server-side BFF boundaries, no browser-visible tokens, no production-like seed secrets, package policy enforcement, and sensitive-log masking.

## Commands

Run deterministic local security and policy checks:

```powershell
node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/evidence.json
node scripts/validate-contract-catalog.mjs
node scripts/seed-local.mjs --dry-run --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json
node node_modules/eslint/bin/eslint.js apps packages scripts eslint.config.mjs vitest.config.ts
```

Run focused source scans:

```powershell
rg -n "localStorage|sessionStorage|http://|https://|charge-service|booking-service|container-movement" apps/reference-data
rg -n "password|token|secret|credential|authorization|cookie" packages/utils/src packages/auth/src apps/auth/lib apps/auth/app/api
```

Interpretation:

| Scan | Expected result |
| --- | --- |
| Reference-data browser/runtime scan | No direct backend URLs, browser storage, or downstream runtime references in production source. |
| Auth/security keyword scan | Matches are allowed only where code is intentionally handling, redacting, masking, or clearing sensitive values. |
| Quality-gate policy checks | Package-manager and backend domain purity gates pass. |
| Seed validation | Committed seed pack remains local-only and contains no real credentials. |

On a CI runner, add dependency and SAST scans:

```powershell
corepack yarn npm audit --all
mvn -f services/pom.xml org.owasp:dependency-check-maven:check
```

## Expected Security Coverage

| Control | Expected evidence |
| --- | --- |
| Fail-closed authorization | U02/U03 Java tests pass on Maven host; frontend mutation controls remain disabled without permissions. |
| Token and secret handling | Auth helpers redact token-like values; session BFF returns safe summaries only. |
| Sensitive logging | `maskSensitiveFields` and `structuredLog` tests pass. |
| Contract and downstream scope guard | Contract validator passes and no downstream Charge, Booking, or Container Movement runtime is introduced. |
| Local-only seed data | Seed README and validator confirm fictional/local seed behavior. |

No high or critical security findings should remain open before release readiness.
