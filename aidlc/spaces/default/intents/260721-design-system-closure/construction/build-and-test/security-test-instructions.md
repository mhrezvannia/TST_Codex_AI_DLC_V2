# Security Test Instructions — W2-02 Design-System Closure

## Scope and upstream coverage

Security checks apply `booking-design-system-closure/code-generation/code-generation-plan.md`, `booking-design-system-closure/code-generation/code-summary.md`, and the approved security design. They test authenticated shell access, server-derived actor identity, safe BFF errors, same-origin/idempotency rules, redirect/API separation, secret-free evidence, and manager-demo isolation.

## Static and dynamic commands

Run the package tests, `corepack yarn w2-02:test:scripts`, anti-drift, typecheck, lint, and changed-script syntax checks. The live runner performs dynamic authenticated journey checks only on isolated Wave A and runs both audit detectors after cleanup. It must retain W1 as **BLOCKED/WAIVED**.

## Secret and evidence criteria

The trace sanitizer must redact or fail closed on Authorization, Cookie, Set-Cookie, Basic auth, tokens, client secrets, query/form/body secrets, and configured local identities. Raw trace staging is removed. Artifact paths must be canonical, inside the run root, non-linked/non-aliased, present, and SHA-256 verified. A PREPARED envelope is incomplete until the canonical terminal-last record exists.

## Non-claims

No SAST product, dependency CVE scanner, SBOM, DAST scanner, image scanner, cloud security service, TLS/cipher, regulatory, or certification PASS is claimed unless its executable is present and its direct result is recorded.

