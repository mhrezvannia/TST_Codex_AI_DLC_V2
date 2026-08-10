# Security Requirements - U03 Authorized Degraded Journey Access

## Source Alignment

The security boundary implements U03 `business-logic-model.md` and
`business-rules.md`, preserves `requirements.md`, and stays within
`technology-stack.md`'s existing Identity, Reference Data, Spring, and Next
stack. No new identity provider or cache is introduced.

## Authorization and Disclosure

- Every request requires a verified subject and fresh singular
  `AuthorizationPort.evaluate` calls: read before repository access, then an
  optional capture capability hint; every POST evaluates capture again.
- DENY is HTTP 403 `CMM_AUTHORIZATION_DENIED` with one safe denial audit and no
  protected lookup or CMM business row. Identity failure is HTTP 503
  `IDENTITY_DEPENDENCY_UNAVAILABLE`, fails closed, and writes only safe
  correlated logs/metrics.
- Reference Data failure may return authorized persisted facts only as
  `freshness=last-known`, with capture disabled; capture itself returns HTTP 503
  `REFERENCE_DATA_UNAVAILABLE` before idempotency and writes no CMM row.
- Error envelopes contain code, correlation, retryability, guidance, and no
  tokens, provider URLs, raw payloads, stack traces, or protected data.

## Threat and Abuse Checks

The acceptance proof covers spoofed actor fields, privilege escalation through
disabled controls, stale authorization reuse, repository-before-authorization
access, dependency fail-open, correlation leakage, replayed Retry, and bounded
concurrent denial traffic. UI controls are hints only and never authority.

