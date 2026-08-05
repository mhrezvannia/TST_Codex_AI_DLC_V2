# NFR Design Architecture Review

## Review Execution

- The named reviewer could not start because its pinned `openai.gpt-5.4` model is unavailable on the ChatGPT-backed Codex account.
- The approved independent default-agent fallback loaded `.codex/agents/aidlc-architecture-reviewer-agent.md` and reviewed all seven NFR Design unit sets.

## Iteration 1 - Not Ready

| Severity | Finding | Resolution |
|---|---|---|
| Critical | `baseline-on-migrate` could mark an unknown or partial legacy schema as V1 before the guard ran. | Disabled automatic baseline for Booking, Charge, and CMM and specified owner-local pre-migration strategies that permit explicit baseline only after the matching exact checked-in V1 catalog fingerprint succeeds. |
| Major | Reference validation fan-out did not define executor ownership, queue/rejection behavior, semaphore timeout, shutdown, or realistic cancellation. | Added a managed 10-thread/20-queue executor, four-task request cap, fair 10-permit semaphore with 25 ms acquisition, typed overload, bounded shutdown, transport timeouts, and late-result discard semantics. |
| Major | Booking/CMM async bridges lacked exact relay claim, producer timeout, retry ownership, acknowledgement, and DLT behavior. | Added 250 ms relay cadence, atomic batch-50 `SKIP LOCKED` claims, 30-second leases, explicit producer and consumer settings, single-owner retry policies, record acknowledgement after commit, and original-record DLT recovery. |
| Major | Evidence hashes and verdict lived in the same writable run directory without an external trust anchor. | Added an external-key detached Ed25519 attestation, checked-in public-key verification, sibling attestation storage, fsync/read-only finalization, and a dedicated Git commit plus annotated run tag. |

## Iteration 2 - Ready After Correction

The independent fallback reviewer found one critical implementability conflict: `enable.idempotence=true` cannot be combined with producer retries set to zero. The design now sets `retries=1`, bounded inside the same 2-second delivery attempt, and uses a 2.5-second publisher terminal-send wait. Durable cross-send retry state and backoff remain exclusively owned by the outbox.

**READY.** The same independent reviewer performed a targeted rereview and reported no unresolved blockers.
