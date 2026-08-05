# Functional Design Memory

## Interpretations

- 2026-07-22T05:12:05Z — U05 keeps existing `BookingStatus` as lifecycle/compatibility state and adds independent `PricingStatus`; pre-price corrections remain VALIDATED while post-confirm pricing changes remain AMENDED through Reprice until guarded Reconfirm.
- 2026-07-22T05:12:05Z — U05 reuses and additively extends `booking_idempotency` for a server-derived `P|bookingRef:amendmentSeq` local PRICE receipt with lease/fence and retryable-vs-terminal outcomes; the browser token remains compatibility input only.
- 2026-07-22T05:12:05Z — A complete all-enrichment-absent legacy provider 200 uses the unchanged embedded flattened snapshot path and `LEGACY_PRICED`; partial enrichment is malformed and no legacy result is counted as W2 proof.
- 2026-07-22T04:54:06Z — U05 separates general Booking revision from `pricingAmendmentSeq`; only a changed canonical provider-input fingerprint advances the latter and the exact Charge key is `bookingRef:pricingAmendmentSeq`, with provider bookingRef supplied by immutable Booking number.
- 2026-07-22T04:54:06Z — Requested departure is persisted typed Booking input and may be amended inside the existing Booking pricing region; legacy rows stay readable but pricing rejects a missing date without server-clock fallback.
- 2026-07-22T04:54:06Z — The new typed snapshot table is authoritative only for W2 successes; an embedded flattened legacy price remains an explicit read-only legacy history entry and is never backfilled into synthetic lines.
- 2026-07-21T21:48:06Z — Functional Design is a six-unit engine-driven loop; each unit receives its own artifact set and one human gate follows only after all six sets exist.
- 2026-07-21T21:48:06Z — U01 owns the complete Charge V1-V4 Flyway file chain, but only rate-authority behavior is implemented by U01; agreement and terminal-pricing behavior remain owned by U03 and U04.
- 2026-07-21T21:48:06Z — The current Charge UI is a hardcoded walking-skeleton workbench; U01 replaces only its rate route surface and consumes the existing shared shell and `@erp/ui` contract.

## Deviations

- 2026-07-22T05:19:25Z — U05 architecture review iteration 2 is READY after in-place reconciliation; no iteration 3 was created. Direct required-section and upstream-coverage scripts pass, while linter/type-check are inapplicable because Functional Design produced no TS/JS source files.
- 2026-07-22T05:12:05Z — U05 architecture review iteration 1 was NOT-READY and is preserved; five blockers were remediated with an exact lifecycle matrix, confirmation guard, concrete Spring transaction collaborators/local receipt, live legacy-result path, and exact Booking HTTP/BFF mapping.
- 2026-07-22T04:54:06Z — The U05 interaction-mode prompt expired without a selection; three answers were recovered from binding approved upstream contracts and then explicitly confirmed by the user before artifact generation, without inferring a standing autonomy grant.
- 2026-07-21T21:48:06Z — The native Bun runtime cannot execute the checked-in `.codex/tools` tree because process creation returns `EPERM`; the byte-copied `.aidlc-runtime-shadow` remains the explicit recovery runtime for deterministic engine operations.
- 2026-07-21T21:48:06Z — Docker/demo-guard acceptance remains unobserved because this sandbox cannot access the Docker process/named pipe; no release PASS is inferred.
- 2026-07-21T21:48:06Z — The sensor dispatcher emitted paired advisory rows with `script-error: exit-undefined` because its Bun child-process seam is impaired; direct deterministic scripts were therefore run for substantive results. All U01 required-section and upstream-coverage checks passed after the binding domain-entity headings were applied; linter/type-check have no matching code output in this design stage.

## Tradeoffs

- 2026-07-22T05:12:05Z — No pricing outbox event is invented because the brownfield pricing path has none and U05 does not require one; Booking state/snapshot/evidence, audit, and local PRICE receipt are the atomic completion set.
- 2026-07-22T05:12:05Z — Local outage/circuit receipts are RETRYABLE rather than terminal so Booking-local evidence cannot permanently shadow a later same-key Charge retry; provider-owned success/no-rate/ambiguity remains terminal.
- 2026-07-22T04:54:06Z — Price/Reprice freezes input, performs the Charge call outside a Booking transaction, then locks/reloads and verifies revision/sequence/fingerprint before an atomic local append; this avoids holding a database transaction across HTTP while rejecting stale completion.
- 2026-07-22T04:54:06Z — New W2 itemisation lives only in append-only `booking_pricing_snapshots`; mutable Booking state retains a current request pointer and evidence so history is not duplicated inside the aggregate snapshot.
- 2026-07-22T04:54:06Z — Booking UI change is limited to its existing pricing region because the vertical slice requires Booking-visible truth; no Booking route/shared shell/design-system ownership is expanded.
- 2026-07-21T21:48:06Z — Prefer explicit version records, transaction-scoped advisory locking, and stable read models over extending the legacy snapshot-as-authority pattern.
- 2026-07-21T21:48:06Z — Keep route/query/form state local because RTK is absent and the approved frontend standard prohibits introducing it for this slice.
- 2026-07-21T21:48:06Z — A Charge-local focus wrapper may close DS-01 locally; DS-02 and DS-03 remain W2-02 integration dependencies and are not recast as PASS.
- 2026-07-21T21:48:06Z — A single Draft per stable Rate removes branch-selection ambiguity while preserving immutable Approved history and explicit successor correction.
- 2026-07-21T21:48:06Z — Authority overlap is classified as HTTP 409 because an otherwise valid command conflicts with an existing/concurrently approved authority; semantic input/lifecycle failures remain 422.
- 2026-07-21T21:48:06Z — Administrative lifecycle presentation defaults optional `asOf` to the server UTC calendar date and echoes it; this does not weaken pricing's strict `requestedDepartureDate` rule.

## Open Questions

- 2026-07-22T05:19:25Z — U05 has no remaining reviewer finding; implementation must follow the READY iteration-2 receipt/lifecycle/legacy/HTTP contract exactly.
- 2026-07-22T04:54:06Z — U05 has no unresolved functional-design question; live Docker, Playwright, manager-guard, and audit evidence remain U06 work and are not claimed here.
- 2026-07-21T21:48:06Z — U01 has no unresolved functional-design ambiguity; DS-02/DS-03 and Docker/live-acceptance availability remain external gates, not U01 design questions.
