# Reliability Design - U02 Reference Validation

## Evaluate Then Apply

Application captures revision/fingerprint in a short read, evaluates provider outside DB transaction, then calls proxied transactional apply with compare-and-set/lock. Stale result returns conflict; complete valid/blocked result replaces snapshot atomically. Provider unavailable writes safe attempt audit only and preserves business state.

No automatic retry/circuit hides provider truth. Explicit UI Retry runs a fresh request. Not-started fan-out tasks are cancelled after terminal failure or the 2-second request deadline. In-flight synchronous calls rely on the 500 ms connect/1.5 s request timeout, and their late responses are discarded using request-generation and Booking-fingerprint checks rather than presumed thread interruption.

The executor is a managed bean: shutdown rejects new validations, waits up to 2 seconds for accepted work, then calls `shutdownNow`; any remaining late result cannot be applied. Liveness stays independent of Reference Data; readiness reports configured identity/client, while detail remains available during provider outage. Restart mid-evaluation leaves no partial state.

## Source Coverage

Design implements `reliability-requirements.md` with `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and U02 `business-logic-model.md`.
