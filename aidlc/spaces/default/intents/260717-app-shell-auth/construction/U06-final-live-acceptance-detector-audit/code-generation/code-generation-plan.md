# Code Generation Plan - U06 Final Live Acceptance Detector Audit

## Unit Scope

U06 adds deterministic evidence packaging for W2-01 final acceptance. The code-generation slice must create a package writer/validator that emits the required files under `artifacts/w2-01-live/app-shell-auth/`, runs or records detector/audit command outputs, and produces an honest `BLOCKED` package when live Compose/browser proof has not been executed. It must not claim PASS without live subject/correlation evidence.

Traceability: Acceptance Criteria 1-11; US-02 and US-04; NFR-03, NFR-04, NFR-07, NFR-08, NFR-10.

## Plan Steps

- [x] Step 1: Evidence package script. Add `scripts/w2-01-live-acceptance.mjs` following existing Node `.mjs` script conventions, with package creation, command capture, detector 6d scan, redaction, and validation exports. Traceability: AUDIT-01 through AUDIT-05.
- [x] Step 2: Required package files. Ensure the script writes `manifest.json`, `runtime-readiness.json`, `scenarios.jsonl`, `actor-evidence.jsonl`, `sign-out-evidence.json`, `compatibility-preservation.md`, `detector-6d.txt`, `erp-fidelity-audit.txt`, `aidlc-audit.txt`, `blockers.jsonl` when blocked, and `final-decision.md`. Traceability: Evidence Package Shape.
- [x] Step 3: Honest blocked mode. Implement `--dry-run`/default non-live-safe behavior so missing live Compose/browser proof creates a separate W2-01 blocker with required fields and keeps W1 waiver explicit as BLOCKED at `compose-start`, not PASS. Traceability: BLOCK-01 through BLOCK-05.
- [x] Step 4: Detector/audit command handling. Implement detector 6d zero-hardcoded-auth scan over mounted shell/Booking surfaces and command result records for `erp-fidelity-audit` and `aidlc-audit`, redacting token/secret/cookie values. Traceability: AUDIT-01, AUDIT-02, AUDIT-03; NFR-03.
- [x] Step 5: Validation tests. Add `scripts/w2-01-live-acceptance.test.mjs` proving required files, JSON/JSONL parseability, blocker linkage, W1 waiver wording, detector 6d zero-hit classification, and redaction. Traceability: Verification Design.
- [x] Step 6: Package script entry. Add root package scripts for dry-run/package generation and validation without altering existing W0/W1 scripts. Traceability: deployment architecture; preservation rules.
- [x] Step 7: Verification commands. Run the new Node tests, dry-run package generation, validation, shell/auth/Booking smoke tests if needed, prohibited-library/local-user scans, and `docker compose config --quiet`. Traceability: stage sensors and U06 DoD.
- [x] Step 8: Code summary. Write `code-summary.md` listing files changed, package shape, test results, deviations, and final live-proof handoff notes. Traceability: stage output contract.

## Non-Goals

- Do not substitute unit tests, dry-run output, screenshots, or container startup for final live actor/audit evidence.
- Do not add a runtime service, database, queue, cloud deployment, CDN, or managed observability.
- Do not migrate reference-data, charge agreement, or container movement screens.
- Do not rewrite W1's live-proof waiver from BLOCKED at `compose-start` into PASS.

## Planned Verification

| Check | Command |
| --- | --- |
| U06 script tests | `node --test scripts/w2-01-live-acceptance.test.mjs` |
| Dry-run package generation | `node scripts/w2-01-live-acceptance.mjs --dry-run --output-root artifacts/w2-01-live/app-shell-auth` |
| Package validation | `node scripts/w2-01-live-acceptance.mjs --validate --output-root artifacts/w2-01-live/app-shell-auth` |
| Shell/auth/Booking smoke | Focused existing JS tests as needed |
| Prohibited patterns | `rg` scans for prohibited frontend libraries and protected-path `local-user` |
| Compose validation | `docker compose config --quiet` |
