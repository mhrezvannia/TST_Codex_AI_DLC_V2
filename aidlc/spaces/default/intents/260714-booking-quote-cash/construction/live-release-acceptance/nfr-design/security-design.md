# Security Design - U07 Live Release Acceptance

## Preflight and Evidence Controls

Preflight allow-lists local registry/broker/ports/profiles, validates non-default PostgreSQL 55432, real adapters, isolated network, service/replay token presence, non-local fail-closed tests, dependency locks and schema fingerprints. Redaction library filters environment, commands, HTTP/Kafka headers, payload/PII and connection strings before evidence write.

Each run is built in a staging directory with a unique ID; every item stores producer command/time/SHA-256/classification. The finalizer computes a canonical manifest and Merkle root, then creates a detached Ed25519 signature using the private key referenced by `W1_EVIDENCE_SIGNING_KEY_PATH`. The private key remains outside the workspace and is never copied or logged. The checked-in public key verifies a sibling `artifacts/w1-01-live-attestations/<runId>.json`; the attestation is not stored inside the mutable run directory. A missing or invalid external signing key makes PASS impossible.

After fsync and signature verification, the finalizer marks the run directory read-only as an operational guard, commits the evidence and detached attestation in a dedicated Git commit, and creates annotated tag `w1-01-live/<runId>`. The release verifier checks the detached signature, Git tree object, and tag target. The cryptographic signature is the external trust anchor; filesystem read-only state alone is not treated as tamper-proof. Schema retirement requires local endpoint + exact legacy fingerprint + subject allow-list. Browser boundary/auth/replay/negative tests and both audits are blocking; no script edits detector output or domain DB.

## Source Coverage

Design implements `security-requirements.md` with `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U07 `business-logic-model.md`.
