# NFR Requirements Questions - U09 Local Seed Compose

## Source Trace

This question record derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

## Q1. Reproducibility target

What is U09's primary NFR target?

A. Deterministic local and CI seed data plus Docker Compose startup sufficient for tests, frontend development, and smoke validation (recommended)
B. Production migration and master-data loading
C. Manual setup instructions only
X. Other (please specify)

[Answer]: A. Deterministic local/CI reproducibility (Recommended)

## Q2. Seed idempotency

How should repeat seed runs behave?

A. Running the same seed pack twice must create no duplicates and report skipped/current counts on the second run (recommended)
B. Clear and reload all data every time
C. Permit duplicates if tests can filter them
X. Other (please specify)

[Answer]: A. Idempotent repeat runs (Recommended)

## Q3. Seed data safety

What data safety posture applies?

A. Fictional local-only users/data; Confidential/Restricted treatment where PII, commercial, or authorization sensitivity exists; no production credentials (recommended)
B. Use real-like employee/customer data
C. Safety controls only in production
X. Other (please specify)

[Answer]: A. Local-only safe seed data (Recommended)

## Q4. Compose health behavior

How should seed loading interact with runtime health?

A. Wait for required service health, fail fast after timeout with diagnostics, and keep optional observability profile from blocking core smoke checks (recommended)
B. Start immediately and retry indefinitely
C. Ignore dependency health
X. Other (please specify)

[Answer]: A. Health-gated bounded startup (Recommended)

## Q5. Open trade/permission details

How should unresolved final seed values be handled?

A. Use configurable defaults that prove behavior without hard-coding final trade footprint or final role-permission matrix (recommended)
B. Pick permanent values now
C. Block all seed design
X. Other (please specify)

[Answer]: A. Configurable defaults (Recommended)

## Ambiguity Analysis

- `requirements.md` fixes deterministic seed data and Docker Compose local reproducibility.
- Exact trade lanes, operating sites, and final role-permission matrix remain open; U09 must keep them replaceable.
- No follow-up question is needed because U09 can define deterministic mechanics without final commercial values.

