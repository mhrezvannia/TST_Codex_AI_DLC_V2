# Code Generation Plan - UOW-10 Local Readiness, Smoke, and Quality Evidence

## Scope

Provide one local readiness command that distinguishes passed code checks from blocked runtime prerequisites.

## Steps

- [x] Step 1: Add a readiness aggregator for prerequisite, seed, contract, frontend, auth, script, and live-service checks. Traceability: FR-004, NFR-003.
- [x] Step 2: Classify missing services and local toolchain gaps as `blocked` instead of generic failed tests. Traceability: NFR-006.
- [x] Step 3: Write readiness evidence to `artifacts/readiness/local-readiness.json`. Traceability: NFR-004.
- [x] Step 4: Add tests for blocked-versus-failed readiness classification. Traceability: NFR-003.
- [x] Step 5: Add `readiness:local` package script. Traceability: FR-004.
- [x] Step 6: Run the full readiness command and record current status. Traceability: NFR-004.

## Review

READY: local readiness is now executable and reports current runtime blockers without hiding code-check success.
