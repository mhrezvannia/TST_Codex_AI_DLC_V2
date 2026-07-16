# Security Requirements - U07 Live Release Acceptance

## Runtime and Supply Chain Controls

- Compose uses pinned/locked source dependencies and images; no dependency downgrade or trust bypass hides online build/TLS failure.
- Local HTTP identity is exactly `X-LinerCore-Service-Id` plus target-specific environment token with fixed roles; BFF sets `X-LinerCore-Actor-Id: local-user`; replay uses separate `LOCAL_REPLAY_TOKEN`. Tests prove constant-time validation, browser non-override, and redaction.
- `AUTH_MODE=local` and PLAINTEXT/no-ACL Kafka/SR are permitted only on the isolated Compose bridge under Spring `local`. Every non-local profile fails startup pending W2-01 JWT/RS256/TLS/Kafka ACL implementation; noop messaging is always blocking.
- Local schema-subject retirement verifies disposable-local endpoint/legacy fingerprints and cannot target non-local registries.
- Browser/API/messaging negative tests cover authorization, validation, redaction, replay permission, and direct-service boundary violations.

## Evidence Protection

Run artifacts redact credentials, tokens, connection strings, environment secrets, customer PII, unrestricted payloads, and stack traces. Evidence files have SHA-256, producing command/time, access classification, and unique run ID. PASS requires a detached Ed25519 signature made with an external private key, verified with the checked-in public key, and stored as a sibling attestation outside the run directory. The private key must never enter logs or the workspace; missing signing material fails closed. Backups/traces are stored only under the controlled workspace and are not committed when sensitive.

Both audit detector suites, secret/static/dependency scans available in the repository, and safe-log assertions are blocking.

## Source Coverage

Controls aggregate U07 `business-logic-model.md`, `business-rules.md`, and security/privacy NFRs in `requirements.md` across `technology-stack.md`.
