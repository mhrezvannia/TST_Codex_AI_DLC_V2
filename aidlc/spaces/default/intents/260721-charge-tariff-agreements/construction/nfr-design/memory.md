# NFR Design Memory

## Interpretations

- 2026-07-26T08:50:20Z - Treat U03 as an artifact-only per-unit continuation with no new human design question; its approved NFR inputs, U01 shared Charge posture, and U02 vendor-media boundary already determine every material choice, so re-asking would risk contradictory unit-local policy.

## Deviations

- 2026-07-26T08:50:20Z - Replace the baseline relay's hard-coded five-minute retry deferral in the design; codebase-memory and Graphify show a five-second scheduler and 50-row batch but a five-minute retry next-at, which cannot satisfy U03's approved 100-event recovery within 120 seconds.

## Tradeoffs

- 2026-07-26T08:50:20Z - Separate outbox claim, broker publication, and outcome marking; short database transactions plus bounded ten-way publication preserve command-pool capacity and at-least-once recovery without holding a Charge transaction across Kafka acknowledgements.

- 2026-07-22T09:24:00Z — Prefer bounded fail-closed dependency calls over a new circuit-breaker/retry layer; the two-second deadline and per-dependency permits bound resource use without replaying mutations or serving stale commercial authority, while a later breaker requires measured need.
- 2026-07-22T10:02:00Z — Keep Charge BFF forwarding as a small compile-time-policy layer over native fetch; a 20-permit semaphore and decoded-stream bounds contain overload without adding a gateway/proxy SDK, queue, cache, or client state framework.

## Open questions

## U04 pricing provider and manual cases

- 2026-07-26T09:35:00Z - Evolve the current receipt/case ports rather than add a
  service: store exact terminal bytes/status/content type, add monotonic fencing,
  and create-or-get one canonical OPEN case.
- 2026-07-26T09:35:00Z - Keep candidate resolution and serialization outside
  short claim/completion transactions. A 10-second lease permits recovery while
  owner-plus-fence compare-and-set prevents a paused old owner from committing.
- 2026-07-26T09:35:00Z - No open question remains because upstream fixes
  separate scenario measurements, 20 contention rounds, 100k/10k fixtures,
  RPO 0, 120-second recovery, and the existing-stack boundary.
- 2026-07-26T09:55:00Z - Review iteration one fixed candidate consistency at a
  bounded `REPEATABLE READ` snapshot, aligned replay to stored status/body with
  derived content type, normalized manual ordering to opened-time DESC NULLS
  LAST then case ID ASC, and made canonical request-hash disclosure explicit.

## U05 booking consumption and repricing

- 2026-07-26T10:15:00Z - Preserve bilateral durable receipts with two public
  Booking transaction beans and the Charge call strictly between them.
- 2026-07-26T10:15:00Z - Separate pricing sequence/fingerprint authority from
  general revision: pricing changes retire the old key; revision-only changes
  allow same-key higher-fence replay while preserving newer non-pricing state.
- 2026-07-26T10:15:00Z - UI/UX guidance reinforced the binding existing Booking
  pricing region, server-rendered bounded reads, focused local interaction,
  stable skeleton/pending states, explicit Previous/Legacy evidence, and no
  shell/shared-UI redesign.
- 2026-07-26T10:30:00Z - U05 review iteration one fixed exact resilience
  predicates, half-open rejection due at probe-start plus five seconds,
  timeout cancellation/resource release, and direct end-to-end percentile
  authority rather than additive percentile arithmetic.

## U06 isolated acceptance and preservation

- 2026-07-26T11:00:00Z - Treat U06 as a non-deployable append-only evidence
  harness: wrapper-only runtime mutation, streamed/atomically hashed artifacts,
  closed matrices, and manifest-derived technical status.
- 2026-07-26T11:00:00Z - FAILED/BLOCKED runs are immutable; a later attempt
  receives a new run ID and link. Technical PASSED cannot satisfy the human
  AI-DLC gate.
- 2026-07-26T11:00:00Z - UI guidance is limited to live acceptance of the
  existing shared LinerCore shell/pages. Marketing gateway, remote-font, palette,
  shell, and new-component suggestions were rejected as outside U06 ownership.
- 2026-07-26T11:30:00Z - U06 review iteration one required crash-consistent
  framed ledger/manifest recovery, entry-level safe trace repackaging, an exact
  closed acceptance registry, Windows reparse/hardlink/path guards, guarded
  source-safe restore targeting, and exactly 100 calls per performance set.

## Review corrections

- 2026-07-26T09:30:00Z - U03 review iteration one required a closed relay
  recovery proof, an implementable Charge-local relay state/fencing protocol,
  a distinct dependency-fault timing suite, and an explicit BFF-to-service JWT
  trust boundary. The design now fixes numeric bounds and confines relay change
  blast radius without changing U01-owned migrations or other producers.
- 2026-07-26T12:00:00Z - The NFR gate request-changes loop closed U03's final
  four findings: fixed upstream workload populations; a U02-issued 30-second
  HMAC request assertion with no token exchange; reserved U03 relay eligibility;
  and typed retry/permanent classification with eight-attempt exhaustion.
