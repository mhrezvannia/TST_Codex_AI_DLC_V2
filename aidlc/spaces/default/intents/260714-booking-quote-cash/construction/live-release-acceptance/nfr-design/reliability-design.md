# Reliability Design - U07 Live Release Acceptance

## Fail-Fast Run State Machine

Run states are PRECHECK, SCHEMA, START, SEED, JOURNEY, NEGATIVE, PERFORMANCE, REPLAY_RESTART, ACCESSIBILITY, QUALITY, AUDITS, INDEX, PASSED/FAILED. Each step records result before transition; failure writes manifest and stops dependent claims while preserving diagnostics. Rerun creates new ID.

Readiness is bounded and component-specific. Database volumes are never reset; migration/backup hashes and sequential restarts/replays prove existing-volume durability. Topic/DB/UI evidence cross-checks IDs. The finalizer fsyncs artifacts, computes the canonical manifest/Merkle root, verifies the detached Ed25519 attestation, marks the run directory read-only, and records evidence plus attestation in a dedicated Git commit and annotated `w1-01-live/<runId>` tag. Only then may the final verifier assert every requirement has direct hashed evidence and zero failing/missing commands before PASSED. Interrupted or unsigned finalization remains FAILED and a rerun receives a new ID.

## Source Coverage

Design implements `reliability-requirements.md` with `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and U07 `business-logic-model.md`.
